import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function RecruiterJobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    job_type: "Full Time",
    salary: "",
    required_skills: "",
    experience: 0,
  });

  const getUserData = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
      return null;
    }

    try {
      const user = JSON.parse(userData);

      if (user.role !== "recruiter") {
        navigate("/login");
        return null;
      }

      return { token, user };
    } catch (error) {
      console.error("USER DATA ERROR:", error);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/login");
      return null;
    }
  };

  const fetchJobs = async () => {
    const data = getUserData();

    if (!data) return;

    const { token } = data;

    try {
      setLoading(true);
      setError("");

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

      const responseText = await response.text();

      console.log(
        "RECRUITER JOBS HTTP STATUS:",
        response.status
      );

      console.log(
        "RECRUITER JOBS SERVER RESPONSE:",
        responseText
      );

      let responseData = null;

      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.warn(
          "Jobs response was not JSON.",
          parseError
        );
      }

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");

        return;
      }

      if (!response.ok) {
        const message =
          responseData?.detail ||
          responseData?.error ||
          `Server returned HTTP ${response.status}.`;

        throw new Error(message);
      }

      setJobs(responseData || []);
    } catch (error) {
      console.error("FETCH JOBS ERROR:", error);

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      job_type: "Full Time",
      salary: "",
      required_skills: "",
      experience: 0,
    });

    setEditingJobId(null);
    setShowForm(false);
  };

  const handleCreateJob = async (event) => {
    event.preventDefault();

    const data = getUserData();

    if (!data) return;

    const { token } = data;

    try {
      setError("");

      const response = await fetch(
        "http://127.0.0.1:8000/api/jobs/",
        {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            location: formData.location,
            job_type: formData.job_type,
            salary: formData.salary,
            required_skills: formData.required_skills,
            experience: Number(formData.experience),
          }),
        }
      );

      const responseText = await response.text();

      console.log(
        "CREATE JOB HTTP STATUS:",
        response.status
      );

      console.log(
        "CREATE JOB SERVER RESPONSE:",
        responseText
      );

      let responseData = null;

      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.warn(
          "Create job response was not JSON.",
          parseError
        );
      }

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");

        return;
      }

      if (response.status === 403) {
        const message =
          responseData?.detail ||
          responseData?.error ||
          "You do not have permission to create a job.";

        throw new Error(`403 Forbidden: ${message}`);
      }

      if (!response.ok) {
        const message =
          responseData?.detail ||
          responseData?.error ||
          `Server returned HTTP ${response.status}.`;

        throw new Error(message);
      }

      alert("Job created successfully!");

      resetForm();

      await fetchJobs();
    } catch (error) {
      console.error("CREATE JOB ERROR:", error);

      setError(error.message);

      alert(error.message);
    }
  };

  const handleEditClick = (job) => {
    setEditingJobId(job.id);

    setFormData({
      title: job.title || "",
      description: job.description || "",
      location: job.location || "",
      job_type: job.job_type || "Full Time",
      salary: job.salary || "",
      required_skills: job.required_skills || "",
      experience: job.experience ?? 0,
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleUpdateJob = async (event) => {
    event.preventDefault();

    const data = getUserData();

    if (!data) return;

    const { token } = data;

    try {
      setError("");

      const response = await fetch(
        `http://127.0.0.1:8000/api/jobs/${editingJobId}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            location: formData.location,
            job_type: formData.job_type,
            salary: formData.salary,
            required_skills: formData.required_skills,
            experience: Number(formData.experience),
          }),
        }
      );

      const responseText = await response.text();

      console.log(
        "UPDATE JOB HTTP STATUS:",
        response.status
      );

      console.log(
        "UPDATE JOB SERVER RESPONSE:",
        responseText
      );

      let responseData = null;

      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.warn(
          "Update job response was not JSON.",
          parseError
        );
      }

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");

        return;
      }

      if (response.status === 403) {
        const message =
          responseData?.detail ||
          responseData?.error ||
          "You do not have permission to update this job.";

        throw new Error(`403 Forbidden: ${message}`);
      }

      if (!response.ok) {
        const message =
          responseData?.detail ||
          responseData?.error ||
          `Server returned HTTP ${response.status}.`;

        throw new Error(message);
      }

      alert("Job updated successfully!");

      resetForm();

      await fetchJobs();
    } catch (error) {
      console.error("UPDATE JOB ERROR:", error);

      setError(error.message);

      alert(error.message);
    }
  };

  const handleDeleteJob = async (jobId, jobTitle) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${jobTitle}"?`
    );

    if (!confirmed) {
      return;
    }

    const data = getUserData();

    if (!data) return;

    const { token } = data;

    try {
      setError("");

      const response = await fetch(
        `http://127.0.0.1:8000/api/jobs/${jobId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const responseText = await response.text();

      console.log(
        "DELETE JOB HTTP STATUS:",
        response.status
      );

      console.log(
        "DELETE JOB SERVER RESPONSE:",
        responseText
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");

        return;
      }

      if (response.status === 403) {
        throw new Error(
          "403 Forbidden: You do not have permission to delete this job."
        );
      }

      if (!response.ok) {
        let responseData = null;

        try {
          responseData = JSON.parse(responseText);
        } catch (parseError) {
          console.warn(
            "Delete response was not JSON.",
            parseError
          );
        }

        const message =
          responseData?.detail ||
          responseData?.error ||
          `Server returned HTTP ${response.status}.`;

        throw new Error(message);
      }

      alert("Job deleted successfully!");

      await fetchJobs();
    } catch (error) {
      console.error("DELETE JOB ERROR:", error);

      setError(error.message);

      alert(error.message);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-card">
          <h2>Loading Your Jobs...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">

      <div className="dashboard-header">

        <div>
          <h1>My Jobs</h1>

          <p>
            Create and manage your job postings.
          </p>
        </div>

        <div>

          <button
            className="status-button"
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
              }
            }}
          >
            {showForm
              ? "Close Form"
              : "+ Create Job"}
          </button>

          <button
            className="logout-button"
            onClick={() =>
              navigate("/recruiter-dashboard")
            }
          >
            Back to Dashboard
          </button>

        </div>

      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {showForm && (
        <div className="dashboard-section">

          <h2>
            {editingJobId
              ? "Edit Job"
              : "Create New Job"}
          </h2>

          <form
            onSubmit={
              editingJobId
                ? handleUpdateJob
                : handleCreateJob
            }
            className="job-form"
          >

            <div className="form-group">

              <label>
                Job Title
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Example: Python Developer"
                required
              />

            </div>

            <div className="form-group">

              <label>
                Job Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter job description"
                rows="5"
                required
              />

            </div>

            <div className="form-group">

              <label>
                Location
              </label>

              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Example: Hyderabad"
                required
              />

            </div>

            <div className="form-group">

              <label>
                Job Type
              </label>

              <select
                name="job_type"
                value={formData.job_type}
                onChange={handleChange}
              >

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

            <div className="form-group">

              <label>
                Salary
              </label>

              <input
                type="text"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="Example: ₹4 - ₹6 LPA"
              />

            </div>

            <div className="form-group">

              <label>
                Required Skills
              </label>

              <textarea
                name="required_skills"
                value={formData.required_skills}
                onChange={handleChange}
                placeholder="Example: Python, Django, SQL, Git"
                rows="3"
                required
              />

            </div>

            <div className="form-group">

              <label>
                Required Experience (Years)
              </label>

              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                min="0"
              />

            </div>

            <button
              type="submit"
              className="status-button selected-button"
            >
              {editingJobId
                ? "Update Job"
                : "Create Job"}
            </button>

            {editingJobId && (
              <button
                type="button"
                className="logout-button"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}

          </form>

        </div>
      )}

      <div className="dashboard-section">

        <h2>
          Your Job Postings
        </h2>

        {jobs.length === 0 ? (

          <div className="empty-state">

            <p>
              You haven't created any jobs yet.
            </p>

          </div>

        ) : (

          <div className="applications-list">

            {jobs.map((job) => (

              <div
                className="application-card"
                key={job.id}
              >

                <div className="application-header">

                  <div>

                    <h3>
                      {job.title}
                    </h3>

                    <p>
                      {job.location}
                    </p>

                  </div>

                  <span className="status-badge">
                    {job.job_type}
                  </span>

                </div>

                <div className="application-info">

                  <span>
                    <strong>
                      Salary:
                    </strong>{" "}
                    {job.salary ||
                      "Not specified"}
                  </span>

                  <span>
                    <strong>
                      Experience:
                    </strong>{" "}
                    {job.experience} years
                  </span>

                  <span>
                    <strong>
                      Skills:
                    </strong>{" "}
                    {job.required_skills}
                  </span>

                </div>

                <p>
                  {job.description}
                </p>

                <div
                  style={{
                    marginTop: "15px",
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >

                  <button
                    className="status-button"
                    onClick={() =>
                      handleEditClick(job)
                    }
                  >
                    Edit Job
                  </button>

                  <button
                    className="logout-button"
                    onClick={() =>
                      handleDeleteJob(
                        job.id,
                        job.title
                      )
                    }
                  >
                    Delete Job
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

      <footer className="dashboard-footer">

        <p>
          CareerBridge © 2026
        </p>

      </footer>

    </div>
  );
}

export default RecruiterJobs;