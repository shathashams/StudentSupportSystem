const ApiError = require('../utils/ApiError')

/**
 * Role-based authorization middleware.
 * Usage: authorize('SUPPORT') or authorize('STUDENT', 'SUPPORT')
 *
 * Must be used AFTER the auth middleware (req.user must exist).
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required.'))
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden('You do not have permission to perform this action.')
      )
    }

    next()
  }
}

module.exports = authorize
