import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to="/" style={{ color: "white", textDecoration: "none", fontSize: "1.3rem", fontWeight: 700 }}>
          💼 CareerConnect
        </Link>
      </div>
      <nav className="nav-links" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <Link to="/applications" style={{ color: "white", textDecoration: "none" }}>Applications</Link>
        <Link to="/jobs" style={{ color: "white", textDecoration: "none" }}>Jobs</Link>

        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              onClick={() => navigate("/")}
              style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
            >
              {user.picture && (
                <img
                  src={user.picture}
                  alt={user.name}
                  style={{ width: "32px", height: "32px", borderRadius: "50%", border: "2px solid white" }}
                />
              )}
              <span style={{ color: "white", fontSize: "0.9rem" }}>{user.name}</span>
            </div>
            {/* <span style={{ color: "white", fontSize: "0.9rem" }}>{user.name}</span> */}
            <button
              onClick={handleLogout}
              style={{
                background: "rgba(255,255,255,0.2)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.5)",
                borderRadius: "6px",
                padding: "4px 12px",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              Logout
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;
