import { useLanguage } from '../../context/LanguageProvider'
import { formatDateTime } from '../../lib/ticketFormat'

function TicketConversation({ comments }) {
  const { t, locale } = useLanguage()

  if (comments.length === 0) {
    return (
      <div className="empty-state mb-4">
        <i className="bi bi-chat-left-text display-6 text-primary"></i>
        <h3 className="h5 fw-bold mt-3">{t('ticketDetails.noMessagesTitle')}</h3>
        <p className="text-muted mb-0">{t('ticketDetails.noMessagesDesc')}</p>
      </div>
    )
  }

  return (
    <div className="support-conversation-list mb-4">
      {comments.map((message) => {
        const isSupport = message.authorRole === 'support'

        return (
          <article
            className={`support-message ${
              isSupport ? 'support-message-agent' : 'support-message-student'
            }`}
            key={message.id}
          >
            <div
              className={`support-message-avatar ${
                isSupport ? 'support-avatar-agent' : 'support-avatar-student'
              }`}
            >
              <i className={isSupport ? 'bi bi-headset' : 'bi bi-mortarboard'}></i>
            </div>

            <div className="flex-grow-1">
              <div className="d-flex flex-column flex-sm-row justify-content-between gap-2 mb-2">
                <div>
                  <strong>{message.authorName}</strong>
                  <span className="badge bg-light text-dark border ms-2">
                    {isSupport ? t('common.support') : t('common.student')}
                  </span>
                </div>

                <small className="text-muted">
                  {formatDateTime(message.createdAt, locale)}
                </small>
              </div>

              <p className="mb-0 support-message-text">{message.message}</p>
            </div>
          </article>
        )
      })}
    </div>
  )
}

export default TicketConversation
