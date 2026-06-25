import { useLanguage } from '../context/LanguageProvider'
import { useTheme } from '../context/ThemeProvider'

/**
 * Language switcher + light/dark toggle.
 * Shared by the Navbar and the auth (login/register) pages.
 */
function AppControls({ className = '' }) {
  const { theme, toggleTheme } = useTheme()
  const { t, lang, setLang, languages } = useLanguage()

  const currentLanguage = languages.find((language) => language.code === lang)
  const themeLabel = theme === 'dark' ? t('nav.lightMode') : t('nav.darkMode')

  return (
    <div className={`d-flex align-items-center gap-2 ${className}`}>
      <div className="dropdown">
        <button
          type="button"
          className="logout-button dropdown-toggle"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          aria-label={t('nav.language')}
        >
          <i className="bi bi-translate me-2"></i>
          {currentLanguage?.label}
        </button>

        <ul className="dropdown-menu dropdown-menu-end">
          {languages.map((language) => (
            <li key={language.code}>
              <button
                type="button"
                className={`dropdown-item ${language.code === lang ? 'active' : ''}`}
                onClick={() => setLang(language.code)}
              >
                {language.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        className="logout-button"
        onClick={toggleTheme}
        aria-label={themeLabel}
        title={themeLabel}
      >
        <i className={theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill'}></i>
      </button>
    </div>
  )
}

export default AppControls
