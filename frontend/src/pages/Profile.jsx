import { Link } from "react-router-dom";

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
}

export default function Profile() {
  const user = readStoredUser();
  const displayName = user?.name?.trim() || "Showcase Member";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <section className="container my-5">
      <div className="sg-form-card sg-profile-header">
        <div className="d-flex flex-column flex-md-row align-items-md-center gap-4">
          <div className="sg-profile-avatar" aria-hidden="true">
            {initial}
          </div>
          <div className="flex-grow-1">
            <h1 className="h3 mb-1">{displayName}</h1>
            {user?.email && <p className="text-muted mb-0">{user.email}</p>}
          </div>
        </div>
      </div>

      <div className="sg-form-card mt-4">
        <h2 className="h5">Your profile</h2>
        <p className="text-muted mb-4">
          This profile is read-only. Sign-in and account settings aren’t enabled
          right now.
        </p>
        <div className="d-flex flex-wrap gap-3">
          <Link to="/gallery" className="sg-btn-primary">
            Explore projects
          </Link>
          <Link to="/submit" className="sg-btn-outline-light">
            Submit a project
          </Link>
        </div>
      </div>
    </section>
  );
}
