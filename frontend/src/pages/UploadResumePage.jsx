import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { apiFetch } from "../services/api";

export default function UploadResumePage() {
  const [file, setFile]           = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading]     = useState(false);
  const [fetching, setFetching]   = useState(true);
  const [error, setError]         = useState("");
  const [savedMsg, setSavedMsg]   = useState("");
  const navigate = useNavigate();

  // Load previously saved resume from MongoDB on mount
  useEffect(() => {
    (async () => {
      try {
        const res  = await apiFetch("/resume/me");
        const data = await res.json();
        if (data.resume_text) {
          setResumeText(data.resume_text);
          sessionStorage.setItem("resumeText", data.resume_text);
          setSavedMsg("✅ Your previously saved resume has been loaded.");
        }
      } catch {}
      finally { setFetching(false); }
    })();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setError("");
    setSavedMsg("");
    if (selected && selected.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (ev) => setResumeText(ev.target.result);
      reader.readAsText(selected);
    }
  };

  const handleUpload = async () => {
    if (!resumeText.trim()) {
      setError("Please paste your resume text or upload a .txt file.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Save to MongoDB
      await apiFetch("/resume/save", {
        method: "POST",
        body:   JSON.stringify({ resume_text: resumeText }),
      });
      // Also keep in sessionStorage for this session
      sessionStorage.setItem("resumeText", resumeText);
      navigate("/jobs");
    } catch {
      setError("Failed to save resume. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h2>Upload Resume</h2>

      {fetching && <p style={{ color: "#888" }}>Loading your saved resume…</p>}

      {savedMsg && (
        <div style={{
          background: "#e8f5e9", border: "1px solid #a5d6a7",
          borderRadius: "8px", padding: "10px 16px",
          marginBottom: "16px", color: "#2e7d32",
        }}>
          {savedMsg}
        </div>
      )}

      <div style={{ width: "100%", maxWidth: "640px" }}>
        <input
          type="file"
          accept=".txt"
          onChange={handleFileChange}
          style={{ marginBottom: "12px" }}
        />

        <p style={{ fontWeight: 500, marginBottom: "6px" }}>
          Paste or edit resume text:
        </p>
        <textarea
          rows={12}
          style={{
            width: "100%", padding: "12px", borderRadius: "8px",
            border: "1px solid #ccc", fontSize: "0.95rem", lineHeight: 1.6,
          }}
          placeholder="Paste your resume text here..."
          value={resumeText}
          onChange={(e) => { setResumeText(e.target.value); setSavedMsg(""); }}
        />
      </div>

      {error && <p style={{ color: "red", marginTop: "8px" }}>{error}</p>}

      <div className="actions" style={{ marginTop: "16px" }}>
        <button onClick={() => { setResumeText(""); setFile(null); setSavedMsg(""); }}>
          Clear
        </button>
        <button onClick={handleUpload} disabled={loading}>
          {loading ? "Saving…" : "Save & Find Matches"}
        </button>
      </div>
    </Layout>
  );
}
