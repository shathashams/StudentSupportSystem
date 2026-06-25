const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const prisma = require('../config/prismaClient')
const env = require('../config/env')

/**
 * Find a user by their email address.
 */
const findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  })
}

/**
 * Compare a plain-text password with a bcrypt hash.
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword)
}

/**
 * Generate a JWT token for the given user.
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  )
}

/**
 * Map Role enum to frontend-friendly display string.
 * STUDENT → "student", SUPPORT → "support"
 */
const mapRoleToFrontend = (role) => {
  return role.toLowerCase()
}

/**
 * Map frontend role string to database enum.
 * "student" → "STUDENT", "support" → "SUPPORT"
 */
const mapRoleFromFrontend = (role) => {
  return role.toUpperCase()
}

/**
 * Register a new student user with a hashed password.
 */
const registerStudent = async ({ name, email, password }) => {
  const hashedPassword = await bcrypt.hash(password, 10)
  return prisma.user.create({
    data: {
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'STUDENT',
    },
  })
}

module.exports = {
  findUserByEmail,
  verifyPassword,
  generateToken,
  mapRoleToFrontend,
  mapRoleFromFrontend,
  registerStudent,
}
