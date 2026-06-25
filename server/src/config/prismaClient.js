// Shared Prisma client instance (backed by the in-process PGlite database).
// The instance is created in ./db so the PGlite connection and schema bootstrap
// live in one place; everything else keeps importing the client from here.
const { prisma } = require('./db')

module.exports = prisma
