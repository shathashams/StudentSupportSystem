import { useLanguage } from '../../context/LanguageProvider'
import { getPriorityClass } from '../../lib/ticketFormat'

function PriorityBadge({ priority, icon = true }) {
  const { t } = useLanguage()

  return (
    <span className={getPriorityClass(priority)}>
      {icon && <i className="bi bi-flag-fill me-2"></i>}
      {t(`priorities.${priority}`)}
    </span>
  )
}

export default PriorityBadge
