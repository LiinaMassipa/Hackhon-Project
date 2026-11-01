import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || "Registration failed");
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("auth-change"));
        navigate({ replace: true});
      } else {
        alert("Account created! Please log in.");
        navigate("/login");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5" style={{ maxWidth: 420 }}>
      <div className="sg-form-card p-4 border rounded shadow-sm">
        <h2 className="mb-3">Create Account</h2>
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="sg-btn-primary w-100" disabled={loading}>
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="text-muted mt-3 mb-0 text-center">
          Already have an account? <Link to="/login">Log in here</Link>
        </p>
      </div>
    </div>
  );
}