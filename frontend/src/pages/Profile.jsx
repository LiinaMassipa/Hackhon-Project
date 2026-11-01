export default function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="container py-5">

      {/* Profile Header */}
      <div className="text-center mb-5">
        <div
          className="rounded-circle bg-light border mx-auto mb-3 d-flex align-items-center justify-content-center"
          style={{ width: "120px", height: "120px", fontSize: "50px" }}
        >
          👤
        </div>

        <h2>{user?.name || "User"}</h2>

        <p className="text-muted">
          {user?.email || "No email available"}
        </p>

        <button className="sg-btn-primary">
          Edit Profile
        </button>
      </div>

      {/* My Projects */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h4 className="mb-3">📁 My Projects</h4>

          <p className="text-muted">
            Projects you have uploaded will appear here.
          </p>

          <button className="btn btn-outline-primary">
            View My Projects
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h4 className="mb-3">⚙️ Settings</h4>

          <div className="list-group">
            <button className="list-group-item list-group-item-action">
              Profile Settings
            </button>

            <button className="list-group-item list-group-item-action">
              Account Settings
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}