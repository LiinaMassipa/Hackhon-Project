import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

// Landing page after Google/GitHub sign-in. The backend redirects here with the
// login token in the URL fragment (#token=...), e.g. /auth/callback#token=abc&next=/submit
export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const token = params.get("token");
    const next = params.get("next");
    const destination = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";

    // Remove the token from the address bar and browser history straight away
    window.history.replaceState(null, "", window.location.pathname);

    if (!token) {
      setError("Sign-in didn't complete. Please try again.");
      return;
    }

    // Ask the server who this is, which also confirms the token works
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.user) throw new Error(data.error || "Sign-in failed.");

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("auth-change"));
        navigate(destination, { replace: true });
      })
      .catch((err) => setError(err.message || "Sign-in failed. Please try again."));
  }, [navigate]);

  if (error) {
    return (
      <div className="container my-5" style={{ maxWidth: 420 }}>
        <div className="sg-form-card p-4 border rounded shadow-sm text-center">
          <div className="alert alert-danger">{error}</div>
          <Link to="/login" className="sg-btn-primary">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5 text-center text-muted">
      <div className="spinner-border" role="status" aria-hidden="true"></div>
      <p className="mt-3">Signing you in...</p>
    </div>
  );
}
