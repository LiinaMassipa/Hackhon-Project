import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { projectsApi } from "../api/api";
import UserProjectsGrid from "../components/UserProjectsGrid";
import EditProjectModal from "../components/EditProjectModal";

export default function Profile() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    const handleAuthChange = () => {
      try {
        setUser(JSON.parse(localStorage.getItem("user") || "null"));
      } catch {
        setUser(null);
      }
    };
    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    // Fetch projects specifically for the logged-in user
    projectsApi
      .list({ userId: user.id })
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : data?.projects || [];
        setProjects(list.filter((p) => String(p.userId || p.user_id) === String(user.id)));
      })
      .catch((err) => console.error("Failed to load user projects", err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleUpdateProject = async (updatedData) => {
    try {
      const response = await projectsApi.update(editingProject.id, updatedData);
      const updatedProject = response?.project || response || updatedData;

      setProjects((prev) =>
        prev.map((p) => (p.id === updatedProject.id ? { ...p, ...updatedProject } : p))
      );
      setEditingProject(null); // Close modal
    } catch (err) {
      console.error("Failed to update project", err);
    }
  };

  const handleDeleteProject = async (project) => {
    const title = project.title || project.name || "this project";
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await projectsApi.remove(project.id || project._id);
      setProjects((prev) => prev.filter((p) => (p.id || p._id) !== (project.id || project._id)));
    } catch (err) {
      console.error("Failed to delete project", err);
    }
  };

  if (!user) return <div className="container py-5">Please log in to view your profile.</div>;

  return (
    <div className="profile-page pb-5" style={{ backgroundColor: "var(--sg-section-alt)" }}>
      {/* Profile Header */}
      <div className="bg-white border-bottom py-5 mb-4 shadow-sm">
        <div className="container d-flex align-items-center gap-4">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm"
            style={{ width: 80, height: 80, backgroundColor: "var(--sg-accent)", fontSize: "2rem" }}
          >
            {user.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h1 className="h3 mb-1 fw-bold" style={{ color: "var(--sg-text-dark)" }}>
              {user.name}
            </h1>
            <p className="mb-0 text-muted">@{user.username || user.email?.split("@")[0]}</p>
            <p className="mb-0 mt-2 small" style={{ color: "var(--sg-text-soft)" }}>
              {projects.length} {projects.length === 1 ? "Project" : "Projects"} Submitted
            </p>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="h5 mb-0" style={{ color: "var(--sg-text-dark)" }}>
            My Showcase
          </h2>
          <Link to="/submit" className="sg-btn-primary">
            <i className="bi bi-plus-lg me-1"></i> New Project
          </Link>
        </div>

        {loading ? (
          <div className="row g-4">
            {[1, 2, 3].map((n) => (
              <div className="col-12 col-md-6 col-lg-4" key={n}>
                <div className="sg-skeleton rounded-4" style={{ height: 300 }}></div>
              </div>
            ))}
          </div>
        ) : (
          <UserProjectsGrid
            projects={projects}
            onEdit={setEditingProject}
            onDelete={handleDeleteProject}
          />
        )}
      </div>

      {/* Edit Modal */}
      {editingProject && (
        <EditProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSave={handleUpdateProject}
        />
      )}
    </div>
  );
}

