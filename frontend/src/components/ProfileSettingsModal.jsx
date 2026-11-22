import { useState, useEffect, useRef } from "react";

/**
 * ProfileSettingsModal
 * Props:
 *   open   – boolean, whether the modal is visible
 *   onClose – () => void, called when the user dismisses
 */
export default function ProfileSettingsModal({ open, onClose }) {
  const user = JSON.parse(localStorage.getItem("user")) || {};

  /* ── form state ── */
  const [displayName, setDisplayName] = useState(user.name || "");
  const [bio, setBio] = useState(user.bio || "");
  const [github, setGithub] = useState(user.github || "");
  const [website, setWebsite] = useState(user.website || "");
  const [avatarPreview, setAvatarPreview] = useState(user.avatar || null);
  const [avatarFile, setAvatarFile] = useState(null);

  /* ── visibility toggles ── */
  const [showEmail, setShowEmail] = useState(user.showEmail ?? true);
  const [showProjects, setShowProjects] = useState(user.showProjects ?? true);

  /* ── feedback ── */
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const overlayRef = useRef(null);

  /* Reset feedback when modal opens */
  useEffect(() => {
    if (open) {
      setSuccess("");
      setError("");
    }
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  /* Prevent body scroll while open */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  /* ── handlers ── */
  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function handleRemoveAvatar() {
    setAvatarFile(null);
    setAvatarPreview(null);
  }

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose();
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updated = {
        ...user,
        name: displayName,
        bio,
        github,
        website,
        showEmail,
        showProjects,
      };
      if (avatarPreview) updated.avatar = avatarPreview;
      else delete updated.avatar;

      localStorage.setItem("user", JSON.stringify(updated));
      setSuccess("Profile settings saved!");
      setTimeout(onClose, 1200);
    } catch (err) {
      setError(err.message || "Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  /* ── render ── */
  return (
    <>
      {/* ── Overlay ── */}
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15,14,26,0.45)",
          backdropFilter: "blur(3px)",
          zIndex: 1050,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          animation: "sg-fade-in 0.18s ease",
        }}
      >
        {/* ── Modal panel ── */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ps-modal-title"
          style={{
            background: "#fff",
            borderRadius: 18,
            boxShadow: "0 24px 60px rgba(108,92,231,0.18)",
            width: "100%",
            maxWidth: 520,
            maxHeight: "90vh",
            overflowY: "auto",
            animation: "sg-slide-up 0.22s ease",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1.25rem 1.5rem 0",
            }}
          >
            <h5
              id="ps-modal-title"
              style={{
                margin: 0,
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                color: "var(--sg-text-dark)",
              }}
            >
              ⚙️ Profile Settings
            </h5>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                background: "none",
                border: "none",
                fontSize: "1.3rem",
                cursor: "pointer",
                color: "var(--sg-text-muted)",
                lineHeight: 1,
                padding: "0.1rem 0.4rem",
                borderRadius: 8,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.target.style.background = "var(--sg-accent-soft)")}
              onMouseLeave={(e) => (e.target.style.background = "none")}
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSave} style={{ padding: "1.25rem 1.5rem 1.5rem" }}>

            {/* ── Avatar row ── */}
            <div style={{ display: "flex", alignItems: "center", gap: "1.1rem", marginBottom: "1.5rem" }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--sg-border)" }}
                  />
                ) : (
                  <div
                    style={{
                      width: 72, height: 72, borderRadius: "50%",
                      background: "var(--sg-accent-soft)",
                      border: "2px solid var(--sg-border)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 30,
                    }}
                  >
                    👤
                  </div>
                )}
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    title="Remove photo"
                    style={{
                      position: "absolute", top: -4, right: -4,
                      width: 22, height: 22, borderRadius: "50%",
                      background: "#dc2626", border: "2px solid #fff",
                      color: "#fff", fontSize: "0.65rem",
                      cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center",
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
              <div>
                <p style={{ margin: "0 0 0.4rem", fontWeight: 600, fontSize: "0.9rem", color: "var(--sg-text-dark)" }}>
                  Profile Photo
                </p>
                <label
                  htmlFor="ps-avatar"
                  className="sg-btn-outline-primary"
                  style={{ fontSize: "0.78rem", cursor: "pointer", padding: "0.35rem 0.9rem" }}
                >
                  {avatarPreview ? "Change" : "Upload"}
                </label>
                <input
                  id="ps-avatar"
                  type="file"
                  accept="image/*"
                  className="d-none"
                  onChange={handleAvatarChange}
                />
              </div>
            </div>

            {/* Alerts */}
            {success && (
              <div className="alert alert-success py-2 text-center mb-3" role="alert">
                ✅ {success}
              </div>
            )}
            {error && (
              <div className="alert alert-danger py-2 text-center mb-3" role="alert">
                ⚠️ {error}
              </div>
            )}

            {/* ── Display Name ── */}
            <div className="mb-3">
              <label htmlFor="ps-name" className="form-label fw-semibold" style={{ fontSize: "0.88rem" }}>
                Display Name
              </label>
              <input
                id="ps-name"
                type="text"
                className="form-control"
                style={{ borderRadius: 10 }}
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>

            {/* ── Bio ── */}
            <div className="mb-3">
              <label htmlFor="ps-bio" className="form-label fw-semibold" style={{ fontSize: "0.88rem" }}>
                Bio
              </label>
              <textarea
                id="ps-bio"
                className="form-control"
                style={{ borderRadius: 10 }}
                rows={2}
                placeholder="A short bio about you…"
                maxLength={300}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <div className="text-end text-muted" style={{ fontSize: "0.75rem" }}>
                {bio.length}/300
              </div>
            </div>

            {/* ── GitHub ── */}
            <div className="mb-3">
              <label htmlFor="ps-github" className="form-label fw-semibold" style={{ fontSize: "0.88rem" }}>
                GitHub URL
              </label>
              <input
                id="ps-github"
                type="url"
                className="form-control"
                style={{ borderRadius: 10 }}
                placeholder="https://github.com/handle"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
              />
            </div>

            {/* ── Website ── */}
            <div className="mb-4">
              <label htmlFor="ps-website" className="form-label fw-semibold" style={{ fontSize: "0.88rem" }}>
                Website / Portfolio
              </label>
              <input
                id="ps-website"
                type="url"
                className="form-control"
                style={{ borderRadius: 10 }}
                placeholder="https://yoursite.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            {/* ── Privacy toggles ── */}
            <div
              style={{
                background: "var(--sg-accent-soft)",
                borderRadius: 12,
                padding: "1rem 1.1rem",
                marginBottom: "1.5rem",
              }}
            >
              <p style={{ fontWeight: 700, fontSize: "0.88rem", margin: "0 0 0.75rem", color: "var(--sg-text-dark)" }}>
                🔒 Privacy
              </p>

              <ToggleRow
                id="ps-show-email"
                label="Show email on profile"
                checked={showEmail}
                onChange={setShowEmail}
              />
              <ToggleRow
                id="ps-show-projects"
                label="Show my projects publicly"
                checked={showProjects}
                onChange={setShowProjects}
              />
            </div>

            {/* ── Actions ── */}
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="sg-btn-outline-primary"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="sg-btn-primary"
                disabled={saving}
              >
                {saving ? "Saving…" : "Save Settings"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Keyframe styles */}
      <style>{`
        @keyframes sg-fade-in  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes sg-slide-up { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </>
  );
}

/* ── small toggle row sub-component ── */
function ToggleRow({ id, label, checked, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "0.6rem",
      }}
    >
      <label
        htmlFor={id}
        style={{ fontSize: "0.85rem", color: "var(--sg-text-soft)", cursor: "pointer", marginBottom: 0 }}
      >
        {label}
      </label>
      {/* iOS-style pill toggle */}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          width: 42,
          height: 24,
          borderRadius: 999,
          border: "none",
          background: checked ? "var(--sg-accent)" : "#d1d5db",
          position: "relative",
          cursor: "pointer",
          transition: "background 0.2s",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: checked ? 21 : 3,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.2s",
            boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
          }}
        />
      </button>
    </div>
  );
}
