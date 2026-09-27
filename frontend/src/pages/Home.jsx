import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProjectCard from "../components/ProjectCard";
import { LoadingGrid, ErrorState } from "../components/StateBlocks";
import { projectsApi } from "../api/api";
import { mockProjects } from "../data/mockProjects";

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    projectsApi
  .list({ sort: "rating" })
  .then((data) => {
    if (cancelled) return;
    // Handle both array and object formats
    const projectsArray = Array.isArray(data) ? data : (data.projects || []);
    setProjects(projectsArray.slice(0, 5));
    setStatus("ready");
  })
  .catch((err) => {
    if (cancelled) return;
    console.error('API Error:', err);
    // Only fallback to mock if it's a network error
    if (err.message.includes('fetch') || err.message.includes('network')) {
      setProjects(mockProjects.slice(0, 5));
    }
    setStatus("ready");
  });

    return () => {
      cancelled = true;
    };
  }, []);

  const totalTeams = new Set(projects.map((p) => p.team)).size;

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
                to showcase their ideas, inspire others, and build the
                future.
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
                    <span
                      className="rounded-circle"
                      style={{ width: 10, height: 10, background: "#f87171", display: "inline-block" }}
                    ></span>
                    <span
                      className="rounded-circle"
                      style={{ width: 10, height: 10, background: "#fbbf24", display: "inline-block" }}
                    ></span>
                    <span
                      className="rounded-circle"
                      style={{ width: 10, height: 10, background: "#34d399", display: "inline-block" }}
                    ></span>
                  </div>
                  <div className="row g-2">
                    {projects.slice(0, 6).map((p) => (
                      <div className="col-4" key={p.id}>
                        <div
                          className="rounded"
                          style={{
                            height: 60,
                            background: "linear-gradient(135deg,#6d28d9,#0a0e27)",
                          }}
                        ></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div
                  className="sg-floating-badge sg-badge-delay-1"
                  style={{ top: -18, right: "35%", background: "#7c5cfc" }}
                >
                  <i className="bi bi-code-slash"></i>
                </div>
                <div
                  className="sg-floating-badge sg-badge-delay-2"
                  style={{ top: 10, right: -20, background: "#10b981" }}
                >
                  <i className="bi bi-people-fill"></i>
                </div>
                <div
                  className="sg-floating-badge sg-badge-delay-3"
                  style={{ bottom: -20, right: -10, background: "#ec4899" }}
                >
                  <i className="bi bi-heart-fill"></i>
                </div>
                <div
                  className="sg-floating-badge sg-badge-delay-4"
                  style={{ top: "40%", left: -20, background: "#3b82f6" }}
                >
                  <i className="bi bi-star-fill"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Featured Projects ---------- */}
      <section className="container my-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="sg-section-title">🚀 Featured Projects</h2>
          <Link to="/gallery" className="fw-semibold" style={{ color: "var(--sg-violet-600)" }}>
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
      </section>

      {/* ---------- Stats + CTA ---------- */}
      <section className="container mb-5">
        <div className="row g-3">
          <div className="col-6 col-md-3">
            <div className="sg-stat-card">
              <div className="sg-stat-icon" style={{ background: "#ede9fe", color: "#7c5cfc" }}>
                <i className="bi bi-folder-fill"></i>
              </div>
              <h3 className="mb-0">120+</h3>
              <span className="text-muted">Projects</span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="sg-stat-card">
              <div className="sg-stat-icon" style={{ background: "#dcfce7", color: "#16a34a" }}>
                <i className="bi bi-people-fill"></i>
              </div>
              <h3 className="mb-0">300+</h3>
              <span className="text-muted">Developers</span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="sg-stat-card">
              <div className="sg-stat-icon" style={{ background: "#dbeafe", color: "#2563eb" }}>
                <i className="bi bi-star-fill"></i>
              </div>
              <h3 className="mb-0">50+</h3>
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

        <div className="sg-cta-panel mt-4">
          <h4>Have an amazing project?</h4>
          <p className="text-muted mb-3">Share your innovation with the world.</p>
          <Link to="/submit" className="sg-btn-primary">
            Submit Your Project
          </Link>
        </div>
      </section>
    </>
  );
}
