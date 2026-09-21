import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function AdminJobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    let user;

    try {
      user = JSON.parse(userData);
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
      return;
    }

    if (user.role !== "admin") {
      navigate("/");
      return;
    }

    fetch(
      "https://careerbridge-4gzv.onrender.com/api/accounts/admin-jobs/",
      {
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      }
    )
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              data.detail ||
              "Unable to load jobs."
          );
        }

        return data;
      })
      .then((data) => {
        setJobs(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError(error.message);
        setLoading(false);
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <nav className="dashboard-navbar">
          <div className="dashboard-logo">
            Career<span>Bridge</span>
          </div>
        </nav>

        <main className="dashboard-container">
          <section className="dashboard-welcome">
            <h1>Loading Jobs...</h1>
          </section>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <nav className="dashboard-navbar">
          <div className="dashboard-logo">
            Career<span>Bridge</span>
          </div>
        </nav>

        <main className="dashboard-container">
          <section className="dashboard-welcome">
            <h1>Jobs Management</h1>

            <p style={{ color: "red" }}>
              {error}
            </p>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* Navbar */}
      <nav className="dashboard-navbar">

        <div className="dashboard-logo">
          Career<span>Bridge</span>
        </div>

        <div className="dashboard-nav-links">

          <Link to="/admin-dashboard">
            Dashboard
          </Link>

          <Link to="/admin-dashboard/candidates">
            Candidates
          </Link>

          <Link to="/admin-dashboard/recruiters">
            Recruiters
          </Link>

          <Link to="/admin-dashboard/jobs">
            Jobs
          </Link>

          <Link to="/admin-dashboard/applications">
            Applications
          </Link>

          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "inherit",
              fontFamily: "inherit",
            }}
          >
            Logout
          </button>

        </div>

      </nav>

      {/* Main Content */}
      <main className="dashboard-container">

        <section className="dashboard-welcome">

          <h1>Jobs Management</h1>

          <p>
            View all jobs posted by recruiters
            in CareerBridge.
          </p>

        </section>

        {/* Total Jobs */}
        <section style={{ marginTop: "30px" }}>

          <div className="dashboard-card">

            <h3>Total Jobs</h3>

            <h2>{jobs.length}</h2>

          </div>

        </section>

        {/* Jobs Table */}
        <section style={{ marginTop: "30px" }}>

          <h2>All Jobs</h2>

          {jobs.length === 0 ? (

            <p>No jobs found.</p>

          ) : (

            <div
              style={{
                overflowX: "auto",
                marginTop: "20px",
              }}
            >

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  background: "#ffffff",
                }}
              >

                <thead>

                  <tr>

                    <th>ID</th>
                    <th>Title</th>
                    <th>Location</th>
                    <th>Job Type</th>
                    <th>Salary</th>
                    <th>Experience</th>
                    <th>Recruiter</th>
                    <th>Posted Date</th>
                    <th>Action</th>

                  </tr>

                </thead>

                <tbody>

                  {jobs.map((job) => (

                    <tr key={job.id}>

                      <td>{job.id}</td>

                      <td>{job.title}</td>

                      <td>{job.location}</td>

                      <td>{job.job_type}</td>

                      <td>{job.salary || "-"}</td>

                      <td>{job.experience}</td>

                      <td>{job.recruiter}</td>

                      <td>
                        {job.posted_date
                          ? new Date(
                              job.posted_date
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      <td>

                        <button
                          onClick={() =>
                            setSelectedJob(job)
                          }
                          style={{
                            padding: "8px 14px",
                            border: "none",
                            borderRadius: "6px",
                            background: "#2563eb",
                            color: "#ffffff",
                            cursor: "pointer",
                            fontWeight: "600",
                          }}
                        >
                          View
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

        {/* Job Details */}
        {selectedJob && (

          <section
            style={{
              marginTop: "40px",
              marginBottom: "40px",
            }}
          >

            <div className="dashboard-card">

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >

                <h2>Job Details</h2>

                <button
                  onClick={() =>
                    setSelectedJob(null)
                  }
                  style={{
                    padding: "8px 14px",
                    border: "none",
                    borderRadius: "6px",
                    background: "#dc2626",
                    color: "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>

              </div>

              <p>
                <strong>ID:</strong>{" "}
                {selectedJob.id}
              </p>

              <p>
                <strong>Title:</strong>{" "}
                {selectedJob.title}
              </p>

              <p>
                <strong>Description:</strong>{" "}
                {selectedJob.description || "-"}
              </p>

              <p>
                <strong>Location:</strong>{" "}
                {selectedJob.location || "-"}
              </p>

              <p>
                <strong>Job Type:</strong>{" "}
                {selectedJob.job_type || "-"}
              </p>

              <p>
                <strong>Salary:</strong>{" "}
                {selectedJob.salary || "-"}
              </p>

              <p>
                <strong>Required Skills:</strong>{" "}
                {selectedJob.required_skills || "-"}
              </p>

              <p>
                <strong>Experience:</strong>{" "}
                {selectedJob.experience}
              </p>

              <p>
                <strong>Recruiter:</strong>{" "}
                {selectedJob.recruiter}
              </p>

              <p>
                <strong>Posted Date:</strong>{" "}
                {selectedJob.posted_date
                  ? new Date(
                      selectedJob.posted_date
                    ).toLocaleString()
                  : "-"}

              </p>

            </div>

          </section>

        )}

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

export default AdminJobs;