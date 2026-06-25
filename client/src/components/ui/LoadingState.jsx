function LoadingState({ message = 'Loading...' }) {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center py-5 text-center"
      style={{ minHeight: '300px' }}
    >
      <div className="spinner-border text-primary mb-3" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>

      <p className="text-muted">{message}</p>
    </div>
  )
}

export default LoadingState
