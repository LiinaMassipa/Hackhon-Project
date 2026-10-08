export function LoadingGrid({ count = 6 }) {
  return (
    <div className="row g-4">
      {Array.from({ length: count }).map((_, i) => (
        <div className="col-12 col-sm-6 col-lg-4" key={i}>
          <div className="sg-skeleton" aria-hidden="true">
            <div className="sg-skeleton-thumb" />
            <div className="sg-skeleton-body">
              <div className="sg-skeleton-line" />
              <div className="sg-skeleton-line short" />
              <div className="sg-skeleton-line tiny" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  icon = "bi-inboxes",
  title = "No projects yet",
  message = "Be the first to share what you built.",
  actionLabel,
  onAction,
}) {
  return (
    <div className="sg-state">
      <i className={`bi ${icon}`} style={{ fontSize: "2.5rem" }}></i>
      <h4 className="mt-3">{title}</h4>
      <p>{message}</p>
      {actionLabel && (
        <button className="sg-btn-primary border-0" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function ErrorState({ message = "Something went wrong.", onRetry }) {
  return (
    <div className="sg-state">
      <i className="bi bi-exclamation-triangle" style={{ fontSize: "2.5rem", color: "#dc2626" }}></i>
      <h4 className="mt-3">We hit a snag</h4>
      <p>{message}</p>
      {onRetry && (
        <button className="sg-btn-primary border-0" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
