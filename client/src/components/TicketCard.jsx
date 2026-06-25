import { Link } from 'react-router-dom'

import { useLanguage } from '../context/LanguageProvider'
import { formatDate, getCategoryIcon, getPriorityBorderClass } from '../lib/ticketFormat'
import PriorityBadge from './ui/PriorityBadge'
import StatusBadge from './ui/StatusBadge'

function TicketCard({ ticket }) {
  const { t, locale } = useLanguage()

  const description =
    ticket.description.length > 120
      ? `${ticket.description.slice(0, 120)}...`
      : ticket.description

  return (
    <article className={`ticket-card ${getPriorityBorderClass(ticket.priority)}`}>
      <div className="ticket-card-top">
        <div className="ticket-icon">
          <i className={`bi ${getCategoryIcon(ticket.category)}`}></i>
        </div>

        <div className="flex-grow-1">
          <div className="d-flex justify-content-between align-items-start gap-3">
            <div>
              <p className="ticket-number mb-1">
                {t('common.ticketNumber', { id: ticket.id })}
              </p>
              <h2 className="ticket-title mb-0">{ticket.title}</h2>
            </div>

            <StatusBadge status={ticket.status} />
          </div>
        </div>
      </div>

      <p className="ticket-description">{description}</p>

      <div className="ticket-tags">
        <span className="ticket-category">
          <i className={`bi ${getCategoryIcon(ticket.category)} me-2`}></i>
          {t(`categories.${ticket.category}`)}
        </span>

        <PriorityBadge priority={ticket.priority} />
      </div>

      <div className="ticket-card-footer">
        <div className="ticket-date">
          <i className="bi bi-calendar3 me-2"></i>
          {formatDate(ticket.createdAt, locale)}
        </div>

        <Link
          className="btn btn-primary ticket-details-button"
          to={`/tickets/${ticket.id}`}
        >
          {t('common.viewDetails')}
          <i className="bi bi-arrow-up-right ms-2"></i>
        </Link>
      </div>
    </article>
  )
}

export default TicketCard
