import { useState } from "react";

/**
 * UserProfileHeader
 *
 * Displays user identity, bio, social/portfolio links, aggregate metrics,
 * and handles "Edit Profile" modal for the authenticated owner.
 */
export default function UserProfileHeader({
  profile = {},
  isOwnProfile = true,
  onUpdateProfile,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.name || "",
    username: profile.username || "",
    headline: profile.headline || "",
    bio: profile.bio || "",
    location: profile.location || "",
    avatarUrl: profile.avatarUrl || "",
    github: profile.socialLinks?.github || "",
    linkedin: profile.socialLinks?.linkedin || "",
    website: profile.socialLinks?.website || "",
    twitter: profile.socialLinks?.twitter || "",
  });

  const [avatarError, setAvatarError] = useState(false);

  // Sync edit form if profile props change
  const handleOpenEdit = () => {
    setFormData({
      name: profile.name || "",
      username: profile.username || "",
      headline: profile.headline || "",
      bio: profile.bio || "",
      location: profile.location || "",
      avatarUrl: profile.avatarUrl || "",
      github: profile.socialLinks?.github || "",
      linkedin: profile.socialLinks?.linkedin || "",
      website: profile.socialLinks?.website || "",
      twitter: profile.socialLinks?.twitter || "",
    });
    setIsEditing(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const updated = {
      ...profile,
      name: formData.name.trim(),
      username: formData.username.trim().replace(/^@/, ""),
      headline: formData.headline.trim(),
      bio: formData.bio.trim(),
      location: formData.location.trim(),
      avatarUrl: formData.avatarUrl.trim(),
      socialLinks: {
        github: formData.github.trim(),
        linkedin: formData.linkedin.trim(),
        website: formData.website.trim(),
        twitter: formData.twitter.trim(),
      },
    };

    if (onUpdateProfile) {
      onUpdateProfile(updated);
    }
    setIsEditing(false);
  };

  const metrics = profile.metrics || {
    totalProjects: 0,
    totalViews: 0,
    totalVotes: 0,
    averageRating: 0.0,
  };

  // Format initials for avatar fallback
  const initials = (profile.name || profile.username || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="sg-profile-header mb-5">
      {/* Decorative Profile Cover Banner */}
      <div
        className="rounded-4 overflow-hidden position-relative shadow-sm"
        style={{
          height: 180,
          background:
            "radial-gradient(circle at 80% 20%, rgba(149, 117, 255, 0.45), transparent 50%), linear-gradient(135deg, var(--sg-navy-900) 0%, var(--sg-navy-800) 50%, var(--sg-violet-700) 100%)",
        }}
      >
        <div className="position-absolute bottom-0 end-0 p-3 opacity-25 text-white">
          <i className="bi bi-code-slash" style={{ fontSize: "5rem" }}></i>
        </div>
      </div>

      {/* Profile Details Container */}
      <div className="container px-3 px-md-4">
        <div className="card border-0 shadow-sm rounded-4 p-4 mt-n5 position-relative bg-white">
          <div className="row g-4 align-items-start">
            {/* Avatar Column */}
            <div className="col-auto">
              <div
                className="position-relative"
                style={{
                  width: 120,
                  height: 120,
                  marginTop: "-60px",
                }}
              >
                {profile.avatarUrl && !avatarError ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="rounded-circle border border-4 border-white shadow-lg object-fit-cover w-100 h-100"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div
                    className="rounded-circle border border-4 border-white shadow-lg d-flex align-items-center justify-content-center text-white fw-bold w-100 h-100"
                    style={{
                      background: "linear-gradient(135deg, var(--sg-violet-600), var(--sg-violet-500))",
                      fontSize: "2.2rem",
                    }}
                  >
                    {initials}
                  </div>
                )}

                {/* Online / Active status dot */}
                <span
                  className="position-absolute bottom-0 end-0 p-2 bg-success border border-2 border-white rounded-circle"
                  title="Active Hacker"
                ></span>
              </div>
            </div>

            {/* Profile Info Column */}
            <div className="col-12 col-md">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-1">
                <div>
                  <h2 className="fw-bold mb-0" style={{ color: "var(--sg-navy-900)" }}>
                    {profile.name}
                  </h2>
                  <span className="text-muted fw-semibold">
                    @{profile.username}
                  </span>
                </div>

                {/* Edit Profile Action Button */}
                {isOwnProfile && (
                  <div>
                    <button
                      type="button"
                      className="btn btn-outline-primary rounded-pill px-3 py-1 d-inline-flex align-items-center gap-2 fw-semibold"
                      onClick={handleOpenEdit}
                    >
                      <i className="bi bi-pencil"></i>
                      Edit Profile
                    </button>
                  </div>
                )}
              </div>

              {/* Headline */}
              {profile.headline && (
                <p className="fw-medium text-dark mb-2" style={{ fontSize: "1.05rem" }}>
                  {profile.headline}
                </p>
              )}

              {/* Bio */}
              {profile.bio && (
                <p className="text-muted mb-3" style={{ fontSize: "0.95rem", lineHeight: "1.5" }}>
                  {profile.bio}
                </p>
              )}

              {/* Metadata tags: Location & Joined Date */}
              <div className="d-flex flex-wrap align-items-center gap-3 text-muted small mb-3">
                {profile.location && (
                  <span className="d-inline-flex align-items-center">
                    <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                    {profile.location}
                  </span>
                )}
                {profile.joinedDate && (
                  <span className="d-inline-flex align-items-center">
                    <i className="bi bi-calendar3 me-1"></i>
                    Joined {profile.joinedDate}
                  </span>
                )}
                <span className="badge bg-light text-primary border">
                  <i className="bi bi-patch-check-fill me-1"></i> Verified Creator
                </span>
              </div>

              {/* Social / External Links */}
              <div className="d-flex flex-wrap align-items-center gap-2">
                {profile.socialLinks?.github && (
                  <a
                    href={profile.socialLinks.github}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-outline-dark rounded-pill px-3 d-inline-flex align-items-center gap-2"
                  >
                    <i className="bi bi-github"></i>
                    GitHub
                  </a>
                )}
                {profile.socialLinks?.linkedin && (
                  <a
                    href={profile.socialLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-outline-primary rounded-pill px-3 d-inline-flex align-items-center gap-2"
                  >
                    <i className="bi bi-linkedin"></i>
                    LinkedIn
                  </a>
                )}
                {profile.socialLinks?.website && (
                  <a
                    href={profile.socialLinks.website}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-outline-secondary rounded-pill px-3 d-inline-flex align-items-center gap-2"
                  >
                    <i className="bi bi-globe"></i>
                    Website
                  </a>
                )}
                {profile.socialLinks?.twitter && (
                  <a
                    href={profile.socialLinks.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-outline-dark rounded-pill px-3 d-inline-flex align-items-center gap-2"
                  >
                    <i className="bi bi-twitter-x"></i>
                    X
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Aggregate Metrics Strip */}
          <div className="row g-3 mt-4 pt-4 border-top">
            <div className="col-6 col-md-3">
              <div className="p-3 bg-light rounded-4 text-center h-100 border border-light-subtle">
                <span className="d-block text-muted small fw-semibold text-uppercase mb-1">
                  Total Projects
                </span>
                <span className="h3 fw-bold text-dark mb-0 d-block">
                  <i className="bi bi-code-square text-primary me-2"></i>
                  {metrics.totalProjects}
                </span>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="p-3 bg-light rounded-4 text-center h-100 border border-light-subtle">
                <span className="d-block text-muted small fw-semibold text-uppercase mb-1">
                  Total Views
                </span>
                <span className="h3 fw-bold text-dark mb-0 d-block">
                  <i className="bi bi-eye text-info me-2"></i>
                  {metrics.totalViews.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="p-3 bg-light rounded-4 text-center h-100 border border-light-subtle">
                <span className="d-block text-muted small fw-semibold text-uppercase mb-1">
                  Total Likes / Votes
                </span>
                <span className="h3 fw-bold text-dark mb-0 d-block">
                  <i className="bi bi-heart-fill text-danger me-2"></i>
                  {metrics.totalVotes.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="p-3 bg-light rounded-4 text-center h-100 border border-light-subtle">
                <span className="d-block text-muted small fw-semibold text-uppercase mb-1">
                  Avg Community Rating
                </span>
                <span className="h3 fw-bold text-dark mb-0 d-block">
                  <i className="bi bi-star-fill text-warning me-2"></i>
                  {typeof metrics.averageRating === "number"
                    ? metrics.averageRating.toFixed(1)
                    : "0.0"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(10, 14, 39, 0.65)", backdropFilter: "blur(4px)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-person-gear text-primary me-2"></i>
                  Edit Public Profile
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsEditing(false)}
                  aria-label="Close"
                ></button>
              </div>

              <form onSubmit={handleSaveEdit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Full Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Username / Handle *</label>
                      <div className="input-group">
                        <span className="input-group-text">@</span>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Avatar Image URL</label>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://example.com/my-photo.jpg"
                        value={formData.avatarUrl}
                        onChange={(e) => {
                          setAvatarError(false);
                          setFormData({ ...formData, avatarUrl: e.target.value });
                        }}
                      />
                      <div className="form-text">
                        Direct link to your avatar image (or leave blank to use your name initials).
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Headline / Role</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Full-Stack Developer & AI Enthusiast"
                        value={formData.headline}
                        onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Bio</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Tell the hackathon community about yourself, your interests, and what you love building..."
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      ></textarea>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Location</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. San Francisco, CA"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Website / Portfolio</label>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://myportfolio.dev"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">GitHub Profile URL</label>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://github.com/yourusername"
                        value={formData.github}
                        onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">LinkedIn Profile URL</label>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://linkedin.com/in/yourusername"
                        value={formData.linkedin}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">X / Twitter Profile URL</label>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://x.com/yourhandle"
                        value={formData.twitter}
                        onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top bg-light rounded-bottom-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-3"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="sg-btn-primary px-4">
                    Save Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

