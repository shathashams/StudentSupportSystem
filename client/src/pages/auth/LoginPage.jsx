import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import AppControls from '../../components/AppControls'
import { useLanguage } from '../../context/LanguageProvider'
import { login } from '../../services/authService'

function LoginPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  const [formData, setFormData] = useState({
    role: 'student',
    email: '',
    password: '',
  })

  const [errors, setErrors] = useState({})
  const [loginError, setLoginError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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

    setLoginError('')
  }

  const handleRoleChange = (role) => {
    setFormData((currentFormData) => ({
      ...currentFormData,
      role,
    }))

    setErrors((currentErrors) => ({
      ...currentErrors,
      role: '',
    }))

    setLoginError('')
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.role) {
      newErrors.role = t('login.roleRequired')
    }

    if (!formData.email.trim()) {
      newErrors.email = t('login.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = t('login.emailInvalid')
    }

    if (!formData.password) {
      newErrors.password = t('login.passwordRequired')
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoginError('')

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await login({
        email: formData.email,
        password: formData.password,
        role: formData.role,
      })

      navigate('/dashboard')
    } catch (error) {
      setLoginError(error.message)
      setIsSubmitting(false)
    }
  }

  const fillStudentCredentials = () => {
    setFormData({ role: 'student', email: 'student@test.com', password: 'Student123!' })
    setErrors({})
    setLoginError('')
  }

  const fillSupportCredentials = () => {
    setFormData({ role: 'support', email: 'support@test.com', password: 'Support123!' })
    setErrors({})
    setLoginError('')
  }

  return (
    <div className="login-page">
      <div className="login-outer-frame">
        <AppControls className="auth-controls" />

        <div className="login-top-brand">
          <div className="login-brand-ring">
            <i className="bi bi-headset"></i>
          </div>
          <h1 className="login-brand-title">{t('login.brandTitle')}</h1>
          <p className="login-brand-subtitle">{t('login.brandSubtitle')}</p>
        </div>

        <div className="login-center-card">
          <div className="text-center mb-4">
            <div className="login-card-lock-icon mb-3">
              <i className="bi bi-lock-fill"></i>
            </div>
            <h2 className="h4 fw-bold mb-1 text-dark">{t('login.welcomeBack')}</h2>
            <p className="text-muted small">{t('login.subtitle')}</p>
          </div>

          {loginError && (
            <div
              className="alert alert-danger d-flex align-items-start gap-2 rounded-3 py-2 px-3 mb-3"
              style={{ fontSize: '0.85rem' }}
              role="alert"
            >
              <i className="bi bi-exclamation-circle-fill mt-1"></i>
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary mb-2">
                {t('login.accountType')}
              </label>
              <div className="d-flex p-1 bg-light rounded-3 mb-2" style={{ border: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  className={`btn flex-grow-1 py-2 rounded-2 fw-bold text-center border-0 d-flex align-items-center justify-content-center gap-2 ${
                    formData.role === 'student'
                      ? 'bg-white shadow-sm text-primary'
                      : 'text-secondary bg-transparent'
                  }`}
                  style={{ fontSize: '0.88rem', transition: 'all 0.2s ease' }}
                  onClick={() => handleRoleChange('student')}
                >
                  <i className="bi bi-mortarboard-fill"></i>
                  <span>{t('common.student')}</span>
                </button>
                <button
                  type="button"
                  className={`btn flex-grow-1 py-2 rounded-2 fw-bold text-center border-0 d-flex align-items-center justify-content-center gap-2 ${
                    formData.role === 'support'
                      ? 'bg-white shadow-sm text-primary'
                      : 'text-secondary bg-transparent'
                  }`}
                  style={{ fontSize: '0.88rem', transition: 'all 0.2s ease' }}
                  onClick={() => handleRoleChange('support')}
                >
                  <i className="bi bi-headset"></i>
                  <span>{t('common.support')}</span>
                </button>
              </div>
              {errors.role && <div className="text-danger small mt-1">{errors.role}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary mb-1" htmlFor="email">
                {t('login.email')}
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 rounded-start-3 text-secondary">
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`form-control border-start-0 rounded-end-3 py-2 ${
                    errors.email ? 'is-invalid' : ''
                  }`}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('login.emailPlaceholder')}
                  autoComplete="email"
                  style={{ fontSize: '0.95rem' }}
                />
                {errors.email && <div className="invalid-feedback small">{errors.email}</div>}
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-bold text-secondary mb-1" htmlFor="password">
                {t('login.password')}
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 rounded-start-3 text-secondary">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control border-start-0 border-end-0 py-2 ${
                    errors.password ? 'is-invalid' : ''
                  }`}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{ fontSize: '0.95rem' }}
                />
                <button
                  type="button"
                  className="btn btn-light border border-start-0 rounded-end-3 px-3 text-secondary"
                  onClick={() => setShowPassword((currentValue) => !currentValue)}
                  aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                >
                  <i className={showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'}></i>
                </button>
                {errors.password && (
                  <div className="invalid-feedback small">{errors.password}</div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 rounded-3 fw-bold py-2.5 shadow-sm d-flex align-items-center justify-content-center gap-2 mb-3"
              disabled={isSubmitting}
              style={{ minHeight: '46px', fontSize: '1rem', background: '#2563eb', border: 'none' }}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm"></span>
                  <span>{t('login.loggingIn')}</span>
                </>
              ) : (
                <>
                  <span>{t('login.login')}</span>
                  <i className="bi bi-box-arrow-in-right"></i>
                </>
              )}
            </button>
          </form>

          <div className="d-flex align-items-center gap-2 my-3">
            <div className="border-top flex-grow-1" style={{ borderColor: '#e2e8f0' }}></div>
            <span className="text-muted small fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
              {t('login.orQuickLogin')}
            </span>
            <div className="border-top flex-grow-1" style={{ borderColor: '#e2e8f0' }}></div>
          </div>

          <div className="row g-2 mb-3">
            <div className="col-6">
              <button
                type="button"
                className="btn w-100 border-0 rounded-3 p-2.5 text-center d-flex flex-column align-items-center justify-content-center gap-1"
                style={{ background: '#eff6ff', color: '#1e40af', transition: 'transform 0.15s ease' }}
                onClick={fillStudentCredentials}
              >
                <i className="bi bi-person-fill fs-5"></i>
                <span className="fw-bold" style={{ fontSize: '0.85rem' }}>{t('common.student')}</span>
              </button>
            </div>
            <div className="col-6">
              <button
                type="button"
                className="btn w-100 border-0 rounded-3 p-2.5 text-center d-flex flex-column align-items-center justify-content-center gap-1"
                style={{ background: '#f0fdf4', color: '#166534', transition: 'transform 0.15s ease' }}
                onClick={fillSupportCredentials}
              >
                <i className="bi bi-headset fs-5"></i>
                <span className="fw-bold" style={{ fontSize: '0.85rem' }}>{t('common.support')}</span>
              </button>
            </div>
          </div>

          <p className="text-center mb-0 text-muted" style={{ fontSize: '0.85rem' }}>
            {t('login.noAccount')}{' '}
            <Link to="/register" className="fw-bold text-decoration-none" style={{ color: '#2563eb' }}>
              {t('login.registerHere')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
