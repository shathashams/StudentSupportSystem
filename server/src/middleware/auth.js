const jwt = require('jsonwebtoken')
const prisma = require('../config/prismaClient')
const ApiError = require('../utils/ApiError')
const env = require('../config/env')

/**
 * JWT authentication middleware.
 * Extracts the token from the Authorization header,
 * verifies it, finds the user in the database,
 * and attaches the user object to req.user.
 */
const auth = async (req, res, next) => {
  try {
    // Extract token from "Bearer <token>" header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token is missing.')
    }

    const token = authHeader.split(' ')[1]

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET)

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    if (!user) {
      throw ApiError.unauthorized('User no longer exists.')
    }

    // Attach user to request
    req.user = user
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Invalid access token.'))
    }

    if (error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Access token has expired.'))
    }

    next(error)
  }
}

module.exports = auth
