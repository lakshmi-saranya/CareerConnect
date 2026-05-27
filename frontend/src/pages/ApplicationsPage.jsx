import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { apiFetch } from "../services/api";

const STATUS_COLORS = {
  Submitted: { bg: "#e3f2fd", color: "#01579b" },
  Pending:   { bg: "#fff9c4", color: "#f57f17" },
  Accepted:  { bg: "#e8f5e9", color: "#2e7d32" },
  Rejected:  { bg: "#ffebee", color: "#c62828" },
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");

  useEffect(() => { fetchApplications(); }, []);

  async function fetchApplications() {
    setLoading(true);
    try {
      const res  = await apiFetch("/applications/me");
      const data = await res.json();
      setApplications(data);
    } catch {
      setError("Could not load applications.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this application?")) return;
    try {
      await apiFetch(`/applications/${id}`, { method: "DELETE" });
      setApplications((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert("Failed to delete.");
    }
  }

  async function handleStatusChange(id, newStatus) {
    try {
      await apiFetch(`/applications/${id}/status`, {
        method: "PATCH",
        body:   JSON.stringify({ status: newStatus }),
      });
      setApplications((prev) =>
        prev.map((a) => a.id === id ? { ...a, status: newStatus } : a)
      );
    } catch {
      alert("Failed to update status.");
    }
  }

  return (
    <Layout>
      <h2>My Applications</h2>

      {loading && <p style={{ color: "#888", marginTop: "20px" }}>Loading…</p>}
      {error   && <p style={{ color: "orange" }}>{error}</p>}

      {!loading && applications.length === 0 && (
        <div style={{
          background: "#f9f9f9", borderRadius: "10px",
          padding: "40px", textAlign: "center", color: "#888", marginTop: "20px",
        }}>
          <p style={{ fontSize: "1.1rem" }}>No applications yet.</p>
          <p style={{ marginTop: "8px" }}>
            Go to <a href="/jobs">Job Matches</a> and click "Generate Draft" to apply.
          </p>
        </div>
      )}

      {!loading && applications.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
          <thead>
            <tr style={{ background: "#004797", color: "white" }}>
              <th style={{ padding: "12px 16px", textAlign: "left" }}>Job Title</th>
              <th style={{ padding: "12px 16px", textAlign: "left" }}>Company</th>
              <th style={{ padding: "12px 16px", textAlign: "left" }}>Date</th>
              <th style={{ padding: "12px 16px", textAlign: "left" }}>Status</th>
              <th style={{ padding: "12px 16px", textAlign: "left" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app, idx) => {
              const style = STATUS_COLORS[app.status] || STATUS_COLORS.Pending;
              const date  = new Date(app.created_at).toLocaleDateString();
              return (
                <tr key={app.id} style={{
                  borderBottom: "1px solid #eee",
                  background: idx % 2 === 0 ? "#fff" : "#fafafa",
                }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600 }}>{app.job_title}</td>
                  <td style={{ padding: "12px 16px", color: "#555" }}>{app.company}</td>
                  <td style={{ padding: "12px 16px", color: "#888", fontSize: "0.9rem" }}>{date}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      style={{
                        background: style.bg, color: style.color,
                        border:     `1px solid ${style.color}`,
                        borderRadius: "12px", padding: "4px 10px",
                        fontWeight: 600, cursor: "pointer", fontSize: "0.85rem",
                      }}
                    >
                      <option>Submitted</option>
                      <option>Pending</option>
                      <option>Accepted</option>
                      <option>Rejected</option>
                    </select>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button
                      onClick={() => handleDelete(app.id)}
                      style={{ background: "#c62828", padding: "6px 14px", fontSize: "0.85rem" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </Layout>
  );
}
