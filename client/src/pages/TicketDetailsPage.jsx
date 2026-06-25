import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'

import DeleteTicketModal from '../components/ticket/DeleteTicketModal'
import ReplyForm from '../components/ticket/ReplyForm'
import TicketConversation from '../components/ticket/TicketConversation'
import TicketForm from '../components/ticket/TicketForm'
import LoadingState from '../components/ui/LoadingState'
import PriorityBadge from '../components/ui/PriorityBadge'
import StatusBadge from '../components/ui/StatusBadge'
import { useLanguage } from '../context/LanguageProvider'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useTicket } from '../hooks/useTicket'
import { PRIORITIES, STATUSES } from '../lib/constants'
import { formatDateTime } from '../lib/ticketFormat'
import {
  addCommentToTicket,
  deleteTicket,
  updateTicket,
  updateTicketAsStudent,
} from '../services/ticketService'

function TicketNotFound({ message }) {
  const { t } = useLanguage()

  return (
    <div className="empty-state">
      <div className="display-5 text-primary mb-3">
        <i className="bi bi-exclamation-circle"></i>
      </div>
      <h1 className="h3 fw-bold">{t('ticketDetails.notFoundTitle')}</h1>
      <p className="text-muted mb-4">{message || t('ticketDetails.notFoundDesc')}</p>
      <Link className="btn btn-primary" to="/tickets">
        {t('ticketDetails.backToTickets')}
      </Link>
    </div>
  )
}

function MessagesBadge({ count }) {
  const { t } = useLanguage()

  return (
    <span className="badge rounded-pill bg-primary-subtle text-primary px-3 py-2">
      {count} {count === 1 ? t('ticketDetails.message') : t('ticketDetails.messages')}
    </span>
  )
}

function StudentTicketDetails({ ticket, setTicket }) {
  const navigate = useNavigate()
  const { t, locale } = useLanguage()
  const [isEditing, setIsEditing] = useState(false)
  const [editSuccessMessage, setEditSuccessMessage] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const isOpen = ticket.status === 'Open'

  const handleReply = async (message) => {
    const updated = await addCommentToTicket(ticket.id, { message })
    setTicket(updated)
  }

  const handleSaveEdit = async (values) => {
    const updated = await updateTicketAsStudent(ticket.id, values)
    setTicket(updated)
    setIsEditing(false)
    setEditSuccessMessage(t('ticketDetails.editSuccess'))
    setTimeout(() => setEditSuccessMessage(''), 3500)
  }

  const handleDelete = async () => {
    await deleteTicket(ticket.id)
    navigate('/tickets', { replace: true })
  }

  return (
    <div>
      <div className="mb-4">
        <Link className="create-ticket-back-link" to="/tickets">
          <i className="bi bi-arrow-left me-2"></i>
          {t('ticketDetails.backToMyTickets')}
        </Link>
      </div>

      {editSuccessMessage && (
        <div
          className="alert alert-success d-flex align-items-center gap-2 rounded-3 mb-4"
          role="alert"
        >
          <i className="bi bi-check-circle-fill"></i>
          {editSuccessMessage}
        </div>
      )}

      <section className="card app-card mb-4">
        <div className="card-body p-4 p-lg-5">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-start gap-4 mb-4">
            <div>
              <span className="student-welcome-label">
                {t('common.ticketNumber', { id: ticket.id })}
              </span>
              <h1 className="page-title mt-3 mb-2">{ticket.title}</h1>
              <p className="text-muted mb-0">
                {t('common.createdOn', { date: formatDateTime(ticket.createdAt, locale) })}
              </p>
            </div>

            <div className="d-flex flex-wrap align-items-start gap-2">
              <StatusBadge status={ticket.status} dot />
              <PriorityBadge priority={ticket.priority} />

              {isOpen && !isEditing && (
                <>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm rounded-3 px-3"
                    onClick={() => setIsEditing(true)}
                  >
                    <i className="bi bi-pencil me-2"></i>
                    {t('ticketDetails.edit')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm rounded-3 px-3"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <i className="bi bi-trash me-2"></i>
                    {t('ticketDetails.delete')}
                  </button>
                </>
              )}
            </div>
          </div>

          {!isEditing && (
            <>
              <div className="row g-4 mb-4">
                <div className="col-12 col-md-6">
                  <div className="p-3 rounded-4 bg-light border h-100">
                    <p className="text-muted small fw-semibold mb-2 text-uppercase">
                      {t('ticketDetails.category')}
                    </p>
                    <div className="d-flex align-items-center gap-2">
                      <span
                        className="rounded-3 bg-primary-subtle text-primary"
                        style={{ width: '42px', height: '42px', display: 'grid', placeItems: 'center' }}
                      >
                        <i className="bi bi-folder"></i>
                      </span>
                      <strong>{t(`categories.${ticket.category}`)}</strong>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="p-3 rounded-4 bg-light border h-100">
                    <p className="text-muted small fw-semibold mb-2 text-uppercase">
                      {t('ticketDetails.lastUpdated')}
                    </p>
                    <div className="d-flex align-items-center gap-2">
                      <span
                        className="rounded-3 bg-primary-subtle text-primary"
                        style={{ width: '42px', height: '42px', display: 'grid', placeItems: 'center' }}
                      >
                        <i className="bi bi-clock-history"></i>
                      </span>
                      <strong>{formatDateTime(ticket.updatedAt, locale)}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-4 border bg-light">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <span
                    className="rounded-3 bg-primary text-white"
                    style={{ width: '40px', height: '40px', display: 'grid', placeItems: 'center' }}
                  >
                    <i className="bi bi-card-text"></i>
                  </span>
                  <h2 className="h5 fw-bold mb-0">{t('ticketDetails.problemDescription')}</h2>
                </div>
                <p className="mb-0 text-secondary" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
                  {ticket.description}
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      {isEditing && (
        <section className="mb-4">
          <div className="d-flex align-items-center gap-2 mb-3">
            <span
              className="rounded-3 bg-primary text-white"
              style={{ width: '38px', height: '38px', display: 'grid', placeItems: 'center' }}
            >
              <i className="bi bi-pencil-square"></i>
            </span>
            <h2 className="h5 fw-bold mb-0">{t('ticketDetails.editTicket')}</h2>
          </div>

          <TicketForm
            initialValues={{
              title: ticket.title,
              description: ticket.description,
              category: ticket.category,
              priority: ticket.priority,
            }}
            onSubmit={handleSaveEdit}
            onCancel={() => setIsEditing(false)}
            submitLabel={t('form.saveChanges')}
            submittingLabel={t('form.saving')}
            submitIcon="bi-check2-circle"
          />
        </section>
      )}

      <section className="card app-card mb-4">
        <div className="card-body p-4 p-lg-5">
          <div className="d-flex justify-content-between align-items-center gap-3 mb-4">
            <div>
              <h2 className="h3 fw-bold mb-1">{t('ticketDetails.conversationSupport')}</h2>
              <p className="text-muted mb-0">{t('ticketDetails.conversationSupportSubtitle')}</p>
            </div>
            <MessagesBadge count={ticket.comments.length} />
          </div>

          <TicketConversation comments={ticket.comments} />

          <ReplyForm
            onSubmit={handleReply}
            label={t('ticketDetails.replyToSupport')}
            placeholder={t('ticketDetails.replyToSupportPlaceholder')}
          />
        </div>
      </section>

      {showDeleteConfirm && (
        <DeleteTicketModal
          ticketTitle={ticket.title}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  )
}

function SupportTicketDetails({ ticket, setTicket }) {
  const { t, locale } = useLanguage()
  const [selectedStatus, setSelectedStatus] = useState(ticket.status)
  const [selectedPriority, setSelectedPriority] = useState(ticket.priority)
  const [successMessage, setSuccessMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const showSuccess = (text) => {
    setSuccessMessage(text)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleReply = async (message) => {
    const updated = await addCommentToTicket(ticket.id, { message })
    setTicket(updated)
    showSuccess(t('ticketDetails.replySent'))
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    try {
      const updated = await updateTicket(ticket.id, {
        status: selectedStatus,
        priority: selectedPriority,
      })
      setTicket(updated)
      showSuccess(t('ticketDetails.saveSuccess'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-4">
        <Link className="create-ticket-back-link" to="/tickets">
          <i className="bi bi-arrow-left me-2"></i>
          {t('ticketDetails.backToAllTickets')}
        </Link>
      </div>

      {successMessage && (
        <div className="alert alert-success d-flex align-items-center gap-2" role="alert">
          <i className="bi bi-check-circle-fill"></i>
          {successMessage}
        </div>
      )}

      <section className="support-ticket-details-header mb-4">
        <div>
          <span className="student-welcome-label">
            {t('common.ticketNumber', { id: ticket.id })}
          </span>
          <h1 className="page-title mt-3 mb-2">{ticket.title}</h1>
          <p className="text-muted mb-0">
            {t('common.createdOn', { date: formatDateTime(ticket.createdAt, locale) })}
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>
      </section>

      <div className="row g-4">
        <div className="col-12 col-xl-8">
          <section className="card app-card mb-4">
            <div className="card-body p-4 p-lg-5">
              <div className="row g-4 mb-4">
                <div className="col-12 col-md-6">
                  <div className="support-info-card">
                    <div className="support-info-icon">
                      <i className="bi bi-mortarboard"></i>
                    </div>
                    <div>
                      <p className="support-info-label">{t('ticketDetails.student')}</p>
                      <strong>{ticket.studentName || t('common.student')}</strong>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="support-info-card">
                    <div className="support-info-icon">
                      <i className="bi bi-folder"></i>
                    </div>
                    <div>
                      <p className="support-info-label">{t('ticketDetails.category')}</p>
                      <strong>{t(`categories.${ticket.category}`)}</strong>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="support-info-card">
                    <div className="support-info-icon">
                      <i className="bi bi-calendar3"></i>
                    </div>
                    <div>
                      <p className="support-info-label">{t('ticketDetails.created')}</p>
                      <strong>{formatDateTime(ticket.createdAt, locale)}</strong>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="support-info-card">
                    <div className="support-info-icon">
                      <i className="bi bi-clock-history"></i>
                    </div>
                    <div>
                      <p className="support-info-label">{t('ticketDetails.lastUpdated')}</p>
                      <strong>{formatDateTime(ticket.updatedAt, locale)}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="support-description-card">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="support-description-icon">
                    <i className="bi bi-card-text"></i>
                  </div>
                  <h2 className="h5 fw-bold mb-0">{t('ticketDetails.problemDescription')}</h2>
                </div>
                <p className="mb-0 text-secondary support-description-text">
                  {ticket.description}
                </p>
              </div>
            </div>
          </section>

          <section className="card app-card">
            <div className="card-body p-4 p-lg-5">
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                <div>
                  <h2 className="h3 fw-bold mb-1">{t('ticketDetails.conversationStudent')}</h2>
                  <p className="text-muted mb-0">{t('ticketDetails.conversationStudentSubtitle')}</p>
                </div>
                <MessagesBadge count={ticket.comments.length} />
              </div>

              <TicketConversation comments={ticket.comments} />

              <ReplyForm
                onSubmit={handleReply}
                label={t('ticketDetails.replyToStudent')}
                placeholder={t('ticketDetails.replyToStudentPlaceholder')}
              />
            </div>
          </section>
        </div>

        <div className="col-12 col-xl-4">
          <aside className="support-management-panel">
            <div className="support-management-heading">
              <div className="support-management-icon">
                <i className="bi bi-sliders"></i>
              </div>
              <div>
                <h2 className="h5 fw-bold mb-1">{t('ticketDetails.manageTicket')}</h2>
                <p className="text-muted small mb-0">{t('ticketDetails.manageSubtitle')}</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label form-field-label" htmlFor="ticketStatus">
                {t('ticketDetails.statusLabel')}
              </label>
              <select
                id="ticketStatus"
                className="form-select custom-form-control"
                value={selectedStatus}
                onChange={(event) => {
                  const status = event.target.value
                  setSelectedStatus(status)
                  if (status === 'Closed') {
                    setSelectedPriority('Low')
                  }
                }}
              >
                {STATUSES.map((status) => (
                  <option value={status} key={status}>
                    {t(`statuses.${status}`)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label form-field-label" htmlFor="ticketPriority">
                {t('ticketDetails.priorityLabel')}
              </label>
              <select
                id="ticketPriority"
                className="form-select custom-form-control"
                value={selectedPriority}
                onChange={(event) => setSelectedPriority(event.target.value)}
              >
                {PRIORITIES.map((priority) => (
                  <option value={priority} key={priority}>
                    {t(`priorities.${priority}`)}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="btn btn-primary w-100 support-save-button"
              onClick={handleSaveChanges}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  {t('form.saving')}
                </>
              ) : (
                <>
                  <i className="bi bi-check2-circle me-2"></i>
                  {t('form.saveChanges')}
                </>
              )}
            </button>

            <div className="support-management-note">
              <i className="bi bi-info-circle"></i>
              <p className="mb-0">{t('ticketDetails.changesVisibleNote')}</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function TicketDetailsPage() {
  const { ticketId } = useParams()
  const user = useCurrentUser()
  const { t } = useLanguage()
  const { ticket, setTicket, loading, error } = useTicket(ticketId)

  if (loading) {
    return <LoadingState message={t('ticketDetails.loading')} />
  }

  if (error || !ticket) {
    return <TicketNotFound message={error} />
  }

  const isSupport = user?.role === 'support'

  if (!isSupport && ticket.studentId !== user?.id) {
    return <Navigate to="/tickets" replace />
  }

  return isSupport ? (
    <SupportTicketDetails ticket={ticket} setTicket={setTicket} />
  ) : (
    <StudentTicketDetails ticket={ticket} setTicket={setTicket} />
  )
}

export default TicketDetailsPage
