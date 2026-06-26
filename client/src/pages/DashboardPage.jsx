import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import TicketCard from '../components/TicketCard'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import LoadingState from '../components/ui/LoadingState'
import PriorityBadge from '../components/ui/PriorityBadge'
import StatusBadge from '../components/ui/StatusBadge'
import TicketStatsGrid from '../components/ticket/TicketStatsGrid'
import { useLanguage } from '../context/LanguageProvider'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useTickets } from '../hooks/useTickets'
import { formatDate } from '../lib/ticketFormat'
import { getUnreadReplies } from '../services/ticketService'

function UnreadRepliesBanner({ replies }) {
  const { t } = useLanguage()

  return (
    <div className="mb-4">
      {replies.map((reply) => (
        <div
          key={reply.commentId}
          className="alert alert-info border-0 shadow-sm rounded-4 p-3 d-flex align-items-center justify-content-between mb-3"
          style={{
            background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
            color: '#0369a1',
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm"
              style={{ width: '42px', height: '42px', color: '#0284c7' }}
            >
              <i className="bi bi-bell-fill fs-5"></i>
            </div>
            <div>
              <strong className="d-block mb-0" style={{ color: '#0c4a6e' }}>
                {t('dashboard.repliedToTicket', { name: reply.authorName })}
              </strong>
              <span className="text-secondary small">{reply.ticketTitle}</span>
            </div>
          </div>
          <Link
            to={`/tickets/${reply.ticketId}`}
            className="btn btn-primary rounded-pill px-4"
            style={{
              background: '#0284c7',
              border: 'none',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.2)',
            }}
          >
            {t('dashboard.viewTicket')}
            <i className="bi bi-arrow-right ms-2"></i>
          </Link>
        </div>
      ))}
    </div>
  )
}

function SupportSummary({ openCount, inProgressCount, resolvedCount, urgentCount }) {
  const { t } = useLanguage()

  return (
    <section className="row g-4 mb-5">
      <div className="col-12 col-lg-4">
        <div className={`card app-card h-100 ${urgentCount > 0 ? 'urgent-card-pulse' : ''}`}>
          <div className="card-body p-4">

            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="dashboard-stat-icon bg-danger-subtle text-danger">
                <i className="bi bi-exclamation-triangle"></i>
              </div>
              <div>
                <p className="text-muted mb-1">{t('dashboard.requiresAttention')}</p>
                <h2 className="h3 fw-bold mb-0">
                  {t('dashboard.urgentCount', { count: urgentCount })}
                </h2>
              </div>
            </div>
            <p className="text-muted mb-0">{t('dashboard.urgentNote')}</p>
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-8">
        <div className="card app-card h-100">
          <div className="card-body p-4">
            <h2 className="h4 fw-bold mb-3">{t('dashboard.workSummary')}</h2>
            <div className="row g-3">
              <div className="col-6">
                <div className="p-3 rounded-4 bg-light border">
                  <p className="text-muted small mb-1">{t('dashboard.activeTickets')}</p>
                  <strong className="fs-4">{openCount + inProgressCount}</strong>
                </div>
              </div>
              <div className="col-6">
                <div className="p-3 rounded-4 bg-light border">
                  <p className="text-muted small mb-1">{t('dashboard.completed')}</p>
                  <strong className="fs-4">{resolvedCount}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function RecentTicketsTable({ tickets }) {
  const { t, locale } = useLanguage()

  return (
    <div className="card app-card">
      <div className="table-responsive">
        <table className="table align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th className="px-4 py-3">{t('dashboard.colTicket')}</th>
              <th className="py-3">{t('dashboard.colCategory')}</th>
              <th className="py-3">{t('dashboard.colPriority')}</th>
              <th className="py-3">{t('dashboard.colStatus')}</th>
              <th className="py-3">{t('dashboard.colUpdated')}</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td className="px-4 py-3">
                  <p className="text-muted small mb-1">
                    {t('common.ticketNumber', { id: ticket.id })}
                  </p>
                  <strong>{ticket.title}</strong>
                </td>
                <td className="py-3">{t(`categories.${ticket.category}`)}</td>
                <td className="py-3">
                  <PriorityBadge priority={ticket.priority} icon={false} />
                </td>
                <td className="py-3">
                  <StatusBadge status={ticket.status} />
                </td>
                <td className="py-3 text-muted">{formatDate(ticket.updatedAt, locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DashboardPage() {
  const user = useCurrentUser()
  const isSupport = user?.role === 'support'
  const { t } = useLanguage()
  const { tickets, loading, error } = useTickets()
  const [unreadReplies, setUnreadReplies] = useState([])

  useEffect(() => {
    if (isSupport) {
      return
    }

    let isMounted = true

    getUnreadReplies()
      .then((data) => {
        if (isMounted) {
          setUnreadReplies(data)
        }
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [isSupport])

  if (loading) {
    return <LoadingState message={t('dashboard.loading')} />
  }

  if (error) {
    return <ErrorState message={error} />
  }

  const recentTickets = tickets.slice(0, isSupport ? 5 : 2)
  const openCount = tickets.filter((ticket) => ticket.status === 'Open').length
  const inProgressCount = tickets.filter(
    (ticket) => ticket.status === 'In Progress',
  ).length
  const resolvedCount = tickets.filter(
    (ticket) => ticket.status === 'Resolved',
  ).length
  const urgentCount = tickets.filter(
    (ticket) => ticket.priority === 'Urgent',
  ).length

  const defaultName = isSupport
    ? t('dashboard.supportDefaultName')
    : t('dashboard.studentDefaultName')

  return (
    <div>
      <section className="student-welcome-section mb-5">
        <div>
          <span className="student-welcome-label">
            {isSupport ? t('app.supportPortal') : t('app.studentPortal')}
          </span>

          <h1 className="page-title mt-2">
            {t('dashboard.welcomeBack', { name: user?.name || defaultName })}
          </h1>

          <p className="page-subtitle mb-0">
            {isSupport ? t('dashboard.supportSubtitle') : t('dashboard.studentSubtitle')}
          </p>
        </div>

        {isSupport ? (
          <Link className="btn btn-primary student-primary-action" to="/tickets">
            <i className="bi bi-ticket-perforated me-2"></i>
            {t('dashboard.viewAllTickets')}
          </Link>
        ) : (
          <Link
            className="btn btn-primary student-primary-action"
            to="/tickets/new"
          >
            <i className="bi bi-plus-circle me-2"></i>
            {t('dashboard.createNewTicket')}
          </Link>
        )}
      </section>

      {!isSupport && unreadReplies.length > 0 && (
        <UnreadRepliesBanner replies={unreadReplies} />
      )}

      <TicketStatsGrid tickets={tickets} />

      {isSupport && (
        <SupportSummary
          openCount={openCount}
          inProgressCount={inProgressCount}
          resolvedCount={resolvedCount}
          urgentCount={urgentCount}
        />
      )}

      <section>
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
          <div>
            <h2 className="h3 fw-bold mb-1">
              {isSupport ? t('dashboard.recentSupport') : t('dashboard.recentStudent')}
            </h2>
            <p className="text-muted mb-0">
              {isSupport
                ? t('dashboard.recentSupportSubtitle')
                : t('dashboard.recentStudentSubtitle')}
            </p>
          </div>

          <Link className="btn btn-outline-primary" to="/tickets">
            {t('dashboard.viewAllTickets')}
            <i className="bi bi-arrow-right ms-2"></i>
          </Link>
        </div>

        {recentTickets.length === 0 ? (
          isSupport ? (
            <EmptyState
              icon="bi-inbox"
              title={t('dashboard.emptySupportTitle')}
              description={t('dashboard.emptySupportDesc')}
            />
          ) : (
            <EmptyState
              icon="bi-ticket-detailed"
              title={t('dashboard.emptyStudentTitle')}
              description={t('dashboard.emptyStudentDesc')}
            >
              <Link className="btn btn-primary" to="/tickets/new">
                <i className="bi bi-plus-circle me-2"></i>
                {t('nav.createTicket')}
              </Link>
            </EmptyState>
          )
        ) : isSupport ? (
          <RecentTicketsTable tickets={recentTickets} />
        ) : (
          <div className="row g-4">
            {recentTickets.map((ticket) => (
              <div className="col-12 col-lg-6" key={ticket.id}>
                <TicketCard ticket={ticket} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default DashboardPage
