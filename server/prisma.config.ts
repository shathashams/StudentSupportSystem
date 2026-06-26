import 'dotenv/config'
import path from 'node:path'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    // The app itself ignores this and talks to PGlite in-process (see src/config/db.js).
    // It is used only by Prisma CLI commands. For `prisma studio`, first run
    // `npm run db:serve` to expose the PGlite data dir on 127.0.0.1:5435, then the
    // URL below connects Studio through that bridge.
    url: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:5435/postgres',
  },
  migrations: {
    seed: 'node prisma/seed.js',
  },
})
