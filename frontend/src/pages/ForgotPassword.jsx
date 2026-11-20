import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Something went wrong. Please try again.");
      }
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5" style={{ maxWidth: 420 }}>
      <div className="sg-form-card p-4 border rounded shadow-sm">
        <h2 className="mb-3">Forgot password?</h2>

        {sent ? (
          <>
            <div className="alert alert-success">
              If an account with <strong>{email}</strong> exists, we've sent a link to reset your
              password. It's valid for 1 hour.
            </div>
            <p className="text-muted small">
              Nothing in your inbox? Check your spam folder, or{" "}
              <button type="button" className="btn btn-link p-0 align-baseline" onClick={() => setSent(false)}>
                try again
              </button>
              .
            </p>
          </>
        ) : (
          <>
            <p className="text-muted">
              Enter the email you signed up with and we'll send you a link to choose a new password.
            </p>
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label" htmlFor="forgot-email">
                  Email
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  autoFocus
                />
              </div>
              <button type="submit" className="sg-btn-primary w-100" disabled={loading}>
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          </>
        )}

        <p className="text-muted mt-3 mb-0 text-center">
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
