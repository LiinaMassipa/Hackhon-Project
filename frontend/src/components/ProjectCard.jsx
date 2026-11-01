import { Link } from "react-router-dom";

const BADGE_CLASS = {
  react: "sg-badge-react",
  "react.js": "sg-badge-react",
  "node.js": "sg-badge-node",
  node: "sg-badge-node",
  mongodb: "sg-badge-mongo",
  python: "sg-badge-python",
};

function badgeClass(tech) {
  if (typeof tech !== "string") return "sg-badge-default";
  return BADGE_CLASS[tech.toLowerCase()] || "sg-badge-default";
}

export default function ProjectCard({ project = {} }) {
  const title = project.title || project.name || "Untitled Project";
  const tagline = project.tagline || project.description || "";
  const rating = Number(project.rating || 0).toFixed(1);
  const votes = project.votes || 0;

  // Normalize tech stack (DB uses techInput, mock used tech)
  let techList = [];
  const rawTech = project.techInput || project.tech;
  if (Array.isArray(rawTech)) {
    techList = rawTech;
  } else if (typeof rawTech === "string") {
    try {
      const parsed = JSON.parse(rawTech);
      techList = Array.isArray(parsed) ? parsed : [rawTech];
    } catch {
      techList = rawTech.split(",").map((t) => t.trim()).filter(Boolean);
    }
  }

  // Image URL normalization
  const rawImage = project.image || project.image_url;
  let imageUrl = null;
  if (rawImage) {
    if (rawImage.startsWith("http")) {
      imageUrl = rawImage;
    } else if (rawImage.startsWith("/uploads/")) {
      imageUrl = `http://localhost:5000${rawImage}`;
    } else {
      imageUrl = rawImage;
    }
  }

return (
    <Link to={`/projects/${project.id || project._id}`} className="text-decoration-none">
      <div className="sg-project-card">
        <div className={`sg-project-thumb ${imageUrl ? "has-image" : "no-image"}`}>
          {imageUrl && (
            <img
              src={imageUrl}
              alt={title}
              className="sg-project-thumb-img"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentElement.classList.remove("has-image");
                e.target.parentElement.classList.add("no-image");
              }}
            />
          )}
          <div className="sg-project-thumb-overlay">
            <h3>{title}</h3>
          </div>
        </div>

        <div className="sg-project-body">
          <p className="desc mb-2">{tagline}</p>
          <div>
            {techList.slice(0, 3).map((t, index) => (
              <span key={index} className={`sg-badge ${badgeClass(t)}`}>
                {t}
              </span>
            ))}
          </div>
          <div className="sg-meta">
            <span>
              <i className="bi bi-star-fill star me-1"></i>
              {rating}
            </span>
            <span>
              <i className="bi bi-eye me-1"></i>
              {votes}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}