import { Link } from "react-router-dom";

/**
 * ProjectsEmptyState - Engaging fallback states for the User Projects showcase
 *
 * Handles both:
 * 1. Truly empty project list (user has not uploaded any projects yet)
 * 2. Search/filter mismatch (filters return 0 matches)
 */
export default function ProjectsEmptyState({
  isFiltered = false,
  isOwnProfile = true,
  onResetFilters,
}) {
  if (isFiltered) {
    return (
      <div className="sg-state py-5 my-3 bg-white rounded-4 border shadow-sm text-center">
        <div
          className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
          style={{
            width: 72,
            height: 72,
            background: "rgba(124, 92, 252, 0.1)",
            color: "var(--sg-violet-600)",
            fontSize: "2rem",
          }}
        >
          <i className="bi bi-search"></i>
        </div>
        <h4 className="fw-bold mb-2">No projects found</h4>
        <p className="text-muted mx-auto mb-4" style={{ maxWidth: 440 }}>
          No projects matched your search criteria or active filters. Try adjusting your search term or reset filters.
        </p>
        {onResetFilters && (
          <button
            type="button"
            className="sg-btn-primary border-0 px-4"
            onClick={onResetFilters}
          >
            <i className="bi bi-arrow-counterclockwise me-2"></i>
            Reset Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="sg-state py-5 my-4 bg-white rounded-4 border shadow-sm text-center">
      <div
        className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
        style={{
          width: 84,
          height: 84,
          background: "linear-gradient(135deg, rgba(124, 92, 252, 0.15), rgba(76, 29, 149, 0.1))",
          color: "var(--sg-violet-600)",
          fontSize: "2.5rem",
        }}
      >
        <i className="bi bi-folder-plus"></i>
      </div>
      <h3 className="fw-bold mb-2">
        {isOwnProfile ? "No projects uploaded yet" : "No published projects"}
      </h3>
      <p className="text-muted mx-auto mb-4" style={{ maxWidth: 460 }}>
        {isOwnProfile
          ? "Showcase your creativity and technical chops to the hackathon community! Submit your first project now."
          : "This creator hasn't published any public projects yet. Check back soon for exciting builds!"}
      </p>
      {isOwnProfile && (
        <Link to="/submit" className="sg-btn-primary d-inline-flex align-items-center gap-2 px-4 py-2">
          <i className="bi bi-plus-circle-fill"></i>
          Upload Your First Project
        </Link>
      )}
    </div>
  );
}

