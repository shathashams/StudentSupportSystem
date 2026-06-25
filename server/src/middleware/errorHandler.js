/**
 * Global error handler middleware.
 * Catches all errors thrown in routes and sends a clean JSON response.
 */
const errorHandler = (err, req, res, next) => {
  // Default to 500 Internal Server Error
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal server error.'

  // Log the full error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[Error] ${statusCode} - ${message}`)
    if (statusCode === 500) {
      console.error(err.stack)
    }
  }

  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV !== 'production' && statusCode === 500
        ? { stack: err.stack }
        : {}),
    },
  })
}

module.exports = errorHandler
