const ApiError = require('../utils/ApiError')

/**
 * Request body validation middleware factory.
 * Accepts an array of field validation rules and returns middleware.
 *
 * Each rule: { field, label, required, minLength, maxLength, enum }
 */
const validate = (rules) => {
  return (req, res, next) => {
    const errors = []

    for (const rule of rules) {
      const value = req.body[rule.field]

      // Check required
      if (rule.required) {
        if (value === undefined || value === null || String(value).trim() === '') {
          errors.push(`${rule.label} is required.`)
          continue
        }
      }

      // Skip further checks if value is empty and not required
      if (value === undefined || value === null || String(value).trim() === '') {
        continue
      }

      const trimmedValue = String(value).trim()

      // Check minLength
      if (rule.minLength && trimmedValue.length < rule.minLength) {
        errors.push(`${rule.label} must be at least ${rule.minLength} characters.`)
      }

      // Check maxLength
      if (rule.maxLength && trimmedValue.length > rule.maxLength) {
        errors.push(`${rule.label} must not exceed ${rule.maxLength} characters.`)
      }

      // Check enum values
      if (rule.enum && !rule.enum.includes(trimmedValue)) {
        errors.push(`${rule.label} must be one of: ${rule.enum.join(', ')}.`)
      }
    }

    if (errors.length > 0) {
      return next(ApiError.badRequest(errors.join(' ')))
    }

    next()
  }
}

module.exports = validate
