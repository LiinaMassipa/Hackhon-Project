import { NavLink, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  useEffect(() => {
    const syncAuth = () => {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token);

      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          console.error("Error parsing user data:", e);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    syncAuth();
    window.addEventListener("auth-change", syncAuth);
    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener("auth-change", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  const navItem = (to, label) => (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) => `nav-link px-2 ${isActive ? "active" : ""}`}
    >
      {label}
    </NavLink>
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-change"));
    navigate("/");
  };

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
          </ul>

          <div className="d-flex gap-2 align-items-center">
            {isAuthenticated ? (
              <>
                <span className="navbar-text">
                  👋 Welcome, {user?.name || "User"}!
                </span>
                <Link to="/submit" className="sg-btn-primary">
                  Submit Project
                </Link>
                <button onClick={handleLogout} className="sg-btn-outline-danger">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="sg-btn-outline-primary">
                  Login
                </Link>
                <Link to="/register" className="sg-btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}