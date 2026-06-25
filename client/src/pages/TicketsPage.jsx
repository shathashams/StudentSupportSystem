import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import TicketCard from '../components/TicketCard'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import LoadingState from '../components/ui/LoadingState'
import PriorityBadge from '../components/ui/PriorityBadge'
import StatusBadge from '../components/ui/StatusBadge'
import { useLanguage } from '../context/LanguageProvider'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useTickets } from '../hooks/useTickets'
import { PRIORITIES, STATUSES } from '../lib/constants'
import { formatDate } from '../lib/ticketFormat'

function StudentTicketList({ tickets }) {
  const { t } = useLanguage()

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <span className="student-welcome-label">{t('tickets.studentLabel')}</span>
          <h1 className="page-title mt-2">{t('tickets.studentTitle')}</h1>
          <p className="page-subtitle mb-0">{t('tickets.studentSubtitle')}</p>
        </div>

        <Link className="btn btn-primary student-primary-action" to="/tickets/new">
          <i className="bi bi-plus-circle me-2"></i>
          {t('tickets.createNewTicket')}
        </Link>
      </div>

      <div className="ticket-list-summary mb-4">
        <div>
          <p className="ticket-list-summary-label">{t('tickets.totalRequests')}</p>
          <strong className="ticket-list-summary-value">{tickets.length}</strong>
        </div>
        <div className="ticket-list-summary-icon">
          <i className="bi bi-ticket-detailed"></i>
        </div>
      </div>

      {tickets.length === 0 ? (
        <EmptyState
          icon="bi-ticket-detailed"
          title={t('tickets.emptyStudentTitle')}
          description={t('tickets.emptyStudentDesc')}
        >
          <Link className="btn btn-primary" to="/tickets/new">
            <i className="bi bi-plus-circle me-2"></i>
            {t('tickets.createFirstTicket')}
          </Link>
        </EmptyState>
      ) : (
        <div className="row g-4">
          {tickets.map((ticket) => (
            <div className="col-12 col-lg-6" key={ticket.id}>
              <TicketCard ticket={ticket} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SupportTicketList({ tickets }) {
  const { t, locale } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')

  const categories = useMemo(
    () => [...new Set(tickets.map((ticket) => ticket.category).filter(Boolean))],
    [tickets],
  )

  const filteredTickets = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return tickets.filter((ticket) => {
      const matchesSearch =
        !normalizedSearch ||
        (ticket.title || '').toLowerCase().includes(normalizedSearch) ||
        (ticket.description || '').toLowerCase().includes(normalizedSearch) ||
        (ticket.category || '').toLowerCase().includes(normalizedSearch) ||
        String(ticket.id).includes(normalizedSearch) ||
        (ticket.studentName || '').toLowerCase().includes(normalizedSearch)

      const matchesStatus =
        statusFilter === 'All' || ticket.status === statusFilter
      const matchesPriority =
        priorityFilter === 'All' || ticket.priority === priorityFilter
      const matchesCategory =
        categoryFilter === 'All' || ticket.category === categoryFilter

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory
    })
  }, [tickets, searchTerm, statusFilter, priorityFilter, categoryFilter])

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    statusFilter !== 'All' ||
    priorityFilter !== 'All' ||
    categoryFilter !== 'All'

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('All')
    setPriorityFilter('All')
    setCategoryFilter('All')
  }

  return (
    <div>
      <section className="student-welcome-section mb-4">
        <div>
          <span className="student-welcome-label">{t('tickets.supportLabel')}</span>
          <h1 className="page-title mt-2">{t('tickets.supportTitle')}</h1>
          <p className="page-subtitle mb-0">{t('tickets.supportSubtitle')}</p>
        </div>

        <div className="ticket-list-summary">
          <div>
            <p className="ticket-list-summary-label">{t('tickets.visibleRequests')}</p>
            <strong className="ticket-list-summary-value">
              {filteredTickets.length}
            </strong>
          </div>
          <div className="ticket-list-summary-icon">
            <i className="bi bi-ticket-perforated"></i>
          </div>
        </div>
      </section>

      <section className="card app-card mb-4">
        <div className="card-body p-4">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
            <div>
              <h2 className="h5 fw-bold mb-1">{t('tickets.searchAndFilters')}</h2>
              <p className="text-muted mb-0">{t('tickets.searchAndFiltersSubtitle')}</p>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={clearFilters}
              >
                <i className="bi bi-x-circle me-2"></i>
                {t('tickets.clearFilters')}
              </button>
            )}
          </div>

          <div className="row g-3">
            <div className="col-12 col-xl-4">
              <label className="form-label fw-semibold" htmlFor="ticketSearch">
                {t('tickets.search')}
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  id="ticketSearch"
                  type="search"
                  className="form-control custom-form-control"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={t('tickets.searchPlaceholder')}
                />
              </div>
            </div>

            <div className="col-12 col-md-4 col-xl-2">
              <label className="form-label fw-semibold" htmlFor="statusFilter">
                {t('tickets.status')}
              </label>
              <select
                id="statusFilter"
                className="form-select custom-form-control"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="All">{t('tickets.allStatuses')}</option>
                {STATUSES.map((status) => (
                  <option value={status} key={status}>
                    {t(`statuses.${status}`)}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-4 col-xl-2">
              <label className="form-label fw-semibold" htmlFor="priorityFilter">
                {t('tickets.priority')}
              </label>
              <select
                id="priorityFilter"
                className="form-select custom-form-control"
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value)}
              >
                <option value="All">{t('tickets.allPriorities')}</option>
                {PRIORITIES.map((priority) => (
                  <option value={priority} key={priority}>
                    {t(`priorities.${priority}`)}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-4 col-xl-4">
              <label className="form-label fw-semibold" htmlFor="categoryFilter">
                {t('tickets.category')}
              </label>
              <select
                id="categoryFilter"
                className="form-select custom-form-control"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option value="All">{t('tickets.allCategories')}</option>
                {categories.map((category) => (
                  <option value={category} key={category}>
                    {t(`categories.${category}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-4 pt-3 border-top">
            <span className="text-muted small">
              {t('tickets.showing', {
                visible: filteredTickets.length,
                total: tickets.length,
              })}
            </span>
            {hasActiveFilters && (
              <span className="badge rounded-pill bg-primary-subtle text-primary px-3 py-2">
                {t('tickets.filtersActive')}
              </span>
            )}
          </div>
        </div>
      </section>

      {filteredTickets.length === 0 ? (
        <EmptyState
          icon="bi-search"
          title={t('tickets.emptyMatchTitle')}
          description={t('tickets.emptyMatchDesc')}
        >
          <button type="button" className="btn btn-primary" onClick={clearFilters}>
            <i className="bi bi-arrow-counterclockwise me-2"></i>
            {t('tickets.resetSearch')}
          </button>
        </EmptyState>
      ) : (
        <div className="card app-card support-ticket-table-card">
          <div className="table-responsive">
            <table className="table align-middle mb-0 support-ticket-table">
              <thead>
                <tr>
                  <th>{t('tickets.colTicket')}</th>
                  <th>{t('tickets.colStudent')}</th>
                  <th>{t('tickets.colCategory')}</th>
                  <th>{t('tickets.colPriority')}</th>
                  <th>{t('tickets.colStatus')}</th>
                  <th>{t('tickets.colUpdated')}</th>
                  <th aria-label="Actions"></th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>
                      <p className="support-ticket-number">
                        {t('common.ticketNumber', { id: ticket.id })}
                      </p>
                      <strong className="support-ticket-title">{ticket.title}</strong>
                    </td>
                    <td>
                      <div className="support-student-cell">
                        <span className="support-student-avatar">
                          <i className="bi bi-mortarboard"></i>
                        </span>
                        <div>
                          <strong>{ticket.studentName || t('common.student')}</strong>
                          <p className="mb-0 text-muted small">{t('common.student')}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="support-category-badge">
                        <i className="bi bi-folder me-2"></i>
                        {t(`categories.${ticket.category}`)}
                      </span>
                    </td>
                    <td>
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td>
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="text-muted">{formatDate(ticket.updatedAt, locale)}</td>
                    <td>
                      <Link
                        className="btn btn-outline-primary btn-sm support-view-button"
                        to={`/tickets/${ticket.id}`}
                      >
                        {t('common.view')}
                        <i className="bi bi-arrow-right ms-2"></i>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function TicketsPage() {
  const user = useCurrentUser()
  const isSupport = user?.role === 'support'
  const { t } = useLanguage()
  const { tickets, loading, error } = useTickets()

  if (loading) {
    return <LoadingState message={t('tickets.loading')} />
  }

  if (error) {
    return <ErrorState message={error} />
  }

  return isSupport ? (
    <SupportTicketList tickets={tickets} />
  ) : (
    <StudentTicketList tickets={tickets} />
  )
}

export default TicketsPage
