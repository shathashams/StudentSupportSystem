import { Link, Navigate, useNavigate } from 'react-router-dom'

import TicketForm from '../components/ticket/TicketForm'
import { useLanguage } from '../context/LanguageProvider'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { createTicket } from '../services/ticketService'

function CreateTicketPage() {
  const navigate = useNavigate()
  const user = useCurrentUser()
  const { t } = useLanguage()

  // Only students create tickets
  if (user?.role !== 'student') {
    return <Navigate to="/tickets" replace />
  }

  const handleSubmit = async (values) => {
    const newTicket = await createTicket(values)
    navigate(`/tickets/${newTicket.id}`)
  }

  return (
    <div>
      <div className="mb-4">
        <Link className="create-ticket-back-link" to="/tickets">
          <i className="bi bi-arrow-left me-2"></i>
          {t('ticketDetails.backToMyTickets')}
        </Link>
      </div>

      <div className="create-ticket-header mb-4">
        <div>
          <span className="student-welcome-label">{t('createTicket.label')}</span>
          <h1 className="page-title mt-2">{t('createTicket.title')}</h1>
          <p className="page-subtitle mb-0">{t('createTicket.subtitle')}</p>
        </div>

        <div className="create-ticket-header-icon">
          <i className="bi bi-pencil-square"></i>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <TicketForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('/tickets')}
            submitLabel={t('form.submitTicket')}
            submittingLabel={t('form.creating')}
            submitIcon="bi-send"
          />
        </div>

        <div className="col-12 col-lg-4">
          <aside className="create-ticket-help-card">
            <div className="create-ticket-help-icon">
              <i className="bi bi-lightbulb"></i>
            </div>

            <h2 className="h5 fw-bold">{t('createTicket.tipsTitle')}</h2>

            <p className="text-muted">{t('createTicket.tipsIntro')}</p>

            <div className="create-ticket-tip">
              <i className="bi bi-check-circle-fill"></i>
              <span>{t('createTicket.tip1')}</span>
            </div>

            <div className="create-ticket-tip">
              <i className="bi bi-check-circle-fill"></i>
              <span>{t('createTicket.tip2')}</span>
            </div>

            <div className="create-ticket-tip">
              <i className="bi bi-check-circle-fill"></i>
              <span>{t('createTicket.tip3')}</span>
            </div>

            <div className="create-ticket-tip">
              <i className="bi bi-check-circle-fill"></i>
              <span>{t('createTicket.tip4')}</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default CreateTicketPage
