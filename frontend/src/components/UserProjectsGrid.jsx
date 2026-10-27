import ProjectCard from "./ProjectCard";
import { Link } from "react-router-dom";

export default function UserProjectsGrid({ projects, onEdit, onDelete }) {
  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-5 bg-white rounded-4 border shadow-sm" style={{ borderColor: "var(--sg-border)" }}>
        <div className="mb-3">
          <i className="bi bi-folder2-open text-muted" style={{ fontSize: "3rem" }}></i>
        </div>
        <h3 className="h5" style={{ color: "var(--sg-text-dark)" }}>No projects yet</h3>
        <p className="text-muted mb-4">You haven't submitted any projects to the gallery.</p>
        <Link to="/submit" className="sg-btn-outline-primary">
          Submit Your First Project
        </Link>
      </div>
    );
  }

  return (
    <div className="row g-4">
      {projects.map((project) => (
        <div className="col-12 col-md-6 col-lg-4" key={project.id || project._id}>
          <ProjectCard 
            project={project} 
            isOwner={true} 
            onEdit={onEdit} 
            onDelete={onDelete} 
          />
        </div>
      ))}
    </div>
  );
}