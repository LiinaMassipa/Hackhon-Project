import { useState, useMemo } from "react";
import ProjectCard from "./ProjectCard";
import ProjectsEmptyState from "./ProjectsEmptyState";

export default function UserProjectsGrid({
  projects = [],
  isOwnProfile = true,
  onUpdateProject,
  onDeleteProject,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest"); // 'latest' | 'popular' | 'rating' | 'alphabetical'
  const [selectedCategory, setSelectedCategory] = useState("all");

  // State for Edit Project Modal
  const [editingProject, setEditingProject] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    tagline: "",
    description: "",
    tech: "",
    demoUrl: "",
    githubUrl: "",
    category: "",
  });

  // State for Delete confirmation
  const [projectToDelete, setProjectToDelete] = useState(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set();
    projects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["all", ...Array.from(set)];
  }, [projects]);

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    const filtered = projects.filter((project) => {
      // Category filter
      if (selectedCategory !== "all" && project.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (!q) return true;

      const title = (project.name || project.title || "").toLowerCase();
      const tagline = (project.tagline || project.description || "").toLowerCase();
      
      let techStr = "";
      if (Array.isArray(project.tech)) {
        techStr = project.tech.join(" ").toLowerCase();
      } else if (typeof project.tech === "string") {
        techStr = project.tech.toLowerCase();
      }

      return title.includes(q) || tagline.includes(q) || techStr.includes(q);
    });

    // Sorting
    return filtered.sort((a, b) => {
      if (sortBy === "latest") {
        const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
        const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
        return dateB - dateA;
      }
      if (sortBy === "popular") {
        const popA = (a.votes || 0) + (a.views || 0);
        const popB = (b.votes || 0) + (b.views || 0);
        return popB - popA;
      }
      if (sortBy === "rating") {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortBy === "alphabetical") {
        const nameA = (a.name || a.title || "").toLowerCase();
        const nameB = (b.name || b.title || "").toLowerCase();
        return nameA.localeCompare(nameB);
      }
      return 0;
    });
  }, [projects, searchTerm, sortBy, selectedCategory]);

  // Handle Edit Click
  const handleOpenEdit = (project) => {
    let techString = "";
    if (Array.isArray(project.tech)) {
      techString = project.tech.join(", ");
    } else if (typeof project.tech === "string") {
      techString = project.tech;
    }

    setEditingProject(project);
    setEditForm({
      title: project.name || project.title || "",
      tagline: project.tagline || "",
      description: project.description || "",
      tech: techString,
      demoUrl: project.demo || project.demoUrl || "",
      githubUrl: project.github || project.githubUrl || "",
      category: project.category || "General",
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingProject) return;

    const updated = {
      ...editingProject,
      name: editForm.title.trim(),
      title: editForm.title.trim(),
      tagline: editForm.tagline.trim(),
      description: editForm.description.trim(),
      category: editForm.category,
      demo: editForm.demoUrl.trim(),
      demoUrl: editForm.demoUrl.trim(),
      github: editForm.githubUrl.trim(),
      githubUrl: editForm.githubUrl.trim(),
      tech: editForm.tech
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    if (onUpdateProject) {
      onUpdateProject(updated);
    }
    setEditingProject(null);
  };

  const handleConfirmDelete = () => {
    if (projectToDelete && onDeleteProject) {
      onDeleteProject(projectToDelete.id || projectToDelete._id);
    }
    setProjectToDelete(null);
  };

  return (
    <div className="user-projects-showcase">
      {/* Section Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="sg-section-title mb-1">
            <i className="bi bi-folder2-open text-primary me-2"></i>
            {isOwnProfile ? "My Showcase Projects" : "Creator Projects"}
          </h3>
          <p className="text-muted small mb-0">
            {projects.length} project{projects.length !== 1 && "s"} published by this developer
          </p>
        </div>

        {isOwnProfile && projects.length > 0 && (
          <a href="/submit" className="sg-btn-primary d-inline-flex align-items-center gap-2">
            <i className="bi bi-plus-lg"></i>
            New Project
          </a>
        )}
      </div>

      {/* Filter & Search Bar - only shown if user has at least 1 project */}
      {projects.length > 0 && (
        <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
          <div className="row g-2 align-items-center">
            {/* Search Input */}
            <div className="col-12 col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="search"
                  className="form-control border-start-0 bg-light"
                  placeholder="Filter by title, description, or stack..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search user projects"
                />
              </div>
            </div>

            {/* Category Filter */}
            {categories.length > 2 && (
              <div className="col-6 col-md-3">
                <select
                  className="form-select bg-light"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  aria-label="Filter category"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === "all" ? "All Categories" : cat}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort Dropdown */}
            <div className={categories.length > 2 ? "col-6 col-md-4" : "col-12 col-md-7"}>
              <div className="d-flex align-items-center justify-content-end gap-2">
                <span className="text-muted small text-nowrap d-none d-sm-inline">Sort by:</span>
                <select
                  className="form-select bg-light w-auto flex-grow-1 flex-sm-grow-0"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort projects"
                >
                  <option value="latest">Latest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="alphabetical">Title (A - Z)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Projects Grid or Empty State */}
      {projects.length === 0 ? (
        <ProjectsEmptyState isFiltered={false} isOwnProfile={isOwnProfile} />
      ) : filteredAndSortedProjects.length === 0 ? (
        <ProjectsEmptyState
          isFiltered={true}
          isOwnProfile={isOwnProfile}
          onResetFilters={() => {
            setSearchTerm("");
            setSelectedCategory("all");
            setSortBy("latest");
          }}
        />
      ) : (
        <div className="row g-4">
          {filteredAndSortedProjects.map((project) => (
            <div className="col-12 col-md-6 col-lg-4" key={project.id || project._id}>
              <ProjectCard
                project={project}
                isOwner={isOwnProfile}
                showActions={true}
                onEdit={handleOpenEdit}
                onDelete={(proj) => setProjectToDelete(proj)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(10, 14, 39, 0.65)", backdropFilter: "blur(4px)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-pencil-square text-primary me-2"></i>
                  Edit Project Details
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditingProject(null)}
                  aria-label="Close"
                ></button>
              </div>

              <form onSubmit={handleSaveEdit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Project Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Tagline / Pitch</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.tagline}
                      onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })}
                      placeholder="One punchy sentence describing your project"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Tech Stack (comma-separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.tech}
                      onChange={(e) => setEditForm({ ...editForm, tech: e.target.value })}
                      placeholder="React, Node.js, MongoDB"
                    />
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Live Demo URL</label>
                      <input
                        type="url"
                        className="form-control"
                        value={editForm.demoUrl}
                        onChange={(e) => setEditForm({ ...editForm, demoUrl: e.target.value })}
                        placeholder="https://myproject.demo.app"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">GitHub Source Code</label>
                      <input
                        type="url"
                        className="form-control"
                        value={editForm.githubUrl}
                        onChange={(e) => setEditForm({ ...editForm, githubUrl: e.target.value })}
                        placeholder="https://github.com/myteam/project"
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top bg-light rounded-bottom-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-3"
                    onClick={() => setEditingProject(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="sg-btn-primary px-4">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(10, 14, 39, 0.65)", backdropFilter: "blur(4px)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-danger">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Delete Project?
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setProjectToDelete(null)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body py-3">
                <p className="mb-0 text-muted">
                  Are you sure you want to delete{" "}
                  <strong>"{projectToDelete.name || projectToDelete.title}"</strong>? This action
                  cannot be undone.
                </p>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setProjectToDelete(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger px-4"
                  onClick={handleConfirmDelete}
                >
                  Delete Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

