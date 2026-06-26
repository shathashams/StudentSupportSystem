// Exposes a PGlite instance over the PostgreSQL wire protocol so that the app,
// Prisma Studio, and any other client can all share ONE live database.
//
// Includes the not-yet-released fix from electric-sql/pglite PR #977: a client's
// extended-query exchange (Parse/Bind/Describe/Execute/Sync) is kept together
// until the backend emits ReadyForQuery, instead of interleaving protocol
// messages from different connections over PGlite's single shared session.
const net = require('node:net')

const SSL_REQUEST_CODE = 80877103
const STARTUP_PROTOCOL_V3 = 196608
const READY_FOR_QUERY = 0x5a // 'Z'

function containsReadyForQuery(buf) {
  let offset = 0
  while (offset + 5 <= buf.length) {
    const type = buf[offset]
    const len = buf.readInt32BE(offset + 1)
    if (len < 4) break
    if (type === READY_FOR_QUERY) return true
    offset += 1 + len
  }
  return false
}

class QueryQueue {
  constructor(db) {
    this.db = db
    this.queue = []
    this.processing = false
    this.owner = null // handlerId that currently owns the shared session
  }

  enqueue(handlerId, message, onData) {
    return new Promise((resolve, reject) => {
      this.queue.push({ handlerId, message, onData, resolve, reject })
      if (!this.processing) this.processQueue()
    })
  }

  async processQueue() {
    if (this.processing) return
    this.processing = true

    while (this.queue.length > 0) {
      let item
      if (this.owner !== null) {
        const i = this.queue.findIndex((q) => q.handlerId === this.owner)
        item = i === -1 ? null : this.queue.splice(i, 1)[0]
      } else {
        item = this.queue.shift()
      }

      // Owner's next message hasn't arrived yet; wait for the next enqueue.
      if (!item) break

      if (this.owner === null) this.owner = item.handlerId

      const chunks = []
      try {
        await this.db.runExclusive(async () => {
          return await this.db.execProtocolRawStream(item.message, {
            onRawData: (data) => {
              chunks.push(Buffer.from(data))
              item.onData(data)
            },
          })
        })
      } catch (err) {
        this.owner = null
        item.reject(err)
        continue
      }

      // Release the shared session once this exchange reports ReadyForQuery.
      if (containsReadyForQuery(Buffer.concat(chunks))) {
        this.owner = null
      }
      item.resolve()
    }

    this.processing = false
  }

  clearForHandler(handlerId) {
    this.queue = this.queue.filter((q) => {
      if (q.handlerId === handlerId) {
        q.reject(new Error('Handler disconnected'))
        return false
      }
      return true
    })
    if (this.owner === handlerId) {
      this.owner = null
      this.processQueue()
    }
  }
}

function attachConnection(socket, queue, handlerId, onClose) {
  let buffer = Buffer.alloc(0)
  let active = true
  let pumping = false

  socket.setNoDelay(true)

  const cleanup = () => {
    if (!active) return
    active = false
    queue.clearForHandler(handlerId)
    onClose()
  }

  socket.on('data', (data) => {
    buffer = Buffer.concat([buffer, data])
    setImmediate(() => {
      pump().catch(() => {
        try {
          socket.destroy()
        } catch {}
        cleanup()
      })
    })
  })
  socket.on('error', cleanup)
  socket.on('close', cleanup)

  async function pump() {
    if (pumping) return
    pumping = true
    try {
      while (active && buffer.length > 0) {
        if (buffer.length >= 8) {
          const len = buffer.readInt32BE(0)
          const code = buffer.readInt32BE(4)
          if (len === 8 && code === SSL_REQUEST_CODE) {
            if (socket.writable) socket.write(Buffer.from('N'))
            buffer = buffer.subarray(8)
            continue
          }
        }

        let messageLength = 0
        let complete = false

        if (buffer.length >= 8 && buffer.readInt32BE(4) === STARTUP_PROTOCOL_V3) {
          messageLength = buffer.readInt32BE(0)
          complete = buffer.length >= messageLength
        }
        if (!complete && buffer.length >= 5) {
          messageLength = 1 + buffer.readInt32BE(1)
          complete = buffer.length >= messageLength
        }

        if (!complete || messageLength === 0) break

        const message = new Uint8Array(buffer.subarray(0, messageLength))
        buffer = buffer.subarray(messageLength)

        await queue.enqueue(handlerId, message, (resp) => {
          if (active && socket.writable && resp.length > 0) {
            socket.write(Buffer.from(resp))
          }
        })
      }
    } finally {
      pumping = false
    }
  }
}

/**
 * Starts a TCP server that serves the given PGlite instance.
 * Resolves with the net.Server once it is listening.
 */
function startSocketServer({ pglite, port = 5435, host = '127.0.0.1' }) {
  const queue = new QueryQueue(pglite)
  let nextId = 1

  const server = net.createServer((socket) => {
    const id = nextId++
    attachConnection(socket, queue, id, () => {})
  })

  return new Promise((resolve, reject) => {
    const onError = (err) => reject(err)
    server.once('error', onError)
    server.listen(port, host, () => {
      server.removeListener('error', onError)
      resolve(server)
    })
  })
}

module.exports = { startSocketServer, QueryQueue, containsReadyForQuery }
