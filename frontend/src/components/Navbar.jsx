import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItem = (to, label, icon) => (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `nav-link px-2 d-inline-flex align-items-center gap-1 ${isActive ? "active" : ""}`
      }
    >
      {icon && <i className={`bi ${icon} me-1`} aria-hidden="true"></i>}
      {label}
    </NavLink>
  );

  // Resolved display name, defaulting to "Sally" if not set in profile
  const displayName = user?.name || user?.username || "Sally";

  return (
    <nav className="navbar navbar-expand-lg sg-navbar sticky-top" aria-label="Main Navigation">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/" aria-label="ShowCase Gallery Home">
          <span aria-hidden="true">🚀</span>
          ShowCase <span className="brand-accent">Gallery</span>
        </Link>

        <button
          className="navbar-toggler text-white border-white-50"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#sgNavContent"
          aria-controls="sgNavContent"
          aria-expanded="false"
          aria-label="Toggle navigation menu"
        >
          <span className="navbar-toggler-icon" style={{ filter: "invert(1)" }}></span>
        </button>

        <div className="collapse navbar-collapse" id="sgNavContent">
          {/* Public Navigation Links */}
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            <li className="nav-item">{navItem("/", "Home", "bi-house")}</li>
            <li className="nav-item">{navItem("/gallery", "Projects", "bi-grid")}</li>
            <li className="nav-item">{navItem("/leaderboard", "Rankings", "bi-trophy")}</li>
            {isAuthenticated && (
              <li className="nav-item">{navItem("/profile", "My Profile", "bi-person-circle")}</li>
            )}
          </ul>

          {/* Action & Auth Controls */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {/* Submit Project CTA (Guarded by ProtectedRoute if accessed by a guest) */}
            <Link to="/submit" className="sg-btn-primary text-decoration-none" aria-label="Submit Your Project">
              <i className="bi bi-plus-lg me-1" aria-hidden="true"></i>
              Submit Your Project
            </Link>

            {isAuthenticated ? (
              /* Authenticated User Controls: Sally Profile Pill & Logout */
              <div className="d-flex align-items-center gap-2 ms-lg-2">
                <Link
                  to="/profile"
                  className="btn btn-outline-light btn-sm d-flex align-items-center gap-2 py-1 px-3 rounded-pill"
                  title={`Logged in as ${displayName}`}
                  aria-label={`Logged in as ${displayName}. View your profile`}
                >
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white"
                    style={{ width: 22, height: 22, fontSize: "0.75rem", fontWeight: "bold" }}
                    aria-hidden="true"
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="fw-semibold">{displayName}</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-outline-danger btn-sm py-1 px-2 d-inline-flex align-items-center gap-1"
                  title="Log out"
                  aria-label="Log out of account"
                >
                  <i className="bi bi-box-arrow-right" aria-hidden="true"></i>
                  <span className="d-none d-md-inline">Logout</span>
                </button>
              </div>
            ) : (
              /* Guest Controls: Login and Register buttons */
              <div className="d-flex align-items-center gap-2 ms-lg-2">
                <Link
                  to="/login"
                  className="sg-btn-outline-light py-1 px-3 text-decoration-none"
                  aria-label="Log In"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-outline-light btn-sm py-1 px-3 rounded-pill text-decoration-none fw-semibold"
                  aria-label="Create new account"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
