import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProjectCard from "../components/ProjectCard";
import { LoadingGrid, EmptyState, ErrorState } from "../components/StateBlocks";
import { projectsApi, authApi } from "../api/api";

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
}

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(readStoredUser());
  const [tab, setTab] = useState("projects");

  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState("loading");

  // Settings form state
  const [name, setName] = useState(user?.name || "");
  const [nameMsg, setNameMsg] = useState(null); // { type: "success" | "danger", text }
  const [savingName, setSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwMsg, setPwMsg] = useState(null);
  const [savingPw, setSavingPw] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-change"));
    navigate("/", { replace: true });
  };

  // An expired/invalid token means the session is over — send them to log in again
  const handleAuthFailure = (err) => {
    if (err?.status === 401 || err?.status === 403) {
      logout();
      return true;
    }
    return false;
  };

  useEffect(() => {
    let cancelled = false;

    authApi
      .me()
      .then((data) => {
        if (cancelled || !data?.user) return;
        setUser(data.user);
        setName(data.user.name || "");
        localStorage.setItem("user", JSON.stringify(data.user));
      })
      .catch((err) => {
        if (!cancelled) handleAuthFailure(err);
      });

    projectsApi
      .mine()
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : data?.projects || [];
        setProjects(list);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        if (handleAuthFailure(err)) return;
        console.error("Failed to load your projects:", err);
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveName = async (e) => {
    e.preventDefault();
    setNameMsg(null);
    setSavingName(true);
    try {
      const data = await authApi.updateProfile(name.trim());
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("auth-change")); // refreshes the navbar greeting
      setNameMsg({ type: "success", text: "Display name updated." });
    } catch (err) {
      if (handleAuthFailure(err)) return;
      setNameMsg({ type: "danger", text: err.message });
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg(null);

    if (newPassword.length < 6) {
      setPwMsg({ type: "danger", text: "New password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: "danger", text: "New passwords do not match." });
      return;
    }

    setSavingPw(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPwMsg({ type: "success", text: "Password updated." });
    } catch (err) {
      if (handleAuthFailure(err)) return;
      setPwMsg({ type: "danger", text: err.message });
    } finally {
      setSavingPw(false);
    }
  };

  // Quick stats for the header
  const totalVotes = projects.reduce((sum, p) => sum + (Number(p.votes) || 0), 0);
  const rated = projects.filter((p) => Number(p.votes) > 0);
  const avgRating = rated.length
    ? (rated.reduce((sum, p) => sum + Number(p.rating || 0), 0) / rated.length).toFixed(1)
    : "–";

  const displayName = user?.name || "User";
  const initial = displayName.trim().charAt(0).toUpperCase() || "U";

  return (
    <section className="container my-5">
      {/* Header */}
      <div className="sg-form-card sg-profile-header mb-4">
        <div className="d-flex flex-column flex-md-row align-items-md-center gap-4">
          <div className="sg-profile-avatar" aria-hidden="true">
            {initial}
          </div>
          <div className="flex-grow-1">
            <h1 className="h3 mb-1">{displayName}</h1>
            <p className="text-muted mb-0">{user?.email}</p>
          </div>
          <div className="d-flex gap-4 text-center">
            <div>
              <div className="sg-profile-stat">{status === "ready" ? projects.length : "–"}</div>
              <div className="text-muted small">Projects</div>
            </div>
            <div>
              <div className="sg-profile-stat">{status === "ready" ? totalVotes : "–"}</div>
              <div className="text-muted small">Votes</div>
            </div>
            <div>
              <div className="sg-profile-stat">{status === "ready" ? avgRating : "–"}</div>
              <div className="text-muted small">Avg rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-pills mb-4 gap-2" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "projects"}
            className={`nav-link ${tab === "projects" ? "active" : ""}`}
            onClick={() => setTab("projects")}
          >
            <i className="bi bi-collection me-2"></i>My Projects
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "settings"}
            className={`nav-link ${tab === "settings" ? "active" : ""}`}
            onClick={() => setTab("settings")}
          >
            <i className="bi bi-gear me-2"></i>Settings
          </button>
        </li>
      </ul>

      {/* My Projects */}
      {tab === "projects" && (
        <>
          {status === "loading" && <LoadingGrid count={3} />}

          {status === "error" && (
            <ErrorState
              message="Couldn't load your projects. Check that the API server is running."
              onRetry={() => window.location.reload()}
            />
          )}

          {status === "ready" && projects.length === 0 && (
            <>
              <EmptyState
                icon="bi-folder2-open"
                title="You haven't submitted any projects yet"
                message="Share what you've built and it will show up here."
              />
              <div className="text-center mt-3">
                <Link to="/submit" className="sg-btn-primary">
                  Submit Your First Project
                </Link>
              </div>
            </>
          )}

          {status === "ready" && projects.length > 0 && (
            <div className="row g-4">
              {projects.map((p) => (
                <div className="col-12 col-sm-6 col-lg-4" key={p.id}>
                  <ProjectCard project={p} />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Settings */}
      {tab === "settings" && (
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="sg-form-card h-100">
              <h5 className="mb-3">Profile</h5>
              {nameMsg && <div className={`alert alert-${nameMsg.type}`}>{nameMsg.text}</div>}
              <form onSubmit={handleSaveName}>
                <div className="mb-3">
                  <label className="form-label" htmlFor="profile-name">
                    Display name
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    className="form-control"
                    value={name}
                    maxLength={100}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="profile-email">
                    Email
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    className="form-control"
                    value={user?.email || ""}
                    disabled
                    readOnly
                  />
                  <div className="form-text">Email can't be changed.</div>
                </div>
                <button
                  type="submit"
                  className="sg-btn-primary border-0"
                  disabled={savingName || !name.trim() || name.trim() === user?.name}
                >
                  {savingName ? "Saving..." : "Save changes"}
                </button>
              </form>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="sg-form-card h-100">
              <h5 className="mb-3">Change password</h5>
              {pwMsg && <div className={`alert alert-${pwMsg.type}`}>{pwMsg.text}</div>}
              <form onSubmit={handleChangePassword}>
                <div className="mb-3">
                  <label className="form-label" htmlFor="current-password">
                    Current password
                  </label>
                  <input
                    id="current-password"
                    type="password"
                    className="form-control"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="new-password">
                    New password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    className="form-control"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="confirm-password">
                    Confirm new password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    className="form-control"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="sg-btn-primary border-0" disabled={savingPw}>
                  {savingPw ? "Updating..." : "Update password"}
                </button>
              </form>
            </div>
          </div>

          <div className="col-12">
            <div className="sg-form-card d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
              <div>
                <h5 className="mb-1">Log out</h5>
                <p className="text-muted mb-0">Sign out of your account on this device.</p>
              </div>
              <button type="button" onClick={logout} className="sg-btn-outline-danger">
                <i className="bi bi-box-arrow-right me-2"></i>Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
