import { useState } from 'react'

import { useLanguage } from '../../context/LanguageProvider'
import { LIMITS } from '../../lib/constants'
import { validateReply } from '../../lib/validation'

function ReplyForm({ onSubmit, label, placeholder }) {
  const { t } = useLanguage()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    setMessage(event.target.value)
    if (error) {
      setError('')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const validationError = validateReply(message, t)
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)

    try {
      await onSubmit(message.trim())
      setMessage('')
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label className="form-label fw-bold" htmlFor="reply">
        {label}
      </label>

      <textarea
        id="reply"
        className={`form-control custom-form-control ${error ? 'is-invalid' : ''}`}
        value={message}
        onChange={handleChange}
        placeholder={placeholder}
        rows="5"
        maxLength={LIMITS.reply.max}
      />

      {error && <div className="invalid-feedback">{error}</div>}

      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mt-3">
        <small className="text-muted">
          {t('reply.charsCount', { count: message.length, max: LIMITS.reply.max })}
        </small>

        <button className="btn btn-primary px-4" type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              {t('reply.sending')}
            </>
          ) : (
            <>
              <i className="bi bi-send me-2"></i>
              {t('reply.sendReply')}
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default ReplyForm
