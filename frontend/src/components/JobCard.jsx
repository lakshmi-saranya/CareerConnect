function JobCard({ role, company, score }) {
  return (
    <div className="job-card">
      <h3>{role}</h3>
      <p>{company}</p>
      <p>Match Score: {score}%</p>
      <div className="actions">
        <button>View Details</button>
        <button>Generate Draft</button>
      </div>
    </div>
  );
}

export default JobCard;
