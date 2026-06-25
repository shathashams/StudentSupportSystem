import { useState } from 'react'

import { useLanguage } from '../../context/LanguageProvider'
import { CATEGORIES, LIMITS, PRIORITIES } from '../../lib/constants'
import { validateTicketForm } from '../../lib/validation'

const DEFAULT_VALUES = {
  title: '',
  description: '',
  category: '',
  priority: 'Medium',
}

function TicketForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
  submittingLabel,
  submitIcon = 'bi-send',
}) {
  const { t } = useLanguage()
  const [form, setForm] = useState(initialValues || DEFAULT_VALUES)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((current) => ({ ...current, [name]: value }))

    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: '' }))
    }

    setSubmitError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const validationErrors = validateTicketForm(form, t)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setSubmitting(true)
    setSubmitError('')

    try {
      await onSubmit({
        title: form.title,
        description: form.description,
        category: form.category,
        priority: form.priority,
      })
    } catch (err) {
      setSubmitError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <form className="create-ticket-form" onSubmit={handleSubmit} noValidate>
      {submitError && (
        <div
          className="alert alert-danger d-flex align-items-start gap-2 rounded-3 mb-4"
          role="alert"
        >
          <i className="bi bi-exclamation-circle-fill mt-1"></i>
          <span>{submitError}</span>
        </div>
      )}

      <div className="mb-4">
        <label className="form-label form-field-label" htmlFor="title">
          {t('form.title')}
          <span className="text-danger ms-1">*</span>
        </label>

        <input
          id="title"
          name="title"
          type="text"
          className={`form-control form-control-lg custom-form-control ${
            errors.title ? 'is-invalid' : ''
          }`}
          value={form.title}
          onChange={handleChange}
          placeholder={t('form.titlePlaceholder')}
          maxLength={LIMITS.title.max}
        />

        {errors.title && <div className="invalid-feedback">{errors.title}</div>}

        <div className="form-text text-end">
          {form.title.length}/{LIMITS.title.max}
        </div>
      </div>

      <div className="mb-4">
        <label className="form-label form-field-label" htmlFor="category">
          {t('form.category')}
          <span className="text-danger ms-1">*</span>
        </label>

        <select
          id="category"
          name="category"
          className={`form-select form-select-lg custom-form-control ${
            errors.category ? 'is-invalid' : ''
          }`}
          value={form.category}
          onChange={handleChange}
        >
          <option value="">{t('form.selectCategory')}</option>
          {CATEGORIES.map((category) => (
            <option value={category} key={category}>
              {t(`categories.${category}`)}
            </option>
          ))}
        </select>

        {errors.category && (
          <div className="invalid-feedback">{errors.category}</div>
        )}
      </div>

      <div className="mb-4">
        <label className="form-label form-field-label" htmlFor="priority">
          {t('form.priority')}
          <span className="text-danger ms-1">*</span>
        </label>

        <select
          id="priority"
          name="priority"
          className={`form-select form-select-lg custom-form-control ${
            errors.priority ? 'is-invalid' : ''
          }`}
          value={form.priority}
          onChange={handleChange}
        >
          {PRIORITIES.map((priority) => (
            <option value={priority} key={priority}>
              {t(`priorities.${priority}`)}
            </option>
          ))}
        </select>

        {errors.priority && (
          <div className="invalid-feedback">{errors.priority}</div>
        )}
      </div>

      <div className="mb-4">
        <label className="form-label form-field-label" htmlFor="description">
          {t('form.description')}
          <span className="text-danger ms-1">*</span>
        </label>

        <textarea
          id="description"
          name="description"
          className={`form-control custom-form-control ${
            errors.description ? 'is-invalid' : ''
          }`}
          value={form.description}
          onChange={handleChange}
          placeholder={t('form.descriptionPlaceholder')}
          rows="8"
          maxLength={LIMITS.description.max}
        />

        {errors.description && (
          <div className="invalid-feedback">{errors.description}</div>
        )}

        <div className="form-text d-flex justify-content-between">
          <span>{t('form.minChars', { min: LIMITS.description.min })}</span>
          <span>
            {form.description.length}/{LIMITS.description.max}
          </span>
        </div>
      </div>

      <div className="create-ticket-actions">
        {onCancel && (
          <button
            type="button"
            className="btn btn-light border px-4"
            onClick={onCancel}
            disabled={submitting}
          >
            {t('form.cancel')}
          </button>
        )}

        <button className="btn btn-primary px-4" type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
              {submittingLabel}
            </>
          ) : (
            <>
              <i className={`bi ${submitIcon} me-2`}></i>
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default TicketForm
