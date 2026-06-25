const ApiError = require('../utils/ApiError')
const authService = require('../services/auth.service')

/**
 * POST /api/auth/login
 * Authenticate user with email, password, and role.
 * Returns JWT token and user info.
 */
const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body

    // Validate required fields
    if (!email || !password || !role) {
      throw ApiError.badRequest('Email, password, and role are required.')
    }

    // Find user by email
    const user = await authService.findUserByEmail(email)

    if (!user) {
      throw ApiError.unauthorized('No account was found with this email address.')
    }

    // Verify password
    const isPasswordValid = await authService.verifyPassword(password, user.password)

    if (!isPasswordValid) {
      throw ApiError.unauthorized('The password is incorrect.')
    }

    // Check role matches
    const expectedRole = authService.mapRoleFromFrontend(role)

    if (user.role !== expectedRole) {
      const displayRole = authService.mapRoleToFrontend(user.role)
      throw ApiError.unauthorized(
        `This account is registered as ${displayRole === 'student' ? 'Student' : 'Support'}.`
      )
    }

    // Generate JWT token
    const token = authService.generateToken(user)

    // Return user info (without password) and token
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: authService.mapRoleToFrontend(user.role),
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/auth/me
 * Return the current authenticated user's info.
 */
const getMe = async (req, res, next) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: authService.mapRoleToFrontend(req.user.role),
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/auth/register
 * Register a new student user.
 * Fields: name, email, password, confirmPassword
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body

    // 1. Validate required fields
    if (!name || !name.trim() || !email || !email.trim() || !password || !confirmPassword) {
      throw ApiError.badRequest('All fields are required.')
    }

    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      throw ApiError.badRequest('Please enter a valid email address.')
    }

    // 3. Validate password length
    if (password.length < 6) {
      throw ApiError.badRequest('Password must be at least 6 characters.')
    }

    // 4. Validate passwords match
    if (password !== confirmPassword) {
      throw ApiError.badRequest('Passwords do not match.')
    }

    // 5. Check if duplicate email
    const existingUser = await authService.findUserByEmail(email)
    if (existingUser) {
      throw ApiError.badRequest('An account with this email address already exists.')
    }

    // 6. Create the user with STUDENT role
    const newUser = await authService.registerStudent({
      name: name.trim(),
      email: email.trim(),
      password,
    })

    // Return 201 Created on success
    res.status(201).json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: authService.mapRoleToFrontend(newUser.role),
      }
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  login,
  getMe,
  register,
}
