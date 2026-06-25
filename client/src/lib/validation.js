import { LIMITS } from './constants'

/**
 * Validate the ticket create/edit form.
 * `t` is the translation function from useLanguage().
 * Returns an object of field errors (empty object means valid).
 */
export const validateTicketForm = (form, t) => {
  const errors = {}

  const title = form.title.trim()
  if (!title) {
    errors.title = t('validation.titleRequired')
  } else if (title.length < LIMITS.title.min) {
    errors.title = t('validation.titleMin', { min: LIMITS.title.min })
  } else if (title.length > LIMITS.title.max) {
    errors.title = t('validation.titleMax', { max: LIMITS.title.max })
  }

  const description = form.description.trim()
  if (!description) {
    errors.description = t('validation.descRequired')
  } else if (description.length < LIMITS.description.min) {
    errors.description = t('validation.descMin', { min: LIMITS.description.min })
  } else if (description.length > LIMITS.description.max) {
    errors.description = t('validation.descMax', { max: LIMITS.description.max })
  }

  if (!form.category) {
    errors.category = t('validation.categoryRequired')
  }

  if (!form.priority) {
    errors.priority = t('validation.priorityRequired')
  }

  return errors
}

/**
 * Validate a reply/comment message.
 * `t` is the translation function from useLanguage().
 * Returns an error string (empty string means valid).
 */
export const validateReply = (message, t) => {
  const value = message.trim()

  if (!value) {
    return t('validation.replyRequired')
  }

  if (value.length < LIMITS.reply.min) {
    return t('validation.replyMin', { min: LIMITS.reply.min })
  }

  if (value.length > LIMITS.reply.max) {
    return t('validation.replyMax', { max: LIMITS.reply.max })
  }

  return ''
}
