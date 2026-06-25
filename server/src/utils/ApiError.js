/**
 * Custom API error class that carries an HTTP status code.
 * Thrown in services/controllers and caught by the global error handler.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.statusCode = statusCode
    this.name = 'ApiError'
  }

  static badRequest(message) {
    return new ApiError(400, message)
  }

  static unauthorized(message = 'Authentication required.') {
    return new ApiError(401, message)
  }

  static forbidden(message = 'You do not have permission to perform this action.') {
    return new ApiError(403, message)
  }

  static notFound(message = 'Resource not found.') {
    return new ApiError(404, message)
  }

  static conflict(message) {
    return new ApiError(409, message)
  }
}

module.exports = ApiError
