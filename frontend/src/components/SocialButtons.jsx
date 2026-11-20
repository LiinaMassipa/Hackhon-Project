// "Continue with Google / GitHub" buttons, shown on the Login and Register pages.
// These are plain links: the browser leaves for Google/GitHub, then returns to
// /auth/callback (see AuthCallback.jsx) once the backend has signed the user in.

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

export default function SocialButtons({ next = "/" }) {
  const query = `?next=${encodeURIComponent(next)}`;

  return (
    <div>
      <div className="sg-divider" role="separator">
        <span>or continue with</span>
      </div>

      <div className="d-grid gap-2">
        <a href={`${API_BASE}/auth/google${query}`} className="sg-social-btn">
          <i className="bi bi-google" aria-hidden="true"></i>
          Continue with Google
        </a>
        <a href={`${API_BASE}/auth/github${query}`} className="sg-social-btn">
          <i className="bi bi-github" aria-hidden="true"></i>
          Continue with GitHub
        </a>
      </div>
    </div>
  );
}
