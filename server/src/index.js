const express = require('express')
const cors = require('cors')
const env = require('./config/env')
const { initDb } = require('./config/db')
const errorHandler = require('./middleware/errorHandler')
const authRoutes = require('./routes/auth.routes')
const ticketRoutes = require('./routes/ticket.routes')

const app = express()

// CORS - allow requests from Vite dev server
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173', 'http://localhost:4174'],
    credentials: true,
  })
)

// Parse JSON request bodies
app.use(express.json())

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/tickets', ticketRoutes)

// Global error handler (must be last)
app.use(errorHandler)

// Start server once the embedded database schema is ready
async function start() {
  try {
    await initDb()
    app.listen(env.PORT, () => {
      console.log(`Server running on http://localhost:${env.PORT}`)
      console.log(`Environment: ${env.NODE_ENV}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

start()

module.exports = app
