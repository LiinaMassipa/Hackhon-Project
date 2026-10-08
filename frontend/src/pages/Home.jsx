import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProjectCard from "../components/ProjectCard";
import { LoadingGrid, ErrorState } from "../components/StateBlocks";
import { projectsApi } from "../api/api";

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    projectsApi
      .list({ sort: "rating" })
      .then((data) => {
        if (cancelled) return;
        const projectsArray = Array.isArray(data) ? data : (data.projects || []);
        setProjects(projectsArray.slice(0, 5));
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("API Error:", err);
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const totalTeams = new Set(projects.map((p) => p.team_name || p.team)).size;

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="sg-hero">
        <div className="container position-relative">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1>
                Discover. Explore.
                <br />
                Celebrate <span className="sg-hero-accent">Innovation.</span>
              </h1>
              <p className="lead mt-3 mb-4">
                ShowCase Gallery is the official platform for hackathon teams
                to showcase their ideas, inspire others, and build the future.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/gallery" className="sg-btn-primary">
                  Explore Projects
                </Link>
                <Link to="/submit" className="sg-btn-outline-light">
                  Submit Your Project
                </Link>
              </div>
            </div>

            <div className="col-lg-6 mt-5 mt-lg-0 d-none d-lg-block">
              <div className="position-relative">
                <div className="sg-hero-mock bg-white p-3">
                  <div className="d-flex gap-2 mb-2">
                    <span className="rounded-circle" style={{ width: 10, height: 10, background: "#f87171", display: "inline-block" }}></span>
                    <span className="rounded-circle" style={{ width: 10, height: 10, background: "#fbbf24", display: "inline-block" }}></span>
                    <span className="rounded-circle" style={{ width: 10, height: 10, background: "#34d399", display: "inline-block" }}></span>
                  </div>
                  <div className="row g-2">
                    {projects.slice(0, 6).map((p) => (
                      <div className="col-4" key={p.id}>
                        <div className="rounded" style={{ height: 60, background: "linear-gradient(135deg,#a29bfe,#74b9ff)" }}></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Featured + Stats (off-white band) ---------- */}
      <div className="sg-section-alt py-5">
        <div className="container">

          {/* Featured Projects */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="sg-section-title">🚀 Featured Projects</h2>
            <Link to="/gallery" className="fw-semibold" style={{ color: "var(--sg-accent)" }}>
              View all projects <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          {status === "loading" && <LoadingGrid count={5} />}
          {status === "error" && <ErrorState message="Couldn't load projects." />}
          {status === "ready" && (
            <div className="row g-4">
              {projects.map((p) => (
                <div className="col-12 col-sm-6 col-lg-4 col-xl" key={p.id}>
                  <ProjectCard project={p} />
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="row g-3 mt-5">
            <div className="col-6 col-md-3">
              <div className="sg-stat-card">
                <div className="sg-stat-icon" style={{ background: "#ede8ff", color: "var(--sg-accent)" }}>
                  <i className="bi bi-folder-fill"></i>
                </div>
                <h3 className="mb-0">10+</h3>
                <span className="text-muted">Projects</span>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="sg-stat-card">
                <div className="sg-stat-icon" style={{ background: "#dcfce7", color: "#16a34a" }}>
                  <i className="bi bi-people-fill"></i>
                </div>
                <h3 className="mb-0">30+</h3>
                <span className="text-muted">Developers</span>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="sg-stat-card">
                <div className="sg-stat-icon" style={{ background: "#dbeafe", color: "#2563eb" }}>
                  <i className="bi bi-star-fill"></i>
                </div>
                <h3 className="mb-0">10+</h3>
                <span className="text-muted">Teams</span>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="sg-stat-card">
                <div className="sg-stat-icon" style={{ background: "#fee2e2", color: "#dc2626" }}>
                  <i className="bi bi-trophy-fill"></i>
                </div>
                <h3 className="mb-0">{totalTeams || 1}</h3>
                <span className="text-muted">Community</span>
              </div>
            </div>
          </div>

          {/* CTA panel */}
          <div className="sg-cta-panel mt-4">
            <h4>Have an amazing project?</h4>
            <p className="text-muted mb-3">Share your innovation with the world.</p>
            <Link to="/submit" className="sg-btn-primary">
              Submit Your Project
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}