const fs = require('node:fs')
const path = require('node:path')
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')
const { PGlite } = require('@electric-sql/pglite')

const env = require('./env')
const { startSocketServer } = require('./pgliteSocketServer')

// Embedded PostgreSQL (PGlite) running in-process — no Docker, no separate DB
// server to install. The app owns the single PGlite instance and ALSO exposes it
// over the Postgres wire protocol (localhost:PGLITE_PORT), so Prisma Studio and
// other clients connect to the SAME live database. The app itself talks to that
// port through the pg driver adapter, which keeps all access funneled through one
// place and lets Studio see the app's writes live.
fs.mkdirSync(env.DATABASE_DIR, { recursive: true })

const pglite = new PGlite({ dataDir: env.DATABASE_DIR })

const pool = new Pool({ connectionString: env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const INIT_SQL_PATH = path.join(__dirname, '..', '..', 'prisma', 'init.sql')

let initPromise

function initDb() {
  if (!initPromise) {
    initPromise = (async () => {
      await pglite.waitReady

      // Create the schema on a fresh database (Prisma 7 can't `db push` to PGlite).
      const result = await pglite.query("SELECT to_regclass('public.users') AS reg")
      const alreadyInitialized = result.rows[0] && result.rows[0].reg
      if (!alreadyInitialized) {
        await pglite.exec(fs.readFileSync(INIT_SQL_PATH, 'utf8'))
      }

      // Expose the embedded database so the app + Prisma Studio share live data.
      await startSocketServer({ pglite, port: env.PGLITE_PORT, host: '127.0.0.1' })
      console.log(`Database available on 127.0.0.1:${env.PGLITE_PORT} (connect Prisma Studio here)`)

      return prisma
    })()
  }

  return initPromise
}

module.exports = { prisma, pglite, pool, initDb }
