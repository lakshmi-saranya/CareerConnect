import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { apiFetch } from "../services/api";
import { useAuth } from "../context/AuthContext";

function generateCoverLetter(name, jobTitle, company, resumeText) {
  const skills = resumeText
    ? resumeText.split(/\s+/).filter(w => w.length > 5).slice(0, 6).join(", ")
    : "relevant skills";

  return `Dear Hiring Manager at ${company},

I am writing to express my strong interest in the ${jobTitle} position at ${company}. With my background and experience, I am confident I can make a meaningful contribution to your team.

Throughout my career, I have developed expertise in ${skills}. I am particularly drawn to this opportunity because it aligns closely with my professional goals and strengths.

I would welcome the chance to discuss how my experience can benefit ${company}. Thank you for considering my application.

Warm regards,
${name}`;
}

export default function DraftPage() {
  const { user }   = useAuth();
  const location   = useLocation();
  const navigate   = useNavigate();

  // Job info passed from JobMatchesPage via navigate state
  const job = location.state?.job || { title: "Job Opening", company: "Company" };

  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [error, setError]             = useState("");

  useEffect(() => {
    // Load resume from sessionStorage (already populated from MongoDB on UploadPage)
    const resumeText = sessionStorage.getItem("resumeText") || "";

    // Also try fetching from backend in case sessionStorage is empty
    if (!resumeText) {
      apiFetch("/resume/me").then(r => r.json()).then(data => {
        const text = data.resume_text || "";
        if (text) sessionStorage.setItem("resumeText", text);
        setCoverLetter(generateCoverLetter(user?.name || "Applicant", job.title, job.company, text));
      });
    } else {
      setCoverLetter(generateCoverLetter(user?.name || "Applicant", job.title, job.company, resumeText));
    }
  }, []);

  const handleSubmit = async (status = "Submitted") => {
    setSubmitting(true);
    setError("");
    try {
      await apiFetch("/applications", {
        method: "POST",
        body: JSON.stringify({
          job_title:    job.title,
          company:      job.company,
          cover_letter: coverLetter,
          status:       status,        // ← pass status here
        }),
      });
      setSubmitted(true);
    } catch {
      setError("Failed to submit application. Try again.");
    } finally {
      setSubmitting(false);
    }
  };
  if (submitted) {
    return (
      <Layout>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>✅</div>
          <h2>Application Submitted!</h2>
          <p style={{ color: "#555", marginTop: "8px" }}>
            Your application for <strong>{job.title}</strong> at <strong>{job.company}</strong> has been saved.
          </p>
          <div className="actions" style={{ marginTop: "24px" }}>
            <button onClick={() => navigate("/applications")}>View My Applications</button>
            <button onClick={() => navigate("/jobs")}>Back to Jobs</button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h2>Application Draft</h2>

      {/* Job info banner */}
      <div style={{
        background: "#e3f2fd", borderRadius: "10px",
        padding: "14px 20px", marginBottom: "24px", width: "100%", maxWidth: "640px",
      }}>
        <p style={{ fontWeight: 700, fontSize: "1.1rem", color: "#01428d" }}>{job.title}</p>
        <p style={{ color: "#555" }}>{job.company}</p>
      </div>

      {/* Applicant info (read-only, from Google account) */}
      <div style={{ width: "100%", maxWidth: "640px", marginBottom: "20px" }}>
        <label style={{ fontWeight: 600, display: "block", marginBottom: "6px" }}>Name</label>
        <input
          type="text"
          value={user?.name || ""}
          readOnly
          style={{
            width: "100%", padding: "10px 12px", borderRadius: "8px",
            border: "1px solid #ddd", background: "#f9f9f9",
            fontSize: "1rem", marginBottom: "14px",
          }}
        />

        <label style={{ fontWeight: 600, display: "block", marginBottom: "6px" }}>Email</label>
        <input
          type="email"
          value={user?.email || ""}
          readOnly
          style={{
            width: "100%", padding: "10px 12px", borderRadius: "8px",
            border: "1px solid #ddd", background: "#f9f9f9",
            fontSize: "1rem", marginBottom: "14px",
          }}
        />

        <label style={{ fontWeight: 600, display: "block", marginBottom: "6px" }}>
          Cover Letter <span style={{ fontWeight: 400, color: "#888", fontSize: "0.85rem" }}>(auto-generated — feel free to edit)</span>
        </label>
        <textarea
          rows={12}
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          style={{
            width: "100%", padding: "12px", borderRadius: "8px",
            border: "1px solid #ccc", fontSize: "0.95rem", lineHeight: 1.7,
          }}
        />
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="actions" style={{ marginTop: "8px" }}>
        <button onClick={() => navigate("/jobs")}>← Back to Jobs</button>
        <button
          onClick={() => handleSubmit("Pending")}
          disabled={submitting}
          style={{ background: "#f57f17" }}
        >
          {submitting ? "Saving…" : "⏳ Save as Draft"}
        </button>
        <button
          onClick={() => handleSubmit("Submitted")}
          disabled={submitting}
        >
          {submitting ? "Submitting…" : "📤 Submit Application"}
        </button>
      </div>
    </Layout>
  );
}
