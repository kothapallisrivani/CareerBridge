import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function SavedJobs() {
  const navigate = useNavigate();

  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  // =========================
  // FETCH SAVED JOBS
  // =========================

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
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

      console.log("Saved Jobs response:", data);

      if (!response.ok) {
        setError(data.detail || "Unable to load saved jobs.");
        setLoading(false);
        return;
      }

      setSavedJobs(data);
      setLoading(false);
    } catch (err) {
      console.error("Saved Jobs error:", err);

      setError(
        "Unable to connect to server. Make sure Django is running."
      );

      setLoading(false);
    }
  };

  // =========================
  // REMOVE SAVED JOB
  // =========================

  const handleRemoveJob = async (savedJobId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const confirmRemove = window.confirm(
      "Are you sure you want to remove this job from your saved jobs?"
    );

    if (!confirmRemove) {
      return;
    }

    setRemovingId(savedJobId);

    try {
      const response = await fetch(
        `https://careerbridge-4gzv.onrender.com/api/saved-jobs/${savedJobId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();

        alert(
          data.detail || "Unable to remove saved job."
        );

        setRemovingId(null);
        return;
      }

      // Remove the job immediately from the page
      setSavedJobs((currentJobs) =>
        currentJobs.filter(
          (savedJob) => savedJob.id !== savedJobId
        )
      );

      setRemovingId(null);

      alert("Job removed from saved jobs.");
    } catch (err) {
      console.error("Remove saved job error:", err);

      alert(
        "Unable to connect to server. Make sure Django is running."
      );

      setRemovingId(null);
    }
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
          <h2>Loading saved jobs...</h2>

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
          <h2>Something went wrong</h2>

          <p>
            {error}
          </p>

          <button onClick={fetchSavedJobs}>
            Try Again
          </button>

          <button
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

        {/* Welcome Section */}

        <section className="dashboard-welcome">

          <h1>
            My Saved Jobs
          </h1>

          <p>
            Keep track of the opportunities
            you are interested in.
          </p>

        </section>

        {/* Saved Jobs Section */}

        <section className="dashboard-section">

          <div className="section-header">

            <h2>
              Saved Jobs
            </h2>

            <span>
              {savedJobs.length}{" "}
              {savedJobs.length === 1
                ? "Job"
                : "Jobs"}
            </span>

          </div>

          {/* No Saved Jobs */}

          {savedJobs.length === 0 ? (

            <div className="empty-state">

              <h3>
                No saved jobs
              </h3>

              <p>
                You haven't saved any jobs yet.
              </p>

              <button
                className="primary-btn"
                onClick={() =>
                  navigate("/jobs")
                }
              >
                Explore Jobs
              </button>

            </div>

          ) : (

            <div className="jobs-grid">

              {savedJobs.map((savedJob) => {

                const job = savedJob.job_details;

                return (
                  <div
                    className="job-card"
                    key={savedJob.id}
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

                    {/* Skills */}

                    <div className="job-skills">

                      <strong>
                        Required Skills:
                      </strong>

                      <p>
                        {job.required_skills}
                      </p>

                    </div>

                    {/* Saved Date */}

                    <p className="saved-job-date">

                      Saved on:{" "}
                      {new Date(
                        savedJob.saved_date
                      ).toLocaleDateString("en-IN")}

                    </p>

                    {/* Actions */}

                    <div className="job-actions">

                      <button
                        className="primary-btn"
                        onClick={() =>
                          navigate(
                            `/jobs/${job.id}`
                          )
                        }
                      >
                        View & Apply
                      </button>

                      <button
                        className="remove-btn"
                        onClick={() =>
                          handleRemoveJob(savedJob.id)
                        }
                        disabled={
                          removingId === savedJob.id
                        }
                      >
                        {removingId === savedJob.id
                          ? "Removing..."
                          : "Remove"}
                      </button>

                    </div>

                  </div>
                );
              })}

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

export default SavedJobs;