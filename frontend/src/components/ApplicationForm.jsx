function ApplicationForm() {
  return (
    <form className="application-form">
      <label>
        Full Name:
        <input type="text" placeholder="Enter your name" />
      </label>
      <label>
        Email:
        <input type="email" placeholder="Enter your email" />
      </label>
      <label>
        Experience:
        <textarea placeholder="Enter your experience"></textarea>
      </label>
    </form>
  );
}

export default ApplicationForm;
