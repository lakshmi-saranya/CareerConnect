import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { apiFetch } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user }  = useAuth();

  const [stats, setStats] = useState({
    total:     0,
    submitted: 0,
    pending:   0,
    accepted:  0,
    rejected:  0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res  = await apiFetch("/applications/me");
        const data = await res.json();

        setStats({
          total:     data.length,
          submitted: data.filter((a) => a.status === "Submitted").length,
          pending:   data.filter((a) => a.status === "Pending").length,
          accepted:  data.filter((a) => a.status === "Accepted").length,
          rejected:  data.filter((a) => a.status === "Rejected").length,
        });
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const cards = [
    { label: "Total",     value: stats.total,     bg: "#e3f2fd", color: "#01579b", icon: "📋" },
    { label: "Submitted", value: stats.submitted,  bg: "#e8eaf6", color: "#283593", icon: "📤" },
    { label: "Pending",   value: stats.pending,    bg: "#fff9c4", color: "#f57f17", icon: "⏳" },
    { label: "Accepted",  value: stats.accepted,   bg: "#e8f5e9", color: "#2e7d32", icon: "✅" },
    { label: "Rejected",  value: stats.rejected,   bg: "#ffebee", color: "#c62828", icon: "❌" },
  ];

  return (
    <Layout>
      <div style={{ width: "100%", maxWidth: "800px" }}>
        {/* Welcome */}
        <h2 style={{ marginBottom: "4px" }}>
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h2>
        <p style={{ color: "#777", marginBottom: "32px" }}>
          Here's a summary of your job applications.
        </p>

        {/* Stats cards */}
        {loading ? (
          <p style={{ color: "#888" }}>Loading stats…</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "36px" }}>
            {cards.map((card) => (
              <div
                key={card.label}
                onClick={() => navigate("/applications")}
                style={{
                  background:   card.bg,
                  border:       `1px solid ${card.color}33`,
                  borderRadius: "12px",
                  padding:      "20px 28px",
                  minWidth:     "130px",
                  textAlign:    "center",
                  cursor:       "pointer",
                  transition:   "transform 0.15s ease, box-shadow 0.15s ease",
                  boxShadow:    "0 2px 8px rgba(0,0,0,0.06)",
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-3px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                <div style={{ fontSize: "1.8rem", marginBottom: "6px" }}>{card.icon}</div>
                <div style={{ fontSize: "2rem", fontWeight: 700, color: card.color }}>
                  {card.value}
                </div>
                <div style={{ fontSize: "0.85rem", color: card.color, fontWeight: 600, marginTop: "4px" }}>
                  {card.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick actions */}
        <h3 style={{ marginBottom: "16px", color: "#333" }}>Quick Actions</h3>
        <div className="button-group">
          <button onClick={() => navigate("/upload")}>📄 Upload Resume</button>
          <button onClick={() => navigate("/jobs")}>🔍 Browse Jobs</button>
          <button onClick={() => navigate("/applications")}>📋 My Applications</button>
        </div>
      </div>
    </Layout>
  );
}
