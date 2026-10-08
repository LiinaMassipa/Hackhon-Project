import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProjectCard from "../components/ProjectCard";
import SearchFilterBar from "../components/SearchFilterBar";
import { LoadingGrid, EmptyState, ErrorState } from "../components/StateBlocks";
import { projectsApi } from "../api/api";

export default function Gallery() {
  const [allProjects, setAllProjects] = useState([]);
  const [status, setStatus] = useState("loading");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    projectsApi
      .list()
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : (data?.projects || []);
        setAllProjects(list);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load backend projects:", err);
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = allProjects
    .filter((p) => {
      const q = search.toLowerCase();
      const titleName = (p.title || p.name || "").toLowerCase();
      const tagline = (p.tagline || p.description || "").toLowerCase();

      let techArray = [];
      if (Array.isArray(p.tech)) {
        techArray = p.tech;
      } else if (typeof p.techInput === "string") {
        try {
          techArray = JSON.parse(p.techInput);
        } catch {
          techArray = p.techInput.split(",").map((t) => t.trim());
        }
      } else if (typeof p.tech === "string") {
        try {
          techArray = JSON.parse(p.tech);
        } catch {
          techArray = p.tech.split(",").map((t) => t.trim());
        }
      }

      return (
        !q ||
        titleName.includes(q) ||
        tagline.includes(q) ||
        (Array.isArray(techArray) && techArray.some((t) => String(t).toLowerCase().includes(q)))
      );
    })
    .filter((p) => !category || p.category === category)
    .sort((a, b) => {
      if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sort === "votes") return (b.votes || 0) - (a.votes || 0);
      if (sort === "new")
        return new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0);
      return 0;
    });

  return (
    <section className="container my-5">
      <div className="mb-4">
        <h1 className="sg-section-title">🖼️ Project Gallery</h1>
        <p className="text-muted">Browse every project the community has shared.</p>
      </div>

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        sort={sort}
        onSortChange={setSort}
      />

      {status === "loading" && <LoadingGrid count={9} />}

      {status === "error" && (
        <ErrorState
          message="Couldn't load the gallery. Check that the API server is running."
          onRetry={() => window.location.reload()}
        />
      )}

      {status === "ready" && filtered.length === 0 && (
        <EmptyState
          title="No projects match your search"
          message="Try a different keyword, or clear your filters."
        />
      )}

      {status === "ready" && filtered.length > 0 && (
        <>
          <p className="text-muted small">
            {filtered.length} project{filtered.length !== 1 && "s"} found
          </p>
          <div className="row g-4">
            {filtered.map((p) => (
              <div className="col-12 col-sm-6 col-lg-4" key={p.id || p._id || p.title}>
                <ProjectCard project={p} />
              </div>
            ))}
          </div>
        </>
      )}

      <div className="sg-cta-panel mt-5">
        <h4>Have an amazing project?</h4>
        <p className="text-muted mb-3">Share your innovation with the world.</p>
        <Link to="/submit" className="sg-btn-primary">
          Submit Your Project
        </Link>
      </div>
    </section>
  );
}