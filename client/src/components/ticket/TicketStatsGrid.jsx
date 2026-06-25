import { useMemo } from 'react'

import { useLanguage } from '../../context/LanguageProvider'

function TicketStatsGrid({ tickets }) {
  const { t } = useLanguage()

  const items = useMemo(() => {
    const countByStatus = (status) =>
      tickets.filter((ticket) => ticket.status === status).length

    return [
      {
        label: t('dashboard.statTotal'),
        value: tickets.length,
        icon: 'bi-ticket-detailed',
        colorClass: 'stat-icon-blue',
      },
      {
        label: t('dashboard.statOpen'),
        value: countByStatus('Open'),
        icon: 'bi-envelope-open',
        colorClass: 'stat-icon-indigo',
      },
      {
        label: t('dashboard.statInProgress'),
        value: countByStatus('In Progress'),
        icon: 'bi-hourglass-split',
        colorClass: 'stat-icon-orange',
      },
      {
        label: t('dashboard.statResolved'),
        value: countByStatus('Resolved'),
        icon: 'bi-check-circle',
        colorClass: 'stat-icon-green',
      },
    ]
  }, [tickets, t])

  return (
    <section className="row g-4 mb-5">
      {items.map((item) => (
        <div className="col-12 col-md-6 col-xl-3" key={item.label}>
          <div className="dashboard-stat-card">
            <div className={`dashboard-stat-icon ${item.colorClass}`}>
              <i className={`bi ${item.icon}`}></i>
            </div>

            <div>
              <p className="dashboard-stat-label">{item.label}</p>
              <h2 className="dashboard-stat-value">{item.value}</h2>
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}

export default TicketStatsGrid
