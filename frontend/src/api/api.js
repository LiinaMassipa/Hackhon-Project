// Thin wrapper around fetch() so every component talks to the API the same way.
// In dev, Vite proxies "/api" -> http://localhost:5000 (see vite.config.js).
// In production, set VITE_API_BASE_URL to your deployed backend URL.

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

// Routes that require authentication
function isProtectedRoute(path, method) {
  // POST, PUT, DELETE, PATCH are always protected
  if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) return true;
  // Specific GET routes that need auth
  return path.includes("/vote") || path.includes("/my-vote");
}

async function request(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {};

  const method = options.method || "GET";
  const isProtected = isProtectedRoute(path, method);

  if (token && isProtected) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Only set application/json if the body is NOT FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // no JSON body — fine for some responses
  }

  if (!res.ok) {
    const message = data?.error || `Request failed with status ${res.status}`;
    const error = new Error(message);
    error.details = data?.details;
    error.status = res.status;
    throw error;
  }

  return data;
}

export const projectsApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString();
    return request(`/projects${query ? `?${query}` : ""}`, { method: "GET" });
  },
  get: (id) => request(`/projects/${id}`, { method: "GET" }),
  getMyVote: (id) => request(`/projects/${id}/my-vote`, { method: "GET" }),

 rankings: () => request("/projects/rankings", { method: "GET" }),

  create: (payload) => {
    const isFormData = payload instanceof FormData;
    return request("/projects", {
      method: "POST",
      body: isFormData ? payload : JSON.stringify(payload),
    });
  },

  update: (id, payload) => {
    const isFormData = payload instanceof FormData;
    return request(`/projects/${id}`, {
      method: "PUT",
      body: isFormData ? payload : JSON.stringify(payload),
    });
  },

  remove: (id) => request(`/projects/${id}`, { method: "DELETE" }),
  vote: (id, rating) =>
    request(`/projects/${id}/vote`, {
      method: "POST",
      body: JSON.stringify({ rating }),
    }),
};