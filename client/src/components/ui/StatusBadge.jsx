import { useLanguage } from '../../context/LanguageProvider'
import { getStatusClass } from '../../lib/ticketFormat'

function StatusBadge({ status, dot = false }) {
  const { t } = useLanguage()

  return (
    <span className={getStatusClass(status)}>
      {dot && <i className="bi bi-circle-fill me-2 small"></i>}
      {t(`statuses.${status}`)}
    </span>
  )
}

export default StatusBadge
