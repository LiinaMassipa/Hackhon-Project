import { Link } from "react-router-dom";

const BADGE_CLASS = {
  react: "sg-badge-react",
  "react.js": "sg-badge-react",
  "next.js": "sg-badge-react",
  "node.js": "sg-badge-node",
  node: "sg-badge-node",
  mongodb: "sg-badge-mongo",
  python: "sg-badge-python",
  flutter: "sg-badge-default",
  "vue.js": "sg-badge-node",
};

function badgeClass(tech) {
  if (typeof tech !== "string") return "sg-badge-default";
  return BADGE_CLASS[tech.toLowerCase()] || "sg-badge-default";
}

function formatDate(dateString) {
  if (!dateString) return "Recently added";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Recently added";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Recently added";
  }
}

export default function ProjectCard({
  project = {},
  isOwner = false,
  showActions = true,
  onEdit,
  onDelete,
}) {
  const projectId = project.id || project._id;
  const title = project.name || project.title || "Untitled Project";
  const tagline = project.tagline || project.description || "";
  const rating = typeof project.rating === "number" ? project.rating.toFixed(1) : "0.0";
  const votes = project.votes || 0;
  const views = project.views || 0;
  const uploadDate = formatDate(project.createdAt || project.created_at);

  // Safely normalize tech stack into an array
  let techList = [];
  if (Array.isArray(project.tech)) {
    techList = project.tech;
  } else if (typeof project.tech === "string") {
    try {
      const parsed = JSON.parse(project.tech);
      techList = Array.isArray(parsed) ? parsed : [project.tech];
    } catch {
      techList = project.tech.split(",").map((t) => t.trim()).filter(Boolean);
    }
  }

  // Handle uploaded images vs fallback text header
  const rawImage = project.image || project.image_url;
  const imageUrl = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `http://localhost:5000/${rawImage.replace(/^\/+/, "")}`
    : null;

  const githubLink = project.github || project.githubUrl;
  const demoLink = project.demo || project.demoUrl;

  return (
    <div className="sg-project-card position-relative d-flex flex-column h-100">
      {/* Thumbnail */}
      <Link to={`/projects/${projectId}`} className="text-decoration-none">
        <div className="sg-project-thumb position-relative overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.3s ease",
              }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100 w-100">
              <h3 className="m-0 text-white text-center px-2">{title}</h3>
            </div>
          )}

          {/* Date pill overlay */}
          <span
            className="position-absolute top-0 end-0 m-2 badge bg-dark bg-opacity-75 text-white fw-normal"
            style={{ fontSize: "0.72rem", backdropFilter: "blur(4px)" }}
          >
            <i className="bi bi-calendar3 me-1"></i>
            {uploadDate}
          </span>
        </div>
      </Link>

      {/* Card Body */}
      <div className="sg-project-body d-flex flex-column flex-grow-1">
        {/* Title */}
        <Link to={`/projects/${projectId}`} className="text-decoration-none text-dark">
          <h4
            className="h6 fw-bold mb-1 text-truncate"
            title={title}
            style={{ color: "var(--sg-navy-900)" }}
          >
            {title}
          </h4>
        </Link>

        {/* Short Description */}
        <p
          className="desc mb-2"
          style={{
            fontSize: "0.86rem",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "2.6em",
          }}
          title={tagline}
        >
          {tagline}
        </p>

        {/* Tech Stack Chips */}
        <div className="mb-2">
          {techList.slice(0, 3).map((t, index) => (
            <span key={index} className={`sg-badge ${badgeClass(t)}`}>
              {t}
            </span>
          ))}
          {techList.length > 3 && (
            <span className="sg-badge sg-badge-default" title={techList.slice(3).join(", ")}>
              +{techList.length - 3}
            </span>
          )}
        </div>

        {/* Meta counters */}
        <div className="sg-meta d-flex align-items-center justify-content-between pt-2 border-top mt-auto mb-2">
          <div className="d-flex align-items-center gap-3">
            <span title={`${rating} rating`}>
              <i className="bi bi-star-fill star me-1"></i>
              {rating}
            </span>
            <span title={`${votes} votes`}>
              <i className="bi bi-hand-thumbs-up me-1"></i>
              {votes}
            </span>
            {views > 0 && (
              <span title={`${views} views`}>
                <i className="bi bi-eye me-1"></i>
                {views}
              </span>
            )}
          </div>

          {project.category && (
            <span className="badge bg-light text-muted border fw-normal" style={{ fontSize: "0.72rem" }}>
              {project.category}
            </span>
          )}
        </div>

        {/* Quick Action Links Bar */}
        {showActions && (
          <div className="pt-2 border-top d-flex align-items-center justify-content-between gap-1 flex-wrap">
            <div className="d-flex align-items-center gap-2">
              <Link
                to={`/projects/${projectId}`}
                className="btn btn-sm btn-outline-secondary py-0 px-2"
                style={{ fontSize: "0.75rem" }}
                title="View details"
              >
                <i className="bi bi-arrow-right-circle me-1"></i>
                View
              </Link>

              {demoLink && (
                <a
                  href={demoLink}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-outline-primary py-0 px-2"
                  style={{ fontSize: "0.75rem" }}
                  title="Live Demo"
                >
                  <i className="bi bi-box-arrow-up-right me-1"></i>
                  Demo
                </a>
              )}

              {githubLink && (
                <a
                  href={githubLink}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-outline-dark py-0 px-2"
                  style={{ fontSize: "0.75rem" }}
                  title="Source Code"
                >
                  <i className="bi bi-github me-1"></i>
                  Code
                </a>
              )}
            </div>

            {/* Owner Actions: Edit / Delete */}
            {isOwner && (
              <div className="d-flex align-items-center gap-1 ms-auto">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary py-0 px-2"
                  style={{ fontSize: "0.75rem" }}
                  onClick={() => onEdit && onEdit(project)}
                  title="Edit project"
                  aria-label="Edit project"
                >
                  <i className="bi bi-pencil-square"></i>
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger py-0 px-2"
                  style={{ fontSize: "0.75rem" }}
                  onClick={() => onDelete && onDelete(project)}
                  title="Delete project"
                  aria-label="Delete project"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}