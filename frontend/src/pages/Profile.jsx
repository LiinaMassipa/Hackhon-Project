import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import UserProfileHeader from "../components/UserProfileHeader";
import UserProjectsGrid from "../components/UserProjectsGrid";
import { mockProfiles, defaultCurrentUser } from "../data/mockProfiles";
import { mockProjects } from "../data/mockProjects";
import { projectsApi } from "../api/api";

export default function Profile() {
  const { userId } = useParams();

  // Determine current authenticated session
  const storedUserRaw = localStorage.getItem("user");
  const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;
  const token = localStorage.getItem("token");

  // Determine which user profile to load
  // If :userId is provided, lookup that user. Otherwise use stored user or default user #1.
  const targetUserId = userId ? String(userId) : storedUser?.id ? String(storedUser.id) : "1";

  // Check if viewing own profile
  // If route is /profile (no userId param) or userId matches logged-in user's id
  const naturallyOwnProfile = !userId || (storedUser && String(storedUser.id) === String(userId));
  
  // Interactive view mode toggle for demo / judges
  const [viewModeOverride, setViewModeOverride] = useState(null); // null | 'owner' | 'public'
  const isOwnProfile = viewModeOverride !== null ? viewModeOverride === "owner" : naturallyOwnProfile;

  // Load custom saved profile from localStorage if any
  const savedProfileKey = `sg_profile_${targetUserId}`;
  const getInitialProfile = () => {
    const cached = localStorage.getItem(savedProfileKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // fallback
      }
    }
    return mockProfiles[targetUserId] || {
      ...defaultCurrentUser,
      id: targetUserId,
      name: storedUser?.name || defaultCurrentUser.name,
      username: storedUser?.username || storedUser?.name?.toLowerCase().replace(/\s+/g, "_") || defaultCurrentUser.username,
      email: storedUser?.email || defaultCurrentUser.email,
    };
  };

  const [profile, setProfile] = useState(getInitialProfile);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch or filter projects for this user
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const savedProjectsKey = `sg_projects_user_${targetUserId}`;
    const cachedProjects = localStorage.getItem(savedProjectsKey);

    if (cachedProjects) {
      try {
        const parsed = JSON.parse(cachedProjects);
        setProjects(parsed);
        setLoading(false);
        return;
      } catch {
        // proceed to api/mock
      }
    }

    projectsApi
      .list()
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : data?.projects || [];
        // Match user's projects by userId or author
        const userProjects = list.filter(
          (p) =>
            String(p.userId) === String(targetUserId) ||
            String(p.user_id) === String(targetUserId) ||
            p.author === profile.username
        );

        if (userProjects.length > 0) {
          setProjects(userProjects);
        } else {
          // Fallback to matching mock projects
          const fallback = mockProjects.filter(
            (p) =>
              String(p.userId) === String(targetUserId) ||
              p.author === profile.username
          );
          setProjects(fallback);
        }
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        const fallback = mockProjects.filter(
          (p) =>
            String(p.userId) === String(targetUserId) ||
            p.author === profile.username
        );
        setProjects(fallback);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [targetUserId, profile.username]);

  // Recalculate metrics whenever projects change
  const computedMetrics = useMemo(() => {
    const totalProjects = projects.length;
    const totalViews = projects.reduce((acc, p) => acc + (Number(p.views) || 0), 0);
    const totalVotes = projects.reduce((acc, p) => acc + (Number(p.votes) || 0), 0);
    
    let avgRating = 0;
    const ratedProjects = projects.filter((p) => typeof p.rating === "number" && p.rating > 0);
    if (ratedProjects.length > 0) {
      const sumRating = ratedProjects.reduce((acc, p) => acc + p.rating, 0);
      avgRating = Number((sumRating / ratedProjects.length).toFixed(1));
    }

    return {
      totalProjects,
      totalViews,
      totalVotes,
      averageRating: avgRating,
    };
  }, [projects]);

  // Combined profile with real-time computed metrics
  const activeProfile = useMemo(() => {
    return {
      ...profile,
      metrics: computedMetrics,
    };
  }, [profile, computedMetrics]);

  // Handle profile updates
  const handleUpdateProfile = (updatedProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem(savedProfileKey, JSON.stringify(updatedProfile));
  };

  // Handle project updates
  const handleUpdateProject = (updatedProject) => {
    const nextProjects = projects.map((p) =>
      (p.id || p._id) === (updatedProject.id || updatedProject._id) ? updatedProject : p
    );
    setProjects(nextProjects);
    localStorage.setItem(`sg_projects_user_${targetUserId}`, JSON.stringify(nextProjects));
  };

  // Handle project deletion
  const handleDeleteProject = (projectId) => {
    const nextProjects = projects.filter((p) => (p.id || p._id) !== projectId);
    setProjects(nextProjects);
    localStorage.setItem(`sg_projects_user_${targetUserId}`, JSON.stringify(nextProjects));
  };

  return (
    <div className="profile-page pb-5">
      {/* Top Banner Navigation & View Mode Switcher */}
      <div className="bg-light border-bottom py-2">
        <div className="container d-flex flex-wrap align-items-center justify-content-between gap-2">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0 small">
              <li className="breadcrumb-item">
                <Link to="/home" className="text-decoration-none text-muted">
                  Home
                </Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/gallery" className="text-decoration-none text-muted">
                  Gallery
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {profile.name} (@{profile.username})
              </li>
            </ol>
          </nav>

          {/* Quick Demo Selector & Role Switcher */}
          <div className="d-flex align-items-center gap-2 small">
            <span className="text-muted d-none d-md-inline">Profile Demo View:</span>
            <div className="btn-group btn-group-sm" role="group" aria-label="Profile View Mode">
              <button
                type="button"
                className={`btn ${isOwnProfile ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setViewModeOverride("owner")}
                title="View with editing privileges (Owner mode)"
              >
                <i className="bi bi-shield-lock-fill me-1"></i>
                Owner Mode
              </button>
              <button
                type="button"
                className={`btn ${!isOwnProfile ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setViewModeOverride("public")}
                title="View as public visitor (Read-only mode)"
              >
                <i className="bi bi-eye-fill me-1"></i>
                Public View
              </button>
            </div>

            {/* Switch between demo users */}
            <div className="dropdown">
              <button
                className="btn btn-sm btn-outline-secondary dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Switch User
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                <li>
                  <Link className="dropdown-item" to="/profile/1">
                    Alex Rivera (Owner Demo, 3 projects)
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/profile/2">
                    Sarah Chen (Peer Demo, 2 projects)
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/profile/3">
                    Jordan Lee (Empty State Demo, 0 projects)
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Header Section */}
      <UserProfileHeader
        profile={activeProfile}
        isOwnProfile={isOwnProfile}
        onUpdateProfile={handleUpdateProfile}
      />

      {/* User Projects Section */}
      <div className="container">
        {loading ? (
          <div className="row g-4">
            {[1, 2, 3].map((n) => (
              <div className="col-12 col-md-6 col-lg-4" key={n}>
                <div className="sg-skeleton" style={{ height: 300 }}></div>
              </div>
            ))}
          </div>
        ) : (
          <UserProjectsGrid
            projects={projects}
            isOwnProfile={isOwnProfile}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
          />
        )}
      </div>
    </div>
  );
}

