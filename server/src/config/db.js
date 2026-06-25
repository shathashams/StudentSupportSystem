const fs = require('node:fs')
const path = require('node:path')
const { PrismaClient } = require('@prisma/client')
const { PGlite } = require('@electric-sql/pglite')
const { PrismaPGlite } = require('pglite-prisma-adapter')

const env = require('./env')

// Embedded PostgreSQL running in-process via PGlite — no Docker, no separate
// database server. Data is persisted to a local directory so it survives restarts.
fs.mkdirSync(env.DATABASE_DIR, { recursive: true })

const pglite = new PGlite({ dataDir: env.DATABASE_DIR })
const adapter = new PrismaPGlite(pglite)
const prisma = new PrismaClient({ adapter })

// Prisma 7 removed the prisma.config.ts driver-adapter hooks, so `prisma db push`
// can't reach an in-process PGlite database. Instead we apply the schema directly
// to PGlite on startup (only when it hasn't been created yet).
const INIT_SQL_PATH = path.join(__dirname, '..', '..', 'prisma', 'init.sql')

let initPromise

function initDb() {
  if (!initPromise) {
    initPromise = (async () => {
      const result = await pglite.query("SELECT to_regclass('public.users') AS reg")
      const alreadyInitialized = result.rows[0] && result.rows[0].reg

      if (!alreadyInitialized) {
        const sql = fs.readFileSync(INIT_SQL_PATH, 'utf8')
        await pglite.exec(sql)
      }

      return prisma
    })()
  }

  return initPromise
}

module.exports = { prisma, pglite, initDb }
