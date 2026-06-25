import { Link, NavLink, useNavigate } from 'react-router-dom'

import { useLanguage } from '../context/LanguageProvider'
import { getCurrentUser, logout } from '../services/authService'
import AppControls from './AppControls'

function Navbar({ role }) {
  const navigate = useNavigate()
  const user = getCurrentUser()
  const { t } = useLanguage()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLinkClass = ({ isActive }) =>
    `nav-pill ${isActive ? 'nav-pill-active' : ''}`

  return (
    <nav className="navbar navbar-expand-lg app-navbar">
      <div className="container">
        <Link className="navbar-brand app-brand" to="/dashboard">
          <span className="brand-icon">
            <i className="bi bi-headset"></i>
          </span>

          <div className="brand-text">
            <span className="brand-title">{t('app.name')}</span>

            <span className="brand-subtitle">
              {role === 'student' ? t('app.studentPortal') : t('app.supportPortal')}
            </span>
          </div>
        </Link>

        <button
          className="navbar-toggler custom-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <div className="navbar-nav ms-auto align-items-lg-center nav-group">
            <NavLink className={navLinkClass} to="/dashboard">
              <i className="bi bi-grid me-2"></i>
              {t('nav.dashboard')}
            </NavLink>

            {role === 'student' ? (
              <>
                <NavLink className={navLinkClass} to="/tickets">
                  <i className="bi bi-ticket-detailed me-2"></i>
                  {t('nav.myTickets')}
                </NavLink>

                <NavLink className={navLinkClass} to="/tickets/new">
                  <i className="bi bi-plus-circle me-2"></i>
                  {t('nav.createTicket')}
                </NavLink>
              </>
            ) : (
              <NavLink className={navLinkClass} to="/tickets">
                <i className="bi bi-ticket-perforated me-2"></i>
                {t('nav.allTickets')}
              </NavLink>
            )}

            {role === 'support' && user && (
              <div
                className="d-flex align-items-center gap-2 text-white ms-lg-3 mt-3 mt-lg-0 px-3 py-2 rounded-4"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                <i className="bi bi-person-circle text-white-50"></i>
                <span className="fw-semibold small">{user.name}</span>
              </div>
            )}

            <AppControls className="ms-lg-3 mt-3 mt-lg-0" />

            <button
              type="button"
              className="logout-button ms-lg-2 mt-3 mt-lg-0"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              {t('nav.logout')}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
