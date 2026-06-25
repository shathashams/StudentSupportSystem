const { Router } = require('express')
const auth = require('../middleware/auth')
const authorize = require('../middleware/authorize')
const validate = require('../middleware/validate')
const ticketController = require('../controllers/ticket.controller')
const { categories, priorities, limits } = require('../constants')

const router = Router()

// All ticket routes require authentication
router.use(auth)

// GET /api/tickets - Get tickets (student: own, support: all)
router.get('/', ticketController.getTickets)

// GET /api/tickets/unread-replies - Get unread support replies (student only)
router.get('/unread-replies', authorize('STUDENT'), ticketController.getUnreadReplies)

// GET /api/tickets/:id - Get single ticket
router.get('/:id', ticketController.getTicketById)

// POST /api/tickets - Create ticket (student only)
router.post(
  '/',
  authorize('STUDENT'),
  validate([
    { field: 'title', label: 'Title', required: true, minLength: limits.title.min, maxLength: limits.title.max },
    { field: 'description', label: 'Description', required: true, minLength: limits.description.min, maxLength: limits.description.max },
    { field: 'category', label: 'Category', required: true, enum: categories },
    { field: 'priority', label: 'Priority', required: true, enum: priorities },
  ]),
  ticketController.createTicket
)

// PATCH /api/tickets/:id - Update ticket (support only)
router.patch(
  '/:id',
  authorize('SUPPORT'),
  ticketController.updateTicket
)

// POST /api/tickets/:id/comments - Add comment (both roles)
router.post('/:id/comments', ticketController.addComment)

// PATCH /api/tickets/:id/student-edit - Student edits own Open ticket
router.patch(
  '/:id/student-edit',
  authorize('STUDENT'),
  ticketController.updateTicketByStudent,
)

// DELETE /api/tickets/:id - Student deletes own Open ticket
router.delete(
  '/:id',
  authorize('STUDENT'),
  ticketController.deleteTicket,
)

module.exports = router
