// Standalone database server for browsing the embedded PGlite database with
// Prisma Studio / psql / DBeaver WHEN THE APP IS NOT RUNNING.
//
// While the app is running it already serves the database itself (see
// src/config/db.js), so you connect Studio directly to it and do NOT need this.
// Use this only to open the database on its own (app stopped), e.g. `npm run db:serve`.
//
// Usage: node scripts/studio-server.js [--db=PATH] [--port=N] [--host=H]
const path = require('node:path')

require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
const { PGlite } = require('@electric-sql/pglite')
const { startSocketServer } = require('../src/config/pgliteSocketServer')

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
const PORT = Number(args.port || process.env.PGLITE_PORT || 5435)
const HOST = args.host || '127.0.0.1'

async function main() {
  console.log(`Initializing PGlite at ${DB_DIR} ...`)
  const db = new PGlite({ dataDir: DB_DIR })
  await db.waitReady
  console.log('PGlite ready.')

  await startSocketServer({ pglite: db, port: PORT, host: HOST })
  console.log(`PGlite is listening on ${HOST}:${PORT} (database "postgres")`)
  console.log('Connect Prisma Studio / psql / DBeaver to this address.')

  const shutdown = async () => {
    console.log('\nShutting down ...')
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
    'If the app is running (npm run dev), stop it first — it already serves the database, and only one process can open the data folder.'
  )
  process.exit(1)
})
