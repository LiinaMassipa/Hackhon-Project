import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import UserProfileHeader from "../components/UserProfileHeader";
import UserProjectsGrid from "../components/UserProjectsGrid";
import { useAuth } from "../context/AuthContext";
import { usersApi, projectsApi } from "../api/api";
import { mockProfiles } from "../data/mockProfiles";

export default function Profile() {
  const { userId } = useParams();
  const { user: authUser, token, login } = useAuth();

  // Check if viewing a specific demo user (e.g., /profile/demo-2 or /profile/demo-3)
  const isDemoRoute = Boolean(userId && String(userId).startsWith("demo-"));
  const demoId = isDemoRoute ? String(userId).replace("demo-", "") : null;

  // Determine if viewing own profile
  const isOwnProfile = !userId || (authUser && String(authUser.id) === String(userId));

  // State
  const [profile, setProfile] = useState(() => {
    if (isDemoRoute) {
      return mockProfiles[demoId] || mockProfiles[2];
    }
    // Real user initial template (strictly isolated from mock profiles)
    const storedUser = authUser || {};
    return {
      id: storedUser.id || "me",
      name: storedUser.name || "New Creator",
      username: storedUser.username || storedUser.email?.split("@")[0] || "creator",
      email: storedUser.email || "",
      headline: storedUser.headline || "",
      skills: storedUser.skills || "",
      bio: storedUser.bio || "",
      location: storedUser.location || "",
      avatarUrl: storedUser.avatarUrl || "",
      joinedDate: storedUser.createdAt
        ? new Date(storedUser.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
        : "Recently joined",
      socialLinks: storedUser.socialLinks || {
        github: storedUser.github || "",
        linkedin: storedUser.linkedin || "",
        website: storedUser.website || "",
        twitter: storedUser.twitter || "",
      },
      hasProfileData: Boolean(
        storedUser.bio ||
        storedUser.headline ||
        storedUser.skills ||
        storedUser.avatarUrl ||
        storedUser.location
      ),
    };
  });

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [autoOpenEdit, setAutoOpenEdit] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  // View mode override for testing how others see the profile
  const [viewModeOverride, setViewModeOverride] = useState(null); // null | 'owner' | 'public'
  const effectiveIsOwnProfile =
    viewModeOverride !== null ? viewModeOverride === "owner" : isOwnProfile && !isDemoRoute;

  // 1. Fetch Real User Profile from Backend MySQL
  useEffect(() => {
    let cancelled = false;

    if (isDemoRoute) {
      // Demo route explicitly loads demo user
      const demoData = mockProfiles[demoId] || mockProfiles[2];
      setProfile(demoData);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Call backend endpoint to fetch the user's real database record
    usersApi
      .getMe()
      .then((data) => {
        if (cancelled) return;
        if (data?.user) {
          const dbUser = data.user;
          const hasData = Boolean(
            dbUser.bio ||
            dbUser.headline ||
            dbUser.skills ||
            dbUser.avatarUrl ||
            dbUser.location
          );

          setProfile({
            ...dbUser,
            hasProfileData: hasData,
          });

          // Trigger onboarding flow if new user has NO profile data yet
          if (!hasData) {
            setIsOnboarding(true);
            setAutoOpenEdit(true);
          } else {
            setIsOnboarding(false);
          }
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn("Backend profile endpoint offline or returned error; using local session state:", err);

        // Offline / fallback using current authenticated user's state
        const storedUser = authUser || {};
        const hasData = Boolean(
          storedUser.bio ||
          storedUser.headline ||
          storedUser.skills ||
          storedUser.avatarUrl ||
          storedUser.location
        );

        setProfile((prev) => ({
          ...prev,
          hasProfileData: hasData,
        }));

        if (!hasData) {
          setIsOnboarding(true);
          setAutoOpenEdit(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isDemoRoute, demoId, authUser]);

  // 2. Fetch User's Real Projects (Separated from Mock Data)
  useEffect(() => {
    let cancelled = false;

    if (isDemoRoute) {
      // Demo user projects
      setProjects([]);
      return;
    }

    const currentUserId = authUser?.id;
    const authorUsername = profile.username;

    // Load from backend API
    projectsApi
      .list({ userId: currentUserId })
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : data?.projects || [];
        // Filter strictly to current authenticated user's projects
        const userProjects = list.filter(
          (p) =>
            (currentUserId && String(p.userId) === String(currentUserId)) ||
            (currentUserId && String(p.user_id) === String(currentUserId)) ||
            (authorUsername && p.author === authorUsername)
        );

        setProjects(userProjects);
      })
      .catch(() => {
        if (cancelled) return;
        // In real user profile mode, if backend is offline or user has no projects,
        // we DO NOT load mock projects for the authenticated user.
        // It stays empty to accurately reflect their real project showcase.
        const cachedProjects = localStorage.getItem(`sg_user_projects_${currentUserId}`);
        if (cachedProjects) {
          try {
            setProjects(JSON.parse(cachedProjects));
          } catch {
            setProjects([]);
          }
        } else {
          setProjects([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authUser?.id, profile.username, isDemoRoute]);

  // Dynamic live metric calculations
  const computedMetrics = useMemo(() => {
    const totalProjects = projects.length;
    const totalViews = projects.reduce((acc, p) => acc + (Number(p.views) || 0), 0);
    const totalVotes = projects.reduce((acc, p) => acc + (Number(p.votes) || 0), 0);

    let avgRating = 0;
    const rated = projects.filter((p) => typeof p.rating === "number" && p.rating > 0);
    if (rated.length > 0) {
      const sum = rated.reduce((acc, p) => acc + p.rating, 0);
      avgRating = Number((sum / rated.length).toFixed(1));
    }

    return {
      totalProjects,
      totalViews,
      totalVotes,
      averageRating: avgRating,
    };
  }, [projects]);

  const activeProfile = useMemo(() => {
    return {
      ...profile,
      metrics: computedMetrics,
    };
  }, [profile, computedMetrics]);

  // 3. Save Profile to Backend MySQL Database
  const handleUpdateProfile = async (updatedData) => {
    // 1. Optimistic UI update
    setProfile((prev) => ({
      ...prev,
      ...updatedData,
      hasProfileData: true,
    }));
    setIsOnboarding(false);
    setAutoOpenEdit(false);

    // 2. Persist to AuthContext & localStorage so Navbar/session reflects changes
    const mergedUser = {
      ...(authUser || {}),
      ...updatedData,
    };
    login(token, mergedUser);

    // 3. Send PUT request to backend MySQL
    try {
      const response = await usersApi.updateProfile(updatedData);
      if (response?.user) {
        setProfile((prev) => ({
          ...prev,
          ...response.user,
          hasProfileData: true,
        }));
      }
      setSaveSuccessMsg("Profile saved to database successfully!");
      setTimeout(() => setSaveSuccessMsg(""), 4000);
    } catch (err) {
      console.warn("Failed to persist to MySQL server, saved to local session:", err);
      setSaveSuccessMsg("Profile saved to your active session.");
      setTimeout(() => setSaveSuccessMsg(""), 4000);
    }
  };

  // Handle project updates
  const handleUpdateProject = (updatedProject) => {
    const next = projects.map((p) =>
      (p.id || p._id) === (updatedProject.id || updatedProject._id) ? updatedProject : p
    );
    setProjects(next);
    if (authUser?.id) {
      localStorage.setItem(`sg_user_projects_${authUser.id}`, JSON.stringify(next));
    }
  };

  // Handle project deletion
  const handleDeleteProject = (projectId) => {
    const next = projects.filter((p) => (p.id || p._id) !== projectId);
    setProjects(next);
    if (authUser?.id) {
      localStorage.setItem(`sg_user_projects_${authUser.id}`, JSON.stringify(next));
    }
    // Also attempt deletion on backend if API is connected
    projectsApi.remove(projectId).catch(() => {});
  };

  return (
    <div className="profile-page pb-5">
      {/* Top Banner Navigation & View Preview Switcher */}
      <div className="bg-light border-bottom py-2">
        <div className="container d-flex flex-wrap align-items-center justify-content-between gap-2">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0 small">
              <li className="breadcrumb-item">
                <Link to="/" className="text-decoration-none text-muted">
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

          {/* Mode Switcher */}
          <div className="d-flex align-items-center gap-2 small">
            <span className="text-muted d-none d-md-inline">Preview:</span>
            <div className="btn-group btn-group-sm" role="group" aria-label="Profile View Mode">
              <button
                type="button"
                className={`btn ${effectiveIsOwnProfile ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setViewModeOverride("owner")}
                title="View with owner editing controls"
              >
                <i className="bi bi-pencil-fill me-1"></i>
                Owner View
              </button>
              <button
                type="button"
                className={`btn ${!effectiveIsOwnProfile ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setViewModeOverride("public")}
                title="View as a public visitor"
              >
                <i className="bi bi-eye-fill me-1"></i>
                Public View
              </button>
            </div>

            {/* Demo / Sample Users switcher */}
            <div className="dropdown">
              <button
                className="btn btn-sm btn-outline-secondary dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Explore Demo Profiles
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                <li>
                  <Link className="dropdown-item" to="/profile">
                    My Real Profile ({authUser?.name || "Logged In"})
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <Link className="dropdown-item" to="/profile/demo-2">
                    Sarah Chen (Demo: AI & EdTech)
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/profile/demo-3">
                    Jordan Lee (Demo: Zero Projects)
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Save Success Alert */}
      {saveSuccessMsg && (
        <div className="container mt-3 px-3 px-md-4">
          <div className="alert alert-success alert-dismissible fade show rounded-4 shadow-sm" role="alert">
            <i className="bi bi-check-circle-fill me-2"></i>
            {saveSuccessMsg}
            <button
              type="button"
              className="btn-close"
              onClick={() => setSaveSuccessMsg("")}
              aria-label="Close"
            ></button>
          </div>
        </div>
      )}

      {/* Profile Header Section with Onboarding Form */}
      <UserProfileHeader
        profile={activeProfile}
        isOwnProfile={effectiveIsOwnProfile}
        isOnboarding={isOnboarding}
        autoOpenEdit={autoOpenEdit}
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
            isOwnProfile={effectiveIsOwnProfile}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
          />
        )}
      </div>
    </div>
  );
}
