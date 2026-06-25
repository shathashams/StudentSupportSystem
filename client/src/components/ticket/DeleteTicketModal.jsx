import { useState } from 'react'

import { useLanguage } from '../../context/LanguageProvider'

function DeleteTicketModal({ ticketTitle, onConfirm, onCancel }) {
  const { t } = useLanguage()
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleConfirm = async () => {
    setDeleting(true)
    setError('')

    try {
      await onConfirm()
    } catch (err) {
      setError(err.message)
      setDeleting(false)
    }
  }

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ background: 'rgba(15, 23, 42, 0.55)', zIndex: 1050 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className="card rounded-4 shadow-lg p-4" style={{ maxWidth: '440px', width: '90%' }}>
        <div className="text-center mb-4">
          <div
            className="d-inline-grid rounded-circle bg-danger-subtle text-danger mb-3"
            style={{ width: '64px', height: '64px', placeItems: 'center', fontSize: '1.75rem' }}
          >
            <i className="bi bi-trash3-fill"></i>
          </div>

          <h2 id="delete-modal-title" className="h4 fw-bold mb-1">
            {t('deleteModal.title')}
          </h2>

          <p className="text-muted mb-0">
            {t('deleteModal.description', { title: ticketTitle })}
          </p>
        </div>

        {error && (
          <div
            className="alert alert-danger d-flex align-items-start gap-2 rounded-3 mb-3"
            role="alert"
          >
            <i className="bi bi-exclamation-circle-fill mt-1"></i>
            <span>{error}</span>
          </div>
        )}

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-light border flex-grow-1"
            onClick={onCancel}
            disabled={deleting}
          >
            {t('deleteModal.cancel')}
          </button>

          <button
            type="button"
            className="btn btn-danger flex-grow-1"
            onClick={handleConfirm}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                {t('deleteModal.deleting')}
              </>
            ) : (
              <>
                <i className="bi bi-trash me-2"></i>
                {t('deleteModal.confirm')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteTicketModal
