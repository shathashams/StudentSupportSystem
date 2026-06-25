const prisma = require('../config/prismaClient')

// Mapping helpers between database enums and frontend display values
const STATUS_MAP = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
}

const STATUS_REVERSE_MAP = {
  Open: 'OPEN',
  'In Progress': 'IN_PROGRESS',
  Resolved: 'RESOLVED',
  Closed: 'CLOSED',
}

const PRIORITY_MAP = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
}

const PRIORITY_REVERSE_MAP = {
  Low: 'LOW',
  Medium: 'MEDIUM',
  High: 'HIGH',
  Urgent: 'URGENT',
}

/**
 * Format a ticket from the database into the frontend-expected shape.
 * Flattens relations (student.name, author.name/role) into the ticket object.
 */
const formatTicket = (ticket) => {
  return {
    id: ticket.id,
    studentId: ticket.studentId,
    studentName: ticket.student?.name || 'Student User',
    title: ticket.title,
    description: ticket.description,
    category: ticket.category,
    priority: PRIORITY_MAP[ticket.priority] || ticket.priority,
    status: STATUS_MAP[ticket.status] || ticket.status,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    comments: (ticket.comments || []).map((comment) => ({
      id: comment.id,
      authorId: comment.authorId,
      authorName: comment.author?.name || 'Unknown',
      authorRole: comment.author?.role?.toLowerCase() || 'student',
      message: comment.message,
      isRead: comment.isRead,
      createdAt: comment.createdAt.toISOString(),
    })),
  }
}

// Prisma include clause used for ticket queries (loads relations)
const ticketInclude = {
  student: {
    select: { id: true, name: true, email: true, role: true },
  },
  comments: {
    include: {
      author: {
        select: { id: true, name: true, role: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  },
}

/**
 * Get all tickets (for support users).
 */
const getAllTickets = async () => {
  const tickets = await prisma.ticket.findMany({
    include: ticketInclude,
    orderBy: { updatedAt: 'desc' },
  })

  return tickets.map(formatTicket)
}

/**
 * Get tickets belonging to a specific student.
 */
const getTicketsByStudentId = async (studentId) => {
  const tickets = await prisma.ticket.findMany({
    where: { studentId },
    include: ticketInclude,
    orderBy: { updatedAt: 'desc' },
  })

  return tickets.map(formatTicket)
}

/**
 * Get a single ticket by ID.
 */
const getTicketById = async (ticketId) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: ticketInclude,
  })

  if (!ticket) {
    return null
  }

  return formatTicket(ticket)
}

/**
 * Create a new ticket.
 */
const createTicket = async (data) => {
  const ticket = await prisma.ticket.create({
    data: {
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category,
      priority: PRIORITY_REVERSE_MAP[data.priority] || 'MEDIUM',
      status: 'OPEN',
      studentId: data.studentId,
    },
    include: ticketInclude,
  })

  return formatTicket(ticket)
}

/**
 * Update a ticket's status and/or priority (support only).
 */
const updateTicket = async (ticketId, updates) => {
  const data = {}

  if (updates.status) {
    data.status = STATUS_REVERSE_MAP[updates.status]
  }

  if (updates.priority) {
    data.priority = PRIORITY_REVERSE_MAP[updates.priority]
  }

  if (data.status === 'CLOSED') {
    data.priority = 'LOW'
  }

  const ticket = await prisma.ticket.update({
    where: { id: ticketId },
    data,
    include: ticketInclude,
  })

  return formatTicket(ticket)
}

/**
 * Add a comment to a ticket.
 */
const addComment = async (ticketId, data) => {
  await prisma.comment.create({
    data: {
      message: data.message.trim(),
      ticketId,
      authorId: data.authorId,
    },
  })

  // Update the ticket's updatedAt timestamp
  await prisma.ticket.update({
    where: { id: ticketId },
    data: { updatedAt: new Date() },
  })

  // Return the full updated ticket
  return getTicketById(ticketId)
}

/**
 * Get all unread support replies for a student.
 */
const getUnreadRepliesForStudent = async (studentId) => {
  const unreadComments = await prisma.comment.findMany({
    where: {
      isRead: false,
      author: {
        role: 'SUPPORT',
      },
      ticket: {
        studentId: studentId,
      },
    },
    include: {
      author: {
        select: { name: true },
      },
      ticket: {
        select: { title: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return unreadComments.map((comment) => ({
    commentId: comment.id,
    ticketId: comment.ticketId,
    ticketTitle: comment.ticket.title,
    authorName: comment.author.name,
    createdAt: comment.createdAt.toISOString(),
  }))
}

/**
 * Mark all unread support replies on a ticket as read.
 */
const markRepliesAsRead = async (ticketId) => {
  return prisma.comment.updateMany({
    where: {
      ticketId,
      isRead: false,
      author: {
        role: 'SUPPORT',
      },
    },
    data: {
      isRead: true,
    },
  })
}

/**
 * Update a ticket's editable fields (student only).
 * Enforces: ownership, status must be OPEN, whitelist of allowed fields.
 */
const updateTicketByStudent = async (ticketId, studentId, updates) => {
  // Load the raw ticket to check ownership and status
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { id: true, studentId: true, status: true },
  })

  if (!ticket) {
    return { error: 'NOT_FOUND' }
  }

  if (ticket.studentId !== studentId) {
    return { error: 'FORBIDDEN' }
  }

  if (ticket.status !== 'OPEN') {
    return { error: 'NOT_OPEN' }
  }

  // Build safe update — only whitelisted fields, never status or studentId
  const data = {}

  if (updates.title !== undefined) {
    data.title = updates.title.trim()
  }

  if (updates.description !== undefined) {
    data.description = updates.description.trim()
  }

  if (updates.category !== undefined) {
    data.category = updates.category
  }

  if (updates.priority !== undefined) {
    data.priority = PRIORITY_REVERSE_MAP[updates.priority]
  }

  if (Object.keys(data).length === 0) {
    return { error: 'NO_CHANGES' }
  }

  const updated = await prisma.ticket.update({
    where: { id: ticketId },
    data,
    include: ticketInclude,
  })

  return { ticket: formatTicket(updated) }
}

/**
 * Delete a ticket (student only).
 * Enforces: ownership, status must be OPEN.
 * Comments are deleted automatically via onDelete: Cascade.
 */
const deleteTicket = async (ticketId, studentId) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { id: true, studentId: true, status: true },
  })

  if (!ticket) {
    return { error: 'NOT_FOUND' }
  }

  if (ticket.studentId !== studentId) {
    return { error: 'FORBIDDEN' }
  }

  if (ticket.status !== 'OPEN') {
    return { error: 'NOT_OPEN' }
  }

  await prisma.ticket.delete({ where: { id: ticketId } })

  return { success: true }
}

module.exports = {
  getAllTickets,
  getTicketsByStudentId,
  getTicketById,
  createTicket,
  updateTicket,
  updateTicketByStudent,
  deleteTicket,
  addComment,
  getUnreadRepliesForStudent,
  markRepliesAsRead,
  STATUS_REVERSE_MAP,
  PRIORITY_REVERSE_MAP,
}
