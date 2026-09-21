import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Jobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & Filter states
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [skills, setSkills] = useState("");

  // Saved Jobs
  const [savedJobs, setSavedJobs] = useState([]);
  const [savingJobId, setSavingJobId] = useState(null);

  useEffect(() => {
    fetchJobs();
    fetchSavedJobs();
  }, []);

  // =========================
  // FETCH JOBS
  // =========================

  const fetchJobs = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/jobs/",
        {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      console.log("Jobs response:", data);

      if (!response.ok) {
        setError(data.detail || "Unable to load jobs.");
        setLoading(false);
        return;
      }

      setJobs(data);
      setFilteredJobs(data);
      setLoading(false);
    } catch (err) {
      console.error("Jobs error:", err);

      setError(
        "Unable to connect to server. Make sure Django is running."
      );

      setLoading(false);
    }
  };

  // =========================
  // FETCH SAVED JOBS
  // =========================

  const fetchSavedJobs = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/saved-jobs/",
        {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      console.log("Saved Jobs response:", data);

      if (!response.ok) {
        console.error("Unable to load saved jobs:", data);
        return;
      }

      setSavedJobs(data);
    } catch (err) {
      console.error("Saved Jobs error:", err);
    }
  };

  // =========================
  // SEARCH & FILTER
  // =========================

  useEffect(() => {
    let result = [...jobs];

    // Search by Job Title
    if (search.trim() !== "") {
      result = result.filter((job) =>
        (job.title || "")
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    // Filter by Location
    if (location.trim() !== "") {
      result = result.filter((job) =>
        (job.location || "")
          .toLowerCase()
          .includes(location.toLowerCase())
      );
    }

    // Filter by Job Type
    if (jobType !== "") {
      result = result.filter(
        (job) => job.job_type === jobType
      );
    }

    // Search by Key Skills
    if (skills.trim() !== "") {
      result = result.filter((job) =>
        (job.key_skills || "")
          .toLowerCase()
          .includes(skills.toLowerCase())
      );
    }

    setFilteredJobs(result);
  }, [search, location, jobType, skills, jobs]);

  // =========================
  // CHECK IF JOB IS SAVED
  // =========================

  const isJobSaved = (jobId) => {
    return savedJobs.some(
      (savedJob) => savedJob.job === jobId
    );
  };

  // =========================
  // SAVE JOB
  // =========================

  const handleSaveJob = async (jobId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    // Prevent duplicate save
    if (isJobSaved(jobId)) {
      alert("This job is already saved.");
      return;
    }

    setSavingJobId(jobId);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/saved-jobs/",
        {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            job: jobId,
          }),
        }
      );

      const data = await response.json();

      console.log("Save Job response:", data);

      if (!response.ok) {
        alert(
          data.detail ||
            "Unable to save this job."
        );

        setSavingJobId(null);
        return;
      }

      // Add newly saved job to state
      setSavedJobs((previousSavedJobs) => [
        ...previousSavedJobs,
        data,
      ]);

      alert("Job saved successfully!");
    } catch (err) {
      console.error("Save Job error:", err);

      alert(
        "Unable to connect to server. Make sure Django is running."
      );
    }

    setSavingJobId(null);
  };

  // =========================
  // CLEAR FILTERS
  // =========================

  const clearFilters = () => {
    setSearch("");
    setLocation("");
    setJobType("");
    setSkills("");
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
            Loading jobs...
          </h2>

          <p>
            Please wait.
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">
          <h2>
            Something went wrong
          </h2>

          <p>
            {error}
          </p>

          <button onClick={fetchJobs}>
            Try Again
          </button>

          <button
            onClick={() =>
              navigate("/candidate-dashboard")
            }
          >
            Back to Dashboard
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

        {/* Welcome Section */}

        <section className="dashboard-welcome">

          <h1>
            Find Your Next Opportunity
          </h1>

          <p>
            Explore jobs that match your skills
            and career goals.
          </p>

        </section>

        {/* Search & Filters */}

        <section className="dashboard-section">

          <div className="section-header">

            <h2>
              Search & Filter Jobs
            </h2>

          </div>

          <div className="job-filters">

            {/* Job Title */}

            <div className="filter-group">

              <label>
                Search Job Title
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="e.g. Python Developer"
              />

            </div>

            {/* Location */}

            <div className="filter-group">

              <label>
                Location
              </label>

              <input
                type="text"
                value={location}
                onChange={(e) =>
                  setLocation(e.target.value)
                }
                placeholder="e.g. Hyderabad"
              />

            </div>

            {/* Job Type */}

            <div className="filter-group">

              <label>
                Job Type
              </label>

              <select
                value={jobType}
                onChange={(e) =>
                  setJobType(e.target.value)
                }
              >

                <option value="">
                  All Job Types
                </option>

                <option value="Full Time">
                  Full Time
                </option>

                <option value="Part Time">
                  Part Time
                </option>

                <option value="Internship">
                  Internship
                </option>

                <option value="Contract">
                  Contract
                </option>

              </select>

            </div>

            {/* Skills */}

            <div className="filter-group">

              <label>
                Key Skills
              </label>

              <input
                type="text"
                value={skills}
                onChange={(e) =>
                  setSkills(e.target.value)
                }
                placeholder="e.g. Python"
              />

            </div>

          </div>

          {/* Clear Filters */}

          <div className="filter-actions">

            <button
              className="secondary-btn"
              onClick={clearFilters}
            >
              Clear Filters
            </button>

          </div>

        </section>

        {/* Available Jobs */}

        <section className="dashboard-section">

          <div className="section-header">

            <h2>
              Available Jobs
            </h2>

            <span>
              {filteredJobs.length}{" "}
              {filteredJobs.length === 1
                ? "Job"
                : "Jobs"}
            </span>

          </div>

          {filteredJobs.length === 0 ? (

            <div className="empty-state">

              <h3>
                No jobs found
              </h3>

              <p>
                Try changing your search or filters.
              </p>

              <button
                className="primary-btn"
                onClick={clearFilters}
              >
                Clear Filters
              </button>

            </div>

          ) : (

            <div className="jobs-grid">

              {filteredJobs.map((job) => (

                <div
                  className="job-card"
                  key={job.id}
                >

                  {/* Job Header */}

                  <div className="job-card-header">

                    <h3>
                      {job.title}
                    </h3>

                    <span className="job-type">
                      {job.job_type}
                    </span>

                  </div>

                  {/* Location */}

                  <p className="job-location">
                    📍 {job.location}
                  </p>

                  {/* Description */}

                  <p className="job-description">
                    {job.description}
                  </p>

                  {/* Job Details */}

                  <div className="job-details">

                    <div>

                      <strong>
                        Experience:
                      </strong>

                      <span>
                        {job.experience} years
                      </span>

                    </div>

                    <div>

                      <strong>
                        Salary:
                      </strong>

                      <span>
                        {job.salary || "Not specified"}
                      </span>

                    </div>

                  </div>

                  {/* Key Skills */}

                  <div className="job-skills">

                    <strong>
                      Key Skills:
                    </strong>

                    <p>
                      {job.key_skills || "Not specified"}
                    </p>

                  </div>

                  {/* Buttons */}

                  <div className="job-actions">

                    {/* Save Job */}

                    <button
                      className={
                        isJobSaved(job.id)
                          ? "saved-job-btn"
                          : "save-job-btn"
                      }
                      onClick={() =>
                        handleSaveJob(job.id)
                      }
                      disabled={
                        savingJobId === job.id ||
                        isJobSaved(job.id)
                      }
                    >

                      {savingJobId === job.id
                        ? "Saving..."
                        : isJobSaved(job.id)
                        ? "✓ Saved"
                        : "🔖 Save Job"}

                    </button>

                    {/* View & Apply */}

                    <button
                      className="primary-btn"
                      onClick={() =>
                        navigate(`/jobs/${job.id}`)
                      }
                    >
                      View & Apply
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

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

export default Jobs;