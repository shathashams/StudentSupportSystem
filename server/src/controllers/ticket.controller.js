const ApiError = require('../utils/ApiError')
const ticketService = require('../services/ticket.service')
const { categories, priorities, limits } = require('../constants')

/**
 * GET /api/tickets
 * Student: returns only their own tickets.
 * Support: returns all tickets.
 */
const getTickets = async (req, res, next) => {
  try {
    let tickets

    if (req.user.role === 'STUDENT') {
      tickets = await ticketService.getTicketsByStudentId(req.user.id)
    } else {
      tickets = await ticketService.getAllTickets()
    }

    res.json(tickets)
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/tickets/:id
 * Student: only if they own the ticket.
 * Support: any ticket.
 */
const getTicketById = async (req, res, next) => {
  try {
    const ticketId = parseInt(req.params.id, 10)

    if (isNaN(ticketId)) {
      throw ApiError.badRequest('Invalid ticket ID.')
    }

    const ticket = await ticketService.getTicketById(ticketId)

    if (!ticket) {
      throw ApiError.notFound('Ticket not found.')
    }

    // Students can only view their own tickets
    if (req.user.role === 'STUDENT') {
      if (ticket.studentId !== req.user.id) {
        throw ApiError.forbidden('You can only view your own tickets.')
      }
      
      // Mark support comments on this ticket as read
      await ticketService.markRepliesAsRead(ticketId)
      
      // Update in-memory response so it matches the db update
      ticket.comments = ticket.comments.map(c => {
        if (c.authorRole === 'support') {
          return { ...c, isRead: true }
        }
        return c
      })
    }

    res.json(ticket)
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/tickets
 * Student only: creates a new ticket.
 * The studentId is taken from the JWT (req.user.id), not from the body.
 */
const createTicket = async (req, res, next) => {
  try {
    const { title, description, category, priority } = req.body

    const ticket = await ticketService.createTicket({
      title,
      description,
      category,
      priority,
      studentId: req.user.id, // From JWT, not from request body
    })

    res.status(201).json(ticket)
  } catch (error) {
    next(error)
  }
}

/**
 * PATCH /api/tickets/:id
 * Support only: update status and/or priority.
 */
const updateTicket = async (req, res, next) => {
  try {
    const ticketId = parseInt(req.params.id, 10)

    if (isNaN(ticketId)) {
      throw ApiError.badRequest('Invalid ticket ID.')
    }

    // Check ticket exists
    const existingTicket = await ticketService.getTicketById(ticketId)

    if (!existingTicket) {
      throw ApiError.notFound('Ticket not found.')
    }

    // Only allow status and priority updates
    const { status, priority } = req.body

    if (!status && !priority) {
      throw ApiError.badRequest('At least one of status or priority is required.')
    }

    const updates = {}
    if (status) updates.status = status
    if (priority) updates.priority = priority

    const ticket = await ticketService.updateTicket(ticketId, updates)

    res.json(ticket)
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/tickets/:id/comments
 * Both roles: add a comment to a ticket.
 * Student: only on their own tickets.
 * Support: on any ticket.
 * The authorId is taken from the JWT (req.user.id).
 */
const addComment = async (req, res, next) => {
  try {
    const ticketId = parseInt(req.params.id, 10)

    if (isNaN(ticketId)) {
      throw ApiError.badRequest('Invalid ticket ID.')
    }

    // Check ticket exists
    const existingTicket = await ticketService.getTicketById(ticketId)

    if (!existingTicket) {
      throw ApiError.notFound('Ticket not found.')
    }

    // Students can only comment on their own tickets
    if (req.user.role === 'STUDENT' && existingTicket.studentId !== req.user.id) {
      throw ApiError.forbidden('You can only add comments to your own tickets.')
    }

    const { message } = req.body

    if (!message || !message.trim()) {
      throw ApiError.badRequest('Message is required.')
    }

    if (message.trim().length < limits.reply.min) {
      throw ApiError.badRequest(`Message must be at least ${limits.reply.min} characters.`)
    }

    if (message.trim().length > limits.reply.max) {
      throw ApiError.badRequest(`Message must not exceed ${limits.reply.max} characters.`)
    }

    const ticket = await ticketService.addComment(ticketId, {
      message,
      authorId: req.user.id, // From JWT, not from request body
    })

    res.status(201).json(ticket)
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/tickets/unread-replies
 * Student only: get all unread support comments on their tickets.
 */
const getUnreadReplies = async (req, res, next) => {
  try {
    if (req.user.role !== 'STUDENT') {
      throw ApiError.forbidden('Only students can view unread replies.')
    }

    const unread = await ticketService.getUnreadRepliesForStudent(req.user.id)
    res.json(unread)
  } catch (error) {
    next(error)
  }
}

/**
 * PATCH /api/tickets/:id/student-edit
 * Student only: update title, description, category, priority.
 * Ticket must be OPEN and owned by the requesting student.
 */
const updateTicketByStudent = async (req, res, next) => {
  try {
    const ticketId = parseInt(req.params.id, 10)

    if (isNaN(ticketId)) {
      throw ApiError.badRequest('Invalid ticket ID.')
    }

    const { title, description, category, priority } = req.body

    // Validate at least one editable field is provided
    if (
      title === undefined &&
      description === undefined &&
      category === undefined &&
      priority === undefined
    ) {
      throw ApiError.badRequest(
        'At least one field (title, description, category, priority) is required.',
      )
    }

    // Validate field constraints if provided
    if (title !== undefined) {
      const t = String(title).trim()
      if (t.length < limits.title.min) throw ApiError.badRequest(`Title must be at least ${limits.title.min} characters.`)
      if (t.length > limits.title.max) throw ApiError.badRequest(`Title must not exceed ${limits.title.max} characters.`)
    }

    if (description !== undefined) {
      const d = String(description).trim()
      if (d.length < limits.description.min) throw ApiError.badRequest(`Description must be at least ${limits.description.min} characters.`)
      if (d.length > limits.description.max) throw ApiError.badRequest(`Description must not exceed ${limits.description.max} characters.`)
    }

    if (category !== undefined && !categories.includes(category)) {
      throw ApiError.badRequest(`Category must be one of: ${categories.join(', ')}.`)
    }

    if (priority !== undefined && !priorities.includes(priority)) {
      throw ApiError.badRequest(`Priority must be one of: ${priorities.join(', ')}.`)
    }

    const result = await ticketService.updateTicketByStudent(
      ticketId,
      req.user.id,
      { title, description, category, priority },
    )

    if (result.error === 'NOT_FOUND') {
      throw ApiError.notFound('Ticket not found.')
    }

    if (result.error === 'FORBIDDEN') {
      throw ApiError.forbidden('You can only edit your own tickets.')
    }

    if (result.error === 'NOT_OPEN') {
      throw ApiError.conflict('Only Open tickets can be edited.')
    }

    if (result.error === 'NO_CHANGES') {
      throw ApiError.badRequest('No valid changes were provided.')
    }

    res.json(result.ticket)
  } catch (error) {
    next(error)
  }
}

/**
 * DELETE /api/tickets/:id
 * Student only: permanently delete an Open ticket they own.
 * Returns 204 No Content on success.
 */
const deleteTicket = async (req, res, next) => {
  try {
    const ticketId = parseInt(req.params.id, 10)

    if (isNaN(ticketId)) {
      throw ApiError.badRequest('Invalid ticket ID.')
    }

    const result = await ticketService.deleteTicket(ticketId, req.user.id)

    if (result.error === 'NOT_FOUND') {
      throw ApiError.notFound('Ticket not found.')
    }

    if (result.error === 'FORBIDDEN') {
      throw ApiError.forbidden('You can only delete your own tickets.')
    }

    if (result.error === 'NOT_OPEN') {
      throw ApiError.conflict('Only Open tickets can be deleted.')
    }

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  updateTicketByStudent,
  deleteTicket,
  addComment,
  getUnreadReplies,
}
