import { NavLink, Link } from "react-router-dom";

export default function Navbar() {
  const navItem = (to, label) => (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) => `nav-link px-2 ${isActive ? "active" : ""}`}
    >
      {label}
    </NavLink>
  );

  return (
    <nav className="navbar navbar-expand-lg sg-navbar sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <span aria-hidden="true">🚀</span>
          ShowCase <span className="brand-accent">Gallery</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#sgNavContent"
          aria-controls="sgNavContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="sgNavContent">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            <li className="nav-item">{navItem("/", "Home")}</li>
            <li className="nav-item">{navItem("/gallery", "Projects")}</li>
            <li className="nav-item">{navItem("/leaderboard", "Rankings")}</li>
            <li className="nav-item">{navItem("/profile", "Profile")}</li>
          </ul>

          <div className="d-flex gap-2 align-items-center">
            <Link to="/submit" className="sg-btn-primary">
              Submit Project
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
