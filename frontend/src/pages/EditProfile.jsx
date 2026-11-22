import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email || "",
    bio: user.bio || "",
    github: user.github || "",
    website: user.website || "",
  });

  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar || null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function removeAvatar() {
    setAvatar(null);
    setAvatarPreview(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Build updated user and persist to localStorage
      // (replace with a real API call when your backend supports it)
      const updated = { ...user, ...form };
      if (avatarPreview && avatarPreview !== user.avatar) {
        updated.avatar = avatarPreview; // store data-URL / object-URL as a preview
      }
      localStorage.setItem("user", JSON.stringify(updated));
      setSuccess("Profile updated successfully!");
      setTimeout(() => navigate("/profile"), 1200);
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 640 }}>
      {/* Page header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button
          className="btn btn-link p-0 text-muted"
          onClick={() => navigate("/profile")}
          aria-label="Back to profile"
        >
          ← Back
        </button>
        <h3 className="mb-0" style={{ fontFamily: "var(--font-display)" }}>
          Edit Profile
        </h3>
      </div>

      <form className="sg-form-card" onSubmit={handleSubmit}>

        {/* ── Avatar ── */}
        <div className="text-center mb-4">
          <div className="position-relative d-inline-block">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="rounded-circle border"
                style={{ width: 110, height: 110, objectFit: "cover" }}
              />
            ) : (
              <div
                className="rounded-circle bg-light border d-flex align-items-center justify-content-center mx-auto"
                style={{ width: 110, height: 110, fontSize: 46 }}
              >
                👤
              </div>
            )}

            {/* Remove button */}
            {avatarPreview && (
              <button
                type="button"
                className="sg-image-preview-remove"
                onClick={removeAvatar}
                title="Remove photo"
                style={{ top: 4, right: 4 }}
              >
                ✕
              </button>
            )}
          </div>

          <div className="mt-3">
            <label
              htmlFor="avatarInput"
              className="sg-btn-outline-primary"
              style={{ cursor: "pointer", fontSize: "0.85rem" }}
            >
              {avatarPreview ? "Change Photo" : "Upload Photo"}
            </label>
            <input
              id="avatarInput"
              type="file"
              accept="image/*"
              className="d-none"
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        {/* ── Alerts ── */}
        {success && (
          <div className="alert alert-success py-2 text-center" role="alert">
            ✅ {success}
          </div>
        )}
        {error && (
          <div className="alert alert-danger py-2 text-center" role="alert">
            ⚠️ {error}
          </div>
        )}

        {/* ── Name ── */}
        <div className="mb-3">
          <label htmlFor="name" className="form-label">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="form-control"
            placeholder="Your name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* ── Email ── */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="form-control"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* ── Bio ── */}
        <div className="mb-3">
          <label htmlFor="bio" className="form-label">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            className="form-control"
            rows={3}
            placeholder="Tell everyone a little about yourself…"
            value={form.bio}
            onChange={handleChange}
            maxLength={300}
          />
          <div className="text-end text-muted" style={{ fontSize: "0.78rem" }}>
            {form.bio.length}/300
          </div>
        </div>

        {/* ── GitHub ── */}
        <div className="mb-3">
          <label htmlFor="github" className="form-label">
            GitHub URL
          </label>
          <input
            id="github"
            name="github"
            type="url"
            className="form-control"
            placeholder="https://github.com/yourhandle"
            value={form.github}
            onChange={handleChange}
          />
        </div>

        {/* ── Website ── */}
        <div className="mb-4">
          <label htmlFor="website" className="form-label">
            Website / Portfolio
          </label>
          <input
            id="website"
            name="website"
            type="url"
            className="form-control"
            placeholder="https://yoursite.com"
            value={form.website}
            onChange={handleChange}
          />
        </div>

        {/* ── Actions ── */}
        <div className="d-flex gap-3 justify-content-end">
          <button
            type="button"
            className="sg-btn-outline-primary"
            onClick={() => navigate("/profile")}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="sg-btn-primary"
            disabled={saving}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
