import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import AppControls from '../../components/AppControls'
import { useLanguage } from '../../context/LanguageProvider'
import { register } from '../../services/authService'

function RegisterPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState({})
  const [registerError, setRegisterError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }))

    if (errors[name]) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        [name]: '',
      }))
    }

    setRegisterError('')
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = t('register.nameRequired')
    }

    if (!formData.email.trim()) {
      newErrors.email = t('register.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = t('register.emailInvalid')
    }

    if (!formData.password) {
      newErrors.password = t('register.passwordRequired')
    } else if (formData.password.length < 6) {
      newErrors.password = t('register.passwordMin')
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('register.confirmRequired')
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('register.passwordsNoMatch')
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setRegisterError('')

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      })

      navigate('/login')
    } catch (error) {
      setRegisterError(error.message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-outer-frame">
        <AppControls className="auth-controls" />

        <div className="login-top-brand d-none d-lg-block">
          <div className="login-brand-ring">
            <i className="bi bi-mortarboard-fill"></i>
          </div>
          <h1 className="login-brand-title">{t('register.brandTitle')}</h1>
          <p className="login-brand-subtitle">{t('register.brandSubtitle')}</p>
        </div>

        <div className="login-center-card" style={{ maxWidth: '420px' }}>
          <div className="text-center mb-4">
            <div className="login-card-lock-icon mb-3" style={{ background: '#f0fdf4', color: '#166534' }}>
              <i className="bi bi-person-plus-fill"></i>
            </div>
            <h2 className="h4 fw-bold mb-1 text-dark">{t('register.createAccount')}</h2>
            <p className="text-muted small">{t('register.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {registerError && (
              <div className="alert alert-danger d-flex align-items-start gap-2 rounded-3" role="alert">
                <i className="bi bi-exclamation-circle-fill mt-1"></i>
                <span>{registerError}</span>
              </div>
            )}

            <div className="mb-4">
              <label className="form-label fw-bold" htmlFor="name">
                {t('register.fullName')}
              </label>
              <div className="input-group input-group-lg">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-person text-primary"></i>
                </span>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={`form-control border-start-0 ${errors.name ? 'is-invalid' : ''}`}
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t('register.fullNamePlaceholder')}
                  autoComplete="name"
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold" htmlFor="email">
                {t('register.email')}
              </label>
              <div className="input-group input-group-lg">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-envelope text-primary"></i>
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`form-control border-start-0 ${errors.email ? 'is-invalid' : ''}`}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('register.emailPlaceholder')}
                  autoComplete="email"
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold" htmlFor="password">
                {t('register.password')}
              </label>
              <div className="input-group input-group-lg">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-lock text-primary"></i>
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control border-start-0 border-end-0 ${
                    errors.password ? 'is-invalid' : ''
                  }`}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t('register.passwordPlaceholder')}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="btn btn-light border"
                  onClick={() => setShowPassword((currentValue) => !currentValue)}
                  aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                >
                  <i className={showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'}></i>
                </button>
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold" htmlFor="confirmPassword">
                {t('register.confirmPassword')}
              </label>
              <div className="input-group input-group-lg">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-shield-lock text-primary"></i>
                </span>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`form-control border-start-0 border-end-0 ${
                    errors.confirmPassword ? 'is-invalid' : ''
                  }`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder={t('register.confirmPlaceholder')}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="btn btn-light border"
                  onClick={() => setShowConfirmPassword((currentValue) => !currentValue)}
                  aria-label={showConfirmPassword ? t('login.hidePassword') : t('login.showPassword')}
                >
                  <i className={showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'}></i>
                </button>
                {errors.confirmPassword && (
                  <div className="invalid-feedback">{errors.confirmPassword}</div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-100 rounded-3 fw-bold py-3 shadow-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  {t('register.creatingAccount')}
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus-fill me-2"></i>
                  {t('register.register')}
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-4 mb-0 text-muted">
            {t('register.haveAccount')}{' '}
            <Link to="/login" className="fw-bold text-decoration-none text-primary">
              {t('register.signInHere')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
