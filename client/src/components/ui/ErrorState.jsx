function ErrorState({ message }) {
  return (
    <div
      className="alert alert-danger my-4 rounded-3 d-flex align-items-center gap-2"
      role="alert"
    >
      <i className="bi bi-exclamation-triangle-fill"></i>
      <div>{message}</div>
    </div>
  )
}

export default ErrorState
