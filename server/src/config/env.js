const dotenv = require('dotenv')
const path = require('path')

// Load .env file from server root
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') })

const env = {
  PORT: process.env.PORT || 5000,
  // Directory where the embedded PGlite database stores its files.
  DATABASE_DIR:
    process.env.DATABASE_DIR || path.join(__dirname, '..', '..', 'prisma', '.pglite'),
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  NODE_ENV: process.env.NODE_ENV || 'development',
}

// Validate required variables
const required = ['JWT_SECRET']

for (const key of required) {
  if (!env[key]) {
    console.error(`Missing required environment variable: ${key}`)
    process.exit(1)
  }
}

module.exports = env
