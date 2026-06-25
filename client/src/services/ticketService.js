import api from './api'

const extractError = (error, fallback) =>
  error.response?.data?.error?.message ||
  error.response?.data?.message ||
  fallback

/**
 * Fetch tickets for the current user.
 * The backend returns the student's own tickets or all tickets based on role.
 */
export const getTickets = async () => {
  try {
    const response = await api.get('/tickets')
    return response.data
  } catch (error) {
    throw new Error(extractError(error, 'Failed to retrieve tickets.'))
  }
}

/**
 * Fetch a single ticket's details by id (including comments).
 */
export const getTicketById = async (ticketId) => {
  try {
    const response = await api.get(`/tickets/${ticketId}`)
    return response.data
  } catch (error) {
    throw new Error(extractError(error, 'Failed to retrieve ticket details.'))
  }
}

/**
 * Create a new support ticket (student only).
 */
export const createTicket = async (ticketData) => {
  try {
    const response = await api.post('/tickets', {
      title: ticketData.title,
      description: ticketData.description,
      category: ticketData.category,
      priority: ticketData.priority,
    })
    return response.data
  } catch (error) {
    throw new Error(extractError(error, 'Failed to create ticket.'))
  }
}

/**
 * Add a comment to a ticket.
 */
export const addCommentToTicket = async (ticketId, commentData) => {
  try {
    const response = await api.post(`/tickets/${ticketId}/comments`, {
      message: commentData.message,
    })
    return response.data
  } catch (error) {
    throw new Error(extractError(error, 'Failed to post comment.'))
  }
}

/**
 * Update a ticket's status and/or priority (support only).
 */
export const updateTicket = async (ticketId, updates) => {
  try {
    const response = await api.patch(`/tickets/${ticketId}`, updates)
    return response.data
  } catch (error) {
    throw new Error(extractError(error, 'Failed to update ticket.'))
  }
}

/**
 * Get all unread support replies for the current logged-in student.
 */
export const getUnreadReplies = async () => {
  try {
    const response = await api.get('/tickets/unread-replies')
    return response.data
  } catch (error) {
    throw new Error(extractError(error, 'Failed to fetch unread replies.'))
  }
}

/**
 * Student edits their own Open ticket (title, description, category, priority).
 */
export const updateTicketAsStudent = async (ticketId, updates) => {
  try {
    const response = await api.patch(`/tickets/${ticketId}/student-edit`, updates)
    return response.data
  } catch (error) {
    throw new Error(extractError(error, 'Failed to update ticket.'))
  }
}

/**
 * Student permanently deletes their own Open ticket.
 */
export const deleteTicket = async (ticketId) => {
  try {
    await api.delete(`/tickets/${ticketId}`)
  } catch (error) {
    throw new Error(extractError(error, 'Failed to delete ticket.'))
  }
}
