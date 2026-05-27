import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { apiFetch } from "../services/api";

const SKILL_KEYWORDS = [
  "python","javascript","typescript","react","angular","vue","node","fastapi",
  "django","flask","sql","mongodb","postgresql","mysql","aws","azure","gcp",
  "docker","kubernetes","git","linux","java","c++","c#","ruby","php","swift",
  "kotlin","machine learning","deep learning","tensorflow","pytorch","scikit",
  "pandas","numpy","data analysis","rest","graphql","html","css","figma",
  "excel","power bi","tableau","spark","hadoop","kafka","redis","nginx",
  "devops","ci/cd","agile","scrum","nlp","computer vision","sap",

  // Business & Management
  "business analysis","strategic planning","operations management",
  "project management","risk management","supply chain","logistics",
  "human resource management","talent acquisition","leadership",
  "entrepreneurship","business development","stakeholder management",

  // Marketing
  "digital marketing","seo","sem","content marketing","social media marketing",
  "brand management","market research","email marketing","google ads",
  "campaign management","customer engagement","growth hacking",

  // Sales
  "sales strategy","lead generation","crm","customer relationship management",
  "b2b sales","b2c sales","negotiation","closing deals","sales funnel",
  "account management","inside sales","field sales",

  // Accounts & Finance
  "accounting","financial analysis","bookkeeping","taxation","auditing",
  "budgeting","financial reporting","tally","quickbooks","cost accounting",
  "gst","accounts payable","accounts receivable","invoice processing",

  // Electrical Engineering (EEE)
  "power systems","electrical machines","control systems","power electronics",
  "circuit analysis","high voltage engineering","renewable energy",
  "smart grid","transformers","switchgear","load flow analysis",

  // Electronics & Communication Engineering (ECE)
  "analog electronics","digital electronics","signals and systems",
  "communication systems","embedded systems","vlsi","microprocessors",
  "microcontrollers","fpga","pcb design","iot","sensor networks",

  // Telecommunications
  "telecommunication","wireless communication","5g","4g lte","network planning",
  "rf engineering","optical communication","satellite communication",
  "network security","voip","broadband","antenna design"
];

function extractSkills(text) {
  const lower = text.toLowerCase();
  return SKILL_KEYWORDS.filter((sk) => lower.includes(sk));
}

function keywordScore(resumeSkills, jobDescription) {
  if (!resumeSkills.length || !jobDescription) return 0;
  const lower = jobDescription.toLowerCase();
  const hits  = resumeSkills.filter((sk) => lower.includes(sk));
  return Math.round((hits.length / resumeSkills.length) * 100);
}

async function fetchMlScore(resumeText, jobDescription) {
  try {
    const res = await apiFetch("/match", {
      method: "POST",
      body:   JSON.stringify({ resume_text: resumeText, job_text: jobDescription }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.match_score ?? null;
  } catch { return null; }
}

function averageScore(kw, ml) {
  if (ml === null) return kw;
  return Math.round((kw + ml) / 2);
}

const scoreColor = (s) => s >= 60 ? "#2e7d32" : s >= 30 ? "#f57c00" : "#c62828";
const scoreBg    = (s) => s >= 60 ? "#e8f5e9" : s >= 30 ? "#fff3e0" : "#ffebee";

// Job modal 
function JobModal({ job, onClose, onDraft }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.55)",
        zIndex: 9999,
        padding: "20px",
        overflowY: "auto",
      }}
    >
      {/* Invisible backdrop click area */}
      <div
        onClick={onClose}
        style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
      />

      {/* Modal box — sits above backdrop */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          background: "white",
          borderRadius: "14px",
          padding: "32px",
          maxWidth: "680px",
          width: "100%",
          margin: "40px auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ marginBottom: "16px" }}>
          <h2 style={{ color: "#01428d", marginBottom: "4px" }}>{job.title}</h2>
          <p style={{ color: "#555", fontWeight: 600 }}>{job.company}</p>
          <span style={{
            display: "inline-block", marginTop: "8px",
            background: scoreBg(job.score), color: scoreColor(job.score),
            borderRadius: "20px", padding: "4px 14px",
            fontWeight: 700, fontSize: "0.9rem",
          }}>
            {job.score}% match
          </span>
        </div>

        <hr style={{ margin: "16px 0", borderColor: "#eee" }} />
        <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.8, color: "#333", fontSize: "0.95rem" }}>
          {job.full_description || job.description}
        </p>

        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          <button onClick={onDraft} style={{ flex: 1 }}>Generate Draft</button>
          <button onClick={onClose} style={{ flex: 1, background: "#888" }}>Close</button>
        </div>
      </div>
    </div>
  );
}
// ── Main page ──────────────────────────────────────────────────────────────
export default function JobMatchesPage() {
  const [jobs, setJobs]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [scoring, setScoring]         = useState(false);
  const [mlAvailable, setMlAvailable] = useState(true);
  const [error, setError]             = useState("");
  const [searchTerm, setSearchTerm]   = useState("");
  const [resumeSkills, setResumeSkills] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);   // for modal
  const navigate = useNavigate();

  useEffect(() => {
    const resumeText = sessionStorage.getItem("resumeText") || "";
    const skills = extractSkills(resumeText);
    setResumeSkills(skills);
    fetchAndScoreJobs(resumeText, skills);
  }, []);

  async function fetchAndScoreJobs(resumeText, skills) {
    setLoading(true);
    setError("");
    try {
      const res  = await apiFetch("/jobs");
      if (!res.ok) throw new Error();
      const data = await res.json();

      const withKw = data
        .map((job) => ({
          ...job,
          kwScore: keywordScore(skills, job.full_description || job.description),
          mlScore: null,
          score:   keywordScore(skills, job.full_description || job.description),
          status:  "keyword",
        }))
        .sort((a, b) => b.score - a.score);

      setJobs(withKw);
      setLoading(false);

      if (resumeText.trim()) {
        setScoring(true);
        const batchSize = 5;
        for (let i = 0; i < withKw.length; i += batchSize) {
          const batch   = withKw.slice(i, i + batchSize);
          const results = await Promise.all(
            batch.map((job) => fetchMlScore(resumeText, job.full_description || job.description))
          );
          if (i === 0 && results.every((r) => r === null)) setMlAvailable(false);

          setJobs((prev) => {
            const updated = [...prev];
            batch.forEach((job, idx) => {
              const ml  = results[idx];
              const pos = updated.findIndex((j) => j.id === job.id);
              if (pos !== -1) {
                updated[pos] = {
                  ...updated[pos],
                  mlScore: ml,
                  score:   averageScore(updated[pos].kwScore, ml),
                  status:  "done",
                };
              }
            });
            return [...updated].sort((a, b) => b.score - a.score);
          });
        }
        setScoring(false);
      }
    } catch {
      setError("Could not reach backend. Make sure uvicorn is running on port 8000.");
      setLoading(false);
    }
  }

  const handleGenerateDraft = (job) => {
    navigate("/draft", {
      state: {
        job: {
          title:       job.title,
          company:     job.company,
          description: job.full_description || job.description,
        },
      },
    });
  };

  const filtered = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <h2>Job Matches</h2>

      {resumeSkills.length > 0 && (
        <div style={{ marginBottom: "14px" }}>
          <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#444" }}>Skills detected: </span>
          {resumeSkills.map((sk) => (
            <span key={sk} style={{
              display: "inline-block", background: "#e3f2fd", color: "#01579b",
              borderRadius: "12px", padding: "2px 10px", margin: "2px 4px",
              fontSize: "0.8rem", fontWeight: 500,
            }}>{sk}</span>
          ))}
        </div>
      )}

      {/* {resumeSkills.length === 0 && !loading && (
        <div style={{
          background: "#fff8e1", border: "1px solid #ffe082", borderRadius: "8px",
          padding: "12px 16px", marginBottom: "14px", color: "#795548",
        }}>
          ⚠️ No resume detected. <a href="/upload">Upload your resume</a> to get match scores.
        </div>
      )} */}

      {scoring && (
        <div style={{
          background: "#e8f5e9", borderRadius: "8px", padding: "8px 16px",
          marginBottom: "14px", color: "#2e7d32", fontSize: "0.9rem",
        }}>
          🤖 ML model scoring in progress… scores updating live.
        </div>
      )}

      {!mlAvailable && !scoring && (
        <div style={{
          background: "#fff3e0", borderRadius: "8px", padding: "8px 16px",
          marginBottom: "14px", color: "#e65100", fontSize: "0.9rem",
        }}>
          ⚠️ ML backend unreachable — showing keyword scores only.
        </div>
      )}

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search by title or company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, padding: "10px 14px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "1rem" }}
        />
        <button onClick={() => setSearchTerm("")}>Clear</button>
      </div>

      {loading && <p style={{ color: "#555" }}>Loading jobs from dataset…</p>}
      {error   && <p style={{ color: "orange" }}>{error}</p>}
      {!loading && filtered.length === 0 && !error && <p>No jobs found.</p>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {filtered.map((job) => (
          <div
            key={job.id}
            className="job-card"
            style={{ width: "300px", display: "flex", flexDirection: "column" }}
          >
            <div>
              <h3 style={{ color: "#4a90e2", marginBottom: "4px", fontSize: "1rem" }}>{job.title}</h3>
              <p style={{ fontWeight: 600, marginBottom: "4px" }}>{job.company}</p>
              <div style={{ margin: "8px 0" }}>
                <span style={{
                  background: scoreBg(job.score), color: scoreColor(job.score),
                  borderRadius: "20px", padding: "4px 12px",
                  fontWeight: 700, fontSize: "0.9rem",
                }}>
                  {job.score}% match
                  {job.status === "keyword" && scoring && (
                    <span style={{ fontSize: "0.75rem", marginLeft: "6px", opacity: 0.7 }}>…</span>
                  )}
                </span>
              </div>

              {/* Clickable description — click to open modal */}
              <p
                onClick={() => setSelectedJob(job)}
                style={{
                  fontSize: "0.82rem", color: "#555", marginTop: "6px",
                  lineHeight: 1.5, cursor: "pointer",
                  borderBottom: "1px dashed #bbb", paddingBottom: "8px",
                }}
                title="Click to read full description"
              >
                {job.description}
                <span style={{ color: "#4a90e2", marginLeft: "4px", fontSize: "0.8rem" }}>
                  Read more →
                </span>
              </p>
            </div>

            <div className="actions" style={{ marginTop: "12px" }}>
              <button
                onClick={() => setSelectedJob(job)}
                style={{ background: "#555", fontSize: "0.85rem", padding: "8px 12px" }}
              >
                View Details
              </button>
              <button
                onClick={() => handleGenerateDraft(job)}
                style={{ fontSize: "0.85rem", padding: "8px 12px" }}
              >
                Generate Draft
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Full description modal */}
      {selectedJob && (
        <JobModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onDraft={() => { setSelectedJob(null); handleGenerateDraft(selectedJob); }}
        />
      )}
    </Layout>
  );
}
