import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Could not reset your password.");
      }
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Opened without a token (e.g. typed the URL by hand)
  if (!token) {
    return (
      <div className="container my-5" style={{ maxWidth: 420 }}>
        <div className="sg-form-card p-4 border rounded shadow-sm text-center">
          <h2 className="mb-3">Reset password</h2>
          <div className="alert alert-danger">This reset link is incomplete. Please request a new one.</div>
          <Link to="/forgot-password" className="sg-btn-primary">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5" style={{ maxWidth: 420 }}>
      <div className="sg-form-card p-4 border rounded shadow-sm">
        <h2 className="mb-3">Choose a new password</h2>

        {done ? (
          <>
            <div className="alert alert-success">Your password has been updated.</div>
            <Link to="/login" className="sg-btn-primary w-100">
              Log in
            </Link>
          </>
        ) : (
          <>
            {error && (
              <div className="alert alert-danger">
                {error}{" "}
                {/invalid or has expired/i.test(error) && <Link to="/forgot-password">Request a new link</Link>}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label" htmlFor="reset-password">
                  New password
                </label>
                <input
                  id="reset-password"
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                  required
                  autoFocus
                />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="reset-confirm">
                  Confirm new password
                </label>
                <input
                  id="reset-confirm"
                  type="password"
                  className="form-control"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              <button type="submit" className="sg-btn-primary w-100" disabled={loading}>
                {loading ? "Saving..." : "Update password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
