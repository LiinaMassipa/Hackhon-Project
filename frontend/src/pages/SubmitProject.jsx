import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { projectsApi } from "../api/api";

const CATEGORIES = ["Sustainability", "Education", "Health", "Finance", "Lifestyle", "General"];

const initialForm = {
  name: "",
  tagline: "",
  description: "",
  team: "",
  category: "General",
  techInput: "",
  github: "",
  demo: "",
};

export default function SubmitProject() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState([]);
  const [status, setStatus] = useState("idle");

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validateClientSide() {
    const errs = [];
    if (!form.name.trim()) errs.push("Project name is required.");
    if (!form.tagline.trim()) errs.push("A short tagline is required.");
    if (!form.description.trim()) errs.push("A description is required.");
    if (!form.team.trim()) errs.push("Team name is required.");
    if (!imageFile) errs.push("A project image is required.");
    if (form.github && !/^https?:\/\//i.test(form.github)) {
      errs.push("GitHub link must start with http:// or https://");
    }
    if (form.demo && !/^https?:\/\//i.test(form.demo)) {
      errs.push("Demo link must start with http:// or https://");
    }
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const clientErrors = validateClientSide();
    if (clientErrors.length) {
      setErrors(clientErrors);
      return;
    }

    setErrors([]);
    setStatus("submitting");

    // Construct FormData object to handle image upload
    const formData = new FormData();
    formData.append("title", form.name.trim());
    formData.append("name", form.name.trim());
    formData.append("tagline", form.tagline.trim());
    formData.append("description", form.description.trim());
    formData.append("team", form.team.trim());
    formData.append("category", form.category);
    formData.append("github", form.github.trim());
    formData.append("demo", form.demo.trim());

    const techArray = form.techInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    formData.append("tech", JSON.stringify(techArray));

    // Key 'image' matches Multer's upload.single('image') on the server
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const created = await projectsApi.create(formData);
      setStatus("success");
      const projectId = created?.id || created?.projectId || created?.insertId;
      setTimeout(() => navigate(`/projects/${projectId}`), 1200);
    } catch (err) {
      setStatus("idle");
      setErrors(err.details || [err.message || "Something went wrong. Please try again."]);
    }
  }

  if (status === "success") {
    return (
      <div className="container my-5 text-center">
        <div className="sg-form-card mx-auto" style={{ maxWidth: 480 }}>
          <i className="bi bi-check-circle-fill" style={{ fontSize: "2.5rem", color: "#16a34a" }}></i>
          <h4 className="mt-3">Project submitted!</h4>
          <p className="text-muted">Taking you to your project page...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h1 className="sg-section-title mb-1">➕ Submit Your Project</h1>
          <p className="text-muted mb-4">
            Share what you built — it'll appear in the gallery right away.
          </p>

          {errors.length > 0 && (
            <div className="alert alert-danger" role="alert">
              <strong>Please fix the following:</strong>
              <ul className="mb-0 mt-1">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <form className="sg-form-card" onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Project name *
              </label>
              <input
                id="name"
                className="form-control"
                maxLength={80}
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. EcoTrack"
                required
              />
            </div>

            <div className="mb-3">
                  <label htmlFor="image" className="form-label">
                    Project Image *
                  </label>
                  <input
                    id="image"
                    type="file"
                    className="form-control"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={(e) => {
                      const f = e.target.files[0];
                      setImageFile(f);
                      if (f) setPreviewUrl(URL.createObjectURL(f));
                      else setPreviewUrl(null);
                    }}
                    required
                  />
                  {previewUrl && (
                    <div className="sg-image-preview mt-3">
                      <img src={previewUrl} alt="Preview" />
                      <button
                        type="button"
                        className="sg-image-preview-remove"
                        onClick={() => {
                          setImageFile(null);
                          setPreviewUrl(null);
                        }}
                        aria-label="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div> 

            <div className="mb-3">
              <label htmlFor="tagline" className="form-label">
                Tagline *
              </label>
              <input
                id="tagline"
                className="form-control"
                maxLength={140}
                value={form.tagline}
                onChange={(e) => update("tagline", e.target.value)}
                placeholder="One sentence that sells it"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="description" className="form-label">
                Description *
              </label>
              <textarea
                id="description"
                className="form-control"
                rows={4}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="What does it do? What problem does it solve?"
                required
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="team" className="form-label">
                  Team name *
                </label>
                <input
                  id="team"
                  className="form-control"
                  value={form.team}
                  onChange={(e) => update("team", e.target.value)}
                  placeholder="e.g. Green Coders"
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="category" className="form-label">
                  Category
                </label>
                <select
                  id="category"
                  className="form-select"
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="tech" className="form-label">
                Tech stack (comma-separated)
              </label>
              <input
                id="tech"
                className="form-control"
                value={form.techInput}
                onChange={(e) => update("techInput", e.target.value)}
                placeholder="React, Node.js, MySQL"
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="github" className="form-label">
                  GitHub link
                </label>
                <input
                  id="github"
                  type="url"
                  className="form-control"
                  value={form.github}
                  onChange={(e) => update("github", e.target.value)}
                  placeholder="https://github.com/your-team/project"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="demo" className="form-label">
                  Live demo link
                </label>
                <input
                  id="demo"
                  type="url"
                  className="form-control"
                  value={form.demo}
                  onChange={(e) => update("demo", e.target.value)}
                  placeholder="https://your-demo.app"
                />
              </div>
            </div>

            <button type="submit" className="sg-btn-primary w-100 mt-2" disabled={status === "submitting"}>
              {status === "submitting" ? "Submitting..." : "Submit Project"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}