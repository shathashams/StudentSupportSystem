function EmptyState({ icon = 'bi-ticket-detailed', title, description, children }) {
  return (
    <div className="empty-state">
      <i className={`bi ${icon} display-5 text-primary`}></i>

      <h3 className="h4 fw-bold mt-3">{title}</h3>

      {description && (
        <p className={`text-muted ${children ? 'mb-4' : 'mb-0'}`}>{description}</p>
      )}

      {children}
    </div>
  )
}

export default EmptyState
