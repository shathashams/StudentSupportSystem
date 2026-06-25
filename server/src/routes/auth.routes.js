const { Router } = require('express')
const auth = require('../middleware/auth')
const authController = require('../controllers/auth.controller')

const router = Router()

// POST /api/auth/login - Authenticate user
router.post('/login', authController.login)

// POST /api/auth/register - Register student user
router.post('/register', authController.register)

// GET /api/auth/me - Get current user (requires auth)
router.get('/me', auth, authController.getMe)

module.exports = router
