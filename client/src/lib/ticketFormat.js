export const getStatusClass = (status) => {
  switch (status) {
    case 'Open':
      return 'ticket-status ticket-status-open'
    case 'In Progress':
      return 'ticket-status ticket-status-progress'
    case 'Resolved':
      return 'ticket-status ticket-status-resolved'
    case 'Closed':
      return 'ticket-status ticket-status-closed'
    default:
      return 'ticket-status'
  }
}

export const getPriorityClass = (priority) => {
  switch (priority) {
    case 'Urgent':
      return 'ticket-priority ticket-priority-urgent'
    case 'High':
      return 'ticket-priority ticket-priority-high'
    case 'Medium':
      return 'ticket-priority ticket-priority-medium'
    case 'Low':
      return 'ticket-priority ticket-priority-low'
    default:
      return 'ticket-priority'
  }
}

export const getPriorityBorderClass = (priority) => {
  switch (priority) {
    case 'Urgent':
      return 'ticket-border-urgent'
    case 'High':
      return 'ticket-border-high'
    case 'Medium':
      return 'ticket-border-medium'
    case 'Low':
      return 'ticket-border-low'
    default:
      return ''
  }
}

export const getCategoryIcon = (category) => {
  switch (category) {
    case 'Technical Support':
      return 'bi-laptop'
    case 'Payments':
      return 'bi-credit-card'
    case 'Academic Services':
      return 'bi-mortarboard'
    default:
      return 'bi-ticket-detailed'
  }
}

const isValidDate = (date) => !Number.isNaN(date.getTime())

export const formatDate = (dateString, locale = 'en-GB') => {
  if (!dateString) {
    return 'Not available'
  }

  const date = new Date(dateString)

  if (!isValidDate(date)) {
    return 'Not available'
  }

  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export const formatDateTime = (dateString, locale = 'en-GB') => {
  if (!dateString) {
    return 'Not available'
  }

  const date = new Date(dateString)

  if (!isValidDate(date)) {
    return 'Not available'
  }

  return date.toLocaleString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
