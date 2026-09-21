import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);

  // =========================
  // MATCHING STATES
  // =========================

  const [candidateSkills, setCandidateSkills] = useState([]);
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [matchScore, setMatchScore] = useState(0);

  // =========================
  // BULLET RENDERING
  // =========================

  const renderBulletPoints = (text) => {
    if (!text) {
      return <p>Not specified.</p>;
    }

    let formattedText = text.replace(/\r\n/g, "\n").trim();

    const labels = [
      "Writing Clean Code:",
      "Building User Interfaces:",
      "API Integration:",
      "Core Stack Proficiency:",
      "Framework Experience:",
      "State Management:",
      "Responsive & UI Styling:",
      "Version Control:",
    ];

    labels.slice(1).forEach((label) => {
      const escapedLabel = label.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      formattedText = formattedText.replace(
        new RegExp(`\\s+(?=${escapedLabel})`, "g"),
        "\n"
      );
    });

    const items = formattedText
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item !== "");

    return (
      <ul className="job-bullet-list">
        {items.map((item, index) => {
          const cleanItem = item.startsWith("-")
            ? item.substring(1).trim()
            : item;

          return <li key={index}>{cleanItem}</li>;
        })}
      </ul>
    );
  };

  // =========================
  // NORMALIZE SKILL
  // =========================

  const normalizeSkill = (skill) => {
    if (!skill) {
      return "";
    }

    const normalized = skill
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

    const aliases = {
      js: "javascript",
      "javascript (es6+)": "javascript",
      "javascript es6+": "javascript",
      javascript: "javascript",

      py: "python",
      python: "python",

      "react.js": "react",
      reactjs: "react",
      react: "react",

      html5: "html",
      html: "html",

      css3: "css",
      css: "css",

      sql: "sql",

      git: "git",

      "rest api": "rest api",
      "rest apis": "rest api",
      "restful api": "rest api",
      "restful apis": "rest api",

      "tailwind css": "tailwind css",
      tailwind: "tailwind css",

      "sass/scss": "sass",
      sass: "sass",
      scss: "sass",

      bootstrap: "bootstrap",

      vuejs: "vue.js",
      vue: "vue.js",
      "vue.js": "vue.js",

      angular: "angular",

      redux: "redux",
      zustand: "zustand",
      vuex: "vuex",

      graphql: "graphql",

      "node.js": "node.js",
      nodejs: "node.js",
      node: "node.js",
    };

    return aliases[normalized] || normalized;
  };

  // =========================
  // GET SKILL LIST
  // =========================

  const parseSkills = (skillsText) => {
    if (!skillsText) {
      return [];
    }

    if (Array.isArray(skillsText)) {
      return skillsText
        .map((skill) => normalizeSkill(skill))
        .filter(Boolean);
    }

    return skillsText
      .split(",")
      .map((skill) => normalizeSkill(skill))
      .filter(Boolean);
  };

  // =========================
  // CALCULATE JOB MATCH
  // =========================

  const calculateMatch = (candidate, currentJob) => {
    if (!candidate || !currentJob) {
      setCandidateSkills([]);
      setMatchedSkills([]);
      setMissingSkills([]);
      setMatchScore(0);
      return;
    }

    const candidateSkillList = parseSkills(
      candidate.skills
    );

    // Use required_skills first.
    // If required_skills is empty, use key_skills.
    const jobSkillText =
      currentJob.required_skills ||
      currentJob.key_skills ||
      "";

    const jobSkillList = parseSkills(
      jobSkillText
    );

    setCandidateSkills(candidateSkillList);

    if (jobSkillList.length === 0) {
      setMatchedSkills([]);
      setMissingSkills([]);
      setMatchScore(0);
      return;
    }

    const uniqueCandidateSkills = [
      ...new Set(candidateSkillList),
    ];

    const uniqueJobSkills = [
      ...new Set(jobSkillList),
    ];

    const matched = uniqueJobSkills.filter(
      (skill) =>
        uniqueCandidateSkills.includes(skill)
    );

    const missing = uniqueJobSkills.filter(
      (skill) =>
        !uniqueCandidateSkills.includes(skill)
    );

    const score =
      uniqueJobSkills.length > 0
        ? (matched.length /
          uniqueJobSkills.length) *
        100
        : 0;

    setMatchedSkills(matched);
    setMissingSkills(missing);
    setMatchScore(
      Math.round(score * 100) / 100
    );
  };

  // =========================
  // FETCH CANDIDATE PROFILE
  // =========================

  const fetchCandidateProfile = async (
    token
  ) => {
    try {
      const response = await fetch(
        "https://careerbridge-4gzv.onrender.com/api/candidates/",
        {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.log(
          "Unable to fetch candidate profile."
        );
        return;
      }

      const data = await response.json();

      const candidates = Array.isArray(data)
        ? data
        : data.results || [];

      if (candidates.length > 0) {
        calculateMatch(
          candidates[0],
          job
        );
      }
    } catch (err) {
      console.error(
        "Candidate profile error:",
        err
      );
    }
  };

  // =========================
  // FETCH JOB DETAILS
  // =========================

  useEffect(() => {
    fetchJobDetails();
    checkSavedJob();
  }, [id]);

  const fetchJobDetails = async () => {
    const token = localStorage.getItem(
      "token"
    );

    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `https://careerbridge-4gzv.onrender.com/api/jobs/${id}/`,
        {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      console.log(
        "Job Details response:",
        data
      );

      if (!response.ok) {
        setError(
          data.detail ||
          "Unable to load job details."
        );

        setLoading(false);
        return;
      }

      setJob(data);

      setLoading(false);

      // Fetch candidate profile after
      // job has been loaded.
      fetchCandidateProfileForJob(
        token,
        data
      );
    } catch (err) {
      console.error(
        "Job Details error:",
        err
      );

      setError(
        "Unable to connect to server. Make sure Django is running."
      );

      setLoading(false);
    }
  };

  // =========================
  // FETCH CANDIDATE FOR JOB
  // =========================

  const fetchCandidateProfileForJob = async (
    token,
    currentJob
  ) => {
    try {
      const response = await fetch(
        "https://careerbridge-4gzv.onrender.com/api/candidates/",
        {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      const candidates = Array.isArray(data)
        ? data
        : data.results || [];

      if (candidates.length > 0) {
        calculateMatch(
          candidates[0],
          currentJob
        );
      }
    } catch (err) {
      console.error(
        "Candidate profile error:",
        err
      );
    }
  };

  // =========================
  // CHECK SAVED JOB
  // =========================

  const checkSavedJob = async () => {
    const token = localStorage.getItem(
      "token"
    );

    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        "https://careerbridge-4gzv.onrender.com/api/saved-jobs/",
        {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return;
      }

      const savedJobs = Array.isArray(data)
        ? data
        : data.results || [];

      const alreadySaved = savedJobs.some(
        (savedJob) =>
          Number(savedJob.job) ===
          Number(id)
      );

      setIsSaved(alreadySaved);
    } catch (err) {
      console.error(
        "Check saved job error:",
        err
      );
    }
  };

  // =========================
  // APPLY FOR JOB
  // =========================

  const handleApply = async () => {
    const token = localStorage.getItem(
      "token"
    );

    if (!token) {
      navigate("/login");
      return;
    }

    setApplying(true);

    try {
      const response = await fetch(
        "https://careerbridge-4gzv.onrender.com/api/applications/",
        {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            job: Number(id),
          }),
        }
      );

      const data = await response.json();

      console.log(
        "Apply response:",
        data
      );

      if (!response.ok) {
        alert(
          data.detail ||
          data.error ||
          "Unable to apply for this job."
        );

        setApplying(false);
        return;
      }

      alert(
        "Application submitted successfully!"
      );
    } catch (err) {
      console.error(
        "Apply error:",
        err
      );

      alert(
        "Unable to connect to server. Make sure Django is running."
      );
    }

    setApplying(false);
  };

  // =========================
  // SAVE JOB
  // =========================

  const handleSaveJob = async () => {
    const token = localStorage.getItem(
      "token"
    );

    if (!token) {
      navigate("/login");
      return;
    }

    if (isSaved) {
      alert(
        "This job is already saved."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        "https://careerbridge-4gzv.onrender.com/api/saved-jobs/",
        {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            job: Number(id),
          }),
        }
      );

      const data = await response.json();

      console.log(
        "Save Job response:",
        data
      );

      if (!response.ok) {
        alert(
          data.detail ||
          data.error ||
          "Unable to save this job."
        );

        setSaving(false);
        return;
      }

      setIsSaved(true);

      alert(
        "Job saved successfully!"
      );
    } catch (err) {
      console.error(
        "Save Job error:",
        err
      );

      alert(
        "Unable to connect to server. Make sure Django is running."
      );
    }

    setSaving(false);
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <h2>
            Loading job details...
          </h2>

          <p>Please wait.</p>
        </div>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error || !job) {
    return (
      <div className="dashboard-page">

        <nav className="dashboard-navbar">

          <div className="dashboard-logo">
            Career<span>Bridge</span>
          </div>

          <div className="dashboard-nav-links">

            <Link to="/">
              Home
            </Link>

            <Link to="/candidate-dashboard">
              Dashboard
            </Link>

            <Link to="/jobs">
              Jobs
            </Link>

            <button
              onClick={handleLogout}
              className="logout-btn"
            >
              Logout
            </button>

          </div>

        </nav>

        <div className="dashboard-error">

          <h2>
            Job Not Found
          </h2>

          <p>
            {error ||
              "The requested job could not be found."}
          </p>

          <button
            className="primary-btn"
            onClick={() =>
              navigate("/jobs")
            }
          >
            Back to Jobs
          </button>

        </div>

      </div>
    );
  }

  // =========================
  // MAIN UI
  // =========================

  return (
    <div className="dashboard-page">

      {/* Navbar */}

      <nav className="dashboard-navbar">

        <div className="dashboard-logo">
          Career<span>Bridge</span>
        </div>

        <div className="dashboard-nav-links">

          <Link to="/">
            Home
          </Link>

          <Link to="/candidate-dashboard">
            Dashboard
          </Link>

          <Link to="/jobs">
            Jobs
          </Link>

          <Link to="/saved-jobs">
            Saved Jobs
          </Link>

          <button
            onClick={handleLogout}
            className="logout-btn"
          >
            Logout
          </button>

        </div>

      </nav>

      {/* Main Content */}

      <main className="dashboard-container">

        <div className="job-details-card">

          {/* Job Header */}

          <div className="job-details-header">

            <h1>
              {job.title}
            </h1>

            <p className="job-company">
              {job.recruiter_name ||
                job.recruiter ||
                "Company"}
            </p>

            <span className="job-type">
              {job.job_type}
            </span>

          </div>

          {/* Job Information */}

          <div className="job-details-grid">

            <div>
              <strong>
                Location:
              </strong>

              <span>
                {job.location ||
                  "Not specified"}
              </span>
            </div>

            <div>
              <strong>
                Salary:
              </strong>

              <span>
                {job.salary ||
                  "Not specified"}
              </span>
            </div>

            <div>
              <strong>
                Experience:
              </strong>

              <span>
                {job.experience !== null &&
                  job.experience !== undefined
                  ? `${job.experience} years`
                  : "Not specified"}
              </span>
            </div>

            <div>
              <strong>
                Work Mode:
              </strong>

              <span>
                {job.work_mode ||
                  "Not specified"}
              </span>
            </div>

            <div>
              <strong>
                Shift:
              </strong>

              <span>
                {job.shift ||
                  "Not specified"}
              </span>
            </div>

            <div>
              <strong>
                Shift Timings:
              </strong>

              <span>
                {job.shift_timing ||
                  "Not specified"}
              </span>
            </div>

            <div>
              <strong>
                Cab Facility:
              </strong>

              <span>
                {job.cab_available
                  ? "Available"
                  : "Not Available"}
              </span>
            </div>

            <div>
              <strong>
                Vacancies:
              </strong>

              <span>
                {job.vacancies !== null &&
                  job.vacancies !== undefined
                  ? job.vacancies
                  : "Not specified"}
              </span>
            </div>

          </div>

          {/* Job Description */}

          <section className="job-details-section">

            <h2>
              Job Description
            </h2>

            <p>
              {job.description ||
                "No job description provided."}
            </p>

          </section>

          {/* What You'll Be Doing */}

          <section className="job-details-section">

            <h2>
              What You'll Be Doing
            </h2>

            {renderBulletPoints(
              job.what_youll_be_doing
            )}

          </section>

          {/* What We're Looking For */}

          <section className="job-details-section">

            <h2>
              What We're Looking For
            </h2>

            {renderBulletPoints(
              job.what_were_looking_for
            )}

          </section>

          {/* Education */}

          <section className="job-details-section">

            <h2>
              Education
            </h2>

            <p>
              {job.education ||
                "Not specified."}
            </p>

          </section>

          {/* Key Skills */}

          <section className="job-details-section">

            <h2>
              Key Skills
            </h2>

            {job.key_skills ? (

              <ul className="job-skills-list">

                {job.key_skills
                  .split(",")
                  .filter(
                    (skill) =>
                      skill.trim() !== ""
                  )
                  .map(
                    (skill, index) => (
                      <li key={index}>
                        {skill.trim()}
                      </li>
                    )
                  )}

              </ul>

            ) : (

              <p>
                No key skills specified.
              </p>

            )}

          </section>

          {/* =========================
              MATCHED SKILLS
          ========================= */}

          {/* =========================
    MATCHED SKILLS
========================= */}

          <section className="job-details-section">
            <h2>Matched Skills</h2>

            {matchedSkills.length > 0 ? (
              <div className="matched-skills-list">
                {matchedSkills.map((skill, index) => (
                  <div
                    key={index}
                    className="matched-skill-item"
                  >
                    <span className="matched-skill-icon">
                      ✓
                    </span>

                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>No matching skills found.</p>
            )}
          </section>


          {/* =========================
    MISSING SKILLS
========================= */}

          <section className="job-details-section">
            <h2>Missing Skills</h2>

            {missingSkills.length > 0 ? (
              <div className="missing-skills-list">
                {missingSkills.map((skill, index) => (
                  <div
                    key={index}
                    className="missing-skill-item"
                  >
                    <span className="missing-skill-icon">
                      ✕
                    </span>

                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>No missing skills.</p>
            )}
          </section>

          {/* =========================
              MATCH SCORE
          ========================= */}

          <section className="job-details-section">

            <h2>
              Job Match
            </h2>

            <p>
              <strong>
                Match Percentage:
              </strong>{" "}
              {matchScore}%
            </p>

            {candidateSkills.length === 0 && (
              <p>
                Candidate skills are not available.
              </p>
            )}

          </section>

          {/* Posted Date */}

          <div className="job-posted-date">

            <strong>
              Posted Date:
            </strong>

            <span>
              {job.posted_date
                ? new Date(
                  job.posted_date
                ).toLocaleDateString()
                : "Not specified"}
            </span>

          </div>

          {/* Actions */}

          <div className="job-actions">

            <button
              className="primary-btn"
              onClick={handleApply}
              disabled={applying}
            >
              {applying
                ? "Applying..."
                : "Apply Now"}
            </button>

            <button
              className={
                isSaved
                  ? "saved-job-btn"
                  : "save-job-btn"
              }
              onClick={handleSaveJob}
              disabled={
                saving || isSaved
              }
            >
              {saving
                ? "Saving..."
                : isSaved
                  ? "✓ Saved"
                  : "🔖 Save Job"}
            </button>

          </div>

          {/* Back */}

          <button
            className="secondary-btn"
            onClick={() =>
              navigate("/jobs")
            }
          >
            ← Back to Jobs
          </button>

        </div>

      </main>

      {/* Footer */}

      <footer className="dashboard-footer">

        <p>
          © 2026 CareerBridge. All rights reserved.
        </p>

      </footer>

    </div>
  );
}

export default JobDetails;