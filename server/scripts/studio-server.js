// Embedded-PGlite socket server for Prisma Studio / desktop SQL clients.
//
// This is a focused reimplementation of `@electric-sql/pglite-socket` that adds
// the not-yet-released fix from electric-sql/pglite PR #977: it keeps one
// client's extended-query exchange (Parse/Bind/Describe/Execute/Sync) together
// until the backend emits ReadyForQuery, instead of interleaving protocol
// messages from different connections over PGlite's single shared session.
//
// Without that isolation, Prisma Studio (which uses a postgres.js connection
// pool and fires concurrent introspection queries on load) corrupts the unnamed
// prepared-statement state and fails with "Could not load schema metadata" /
// ERR_STREAM_PREMATURE_CLOSE.
//
// Usage: node scripts/studio-server.js [--db=PATH] [--port=N] [--host=H]
const net = require('node:net')
const path = require('node:path')

require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
const { PGlite } = require('@electric-sql/pglite')

const SSL_REQUEST_CODE = 80877103
const STARTUP_PROTOCOL_V3 = 196608
const READY_FOR_QUERY = 0x5a // 'Z'

function parseArgs(argv) {
  const args = {}
  for (const part of argv) {
    const match = /^--([^=]+)=(.*)$/.exec(part)
    if (match) args[match[1]] = match[2]
  }
  return args
}

const args = parseArgs(process.argv.slice(2))
const DB_DIR =
  args.db || process.env.DATABASE_DIR || path.join(__dirname, '..', 'prisma', '.pglite')
const PORT = Number(args.port || 5432)
const HOST = args.host || '127.0.0.1'

/**
 * Returns true if the given backend response buffer contains a ReadyForQuery
 * message, which marks the end of a protocol exchange.
 */
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

/**
 * Serializes protocol messages against the single PGlite session while keeping
 * each connection's extended-query exchange isolated (PR #977 behavior).
 */
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
        // An exchange is in flight — only run more messages from its owner.
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

      // Release the session once this exchange reports ReadyForQuery.
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
      // Resume any work that was waiting behind the departed owner.
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
        // SSL request: reply 'N' (not supported) and continue.
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

        // Startup message (no type byte): int32 length + int32 protocol version.
        if (buffer.length >= 8 && buffer.readInt32BE(4) === STARTUP_PROTOCOL_V3) {
          messageLength = buffer.readInt32BE(0)
          complete = buffer.length >= messageLength
        }
        // Regular message: type byte + int32 length.
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

async function main() {
  console.log(`Initializing PGlite at ${DB_DIR} ...`)
  const db = new PGlite({ dataDir: DB_DIR })
  await db.waitReady
  console.log('PGlite ready.')

  const queue = new QueryQueue(db)
  let nextId = 1
  const connections = new Set()

  const server = net.createServer((socket) => {
    const id = nextId++
    connections.add(id)
    attachConnection(socket, queue, id, () => connections.delete(id))
  })

  server.on('error', (err) => {
    console.error('Socket server error:', err)
    process.exit(1)
  })

  server.listen(PORT, HOST, () => {
    console.log(`PGlite is listening on ${HOST}:${PORT} (database "postgres")`)
    console.log('Connect Prisma Studio / psql / DBeaver to this address.')
  })

  const shutdown = async () => {
    console.log('\nShutting down ...')
    server.close()
    try {
      await db.close()
    } catch {}
    process.exit(0)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main().catch((err) => {
  console.error('Failed to start PGlite socket server:', (err && err.message) || err)
  console.error(
    'If the app is running (npm run dev), stop it first — PGlite allows only one process to open the database.'
  )
  process.exit(1)
})
