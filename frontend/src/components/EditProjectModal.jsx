import { useState } from "react";

export default function EditProjectModal({ project, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: project.title || project.name || "",
    tagline: project.tagline || "",
    description: project.description || "",
    category: project.category || "General",
    tech: Array.isArray(project.tech)
      ? project.tech.join(", ")
      : typeof project.techInput === "string"
      ? project.techInput
      : project.tech || "",
    githubUrl: project.github_url || project.github || "",
    demoUrl: project.demo_url || project.demo || ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedData = {
      ...formData,
      tech: formData.tech.split(",").map((t) => t.trim()).filter(Boolean)
    };
    onSave(updatedData);
  };

  return (
    <div
      className="modal d-block"
      style={{ backgroundColor: "rgba(10, 14, 39, 0.6)", backdropFilter: "blur(4px)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header text-white" style={{ backgroundColor: "var(--sg-accent)" }}>
            <h5 className="modal-title m-0">Edit Project</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4 bg-white">
              <div className="mb-3">
                <label className="form-label fw-bold" style={{ color: "var(--sg-text-dark)" }}>
                  Project Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold" style={{ color: "var(--sg-text-dark)" }}>
                  Tagline
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  maxLength={140}
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold" style={{ color: "var(--sg-text-dark)" }}>
                  Description
                </label>
                <textarea
                  className="form-control"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                ></textarea>
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold" style={{ color: "var(--sg-text-dark)" }}>
                  Tech Stack (comma separated)
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="tech"
                  value={formData.tech}
                  onChange={handleChange}
                  placeholder="React, Node.js, MySQL"
                />
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold" style={{ color: "var(--sg-text-dark)" }}>
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    className="form-control"
                    name="githubUrl"
                    value={formData.githubUrl}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold" style={{ color: "var(--sg-text-dark)" }}>
                    Live Demo URL
                  </label>
                  <input
                    type="url"
                    className="form-control"
                    name="demoUrl"
                    value={formData.demoUrl}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer bg-light border-top-0">
              <button type="button" className="btn text-muted" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="sg-btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}