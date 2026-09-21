import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function RecruiterDashboard() {
  const navigate = useNavigate();

  // =========================================================
  // APPLICANTS
  // =========================================================

  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  // =========================================================
  // JOBS
  // =========================================================

  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [jobSaving, setJobSaving] = useState(false);

  // =========================================================
  // JOB FORM
  // =========================================================

  const [jobForm, setJobForm] = useState({
    title: "",
    description: "",
    what_youll_be_doing: "",
    what_were_looking_for: "",
    education: "",
    key_skills: "",
    location: "",
    job_type: "Full Time",
    salary: "",
    experience: 0,
    shift: "Day Shift",
    shift_timing: "",
    cab_available: false,
    work_mode: "Work From Office",
    vacancies: 1,
  });

  // =========================================================
  // GET USER DATA
  // =========================================================

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

      return {
        token,
        user,
      };
    } catch (error) {
      console.error("USER DATA ERROR:", error);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/login");

      return null;
    }
  };

  // =========================================================
  // FORMAT BULLET TEXT
  // =========================================================
  // Converts recruiter-entered text into proper separate
  // bullet lines before saving to the database.
  // =========================================================

  const formatBulletText = (text) => {
    if (!text) {
      return "";
    }

    let formattedText = text.replace(/\r\n/g, "\n");

    const lines = formattedText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      return "";
    }

    // If the recruiter entered everything in one line,
    // split it using known section labels.
    if (lines.length === 1) {
      let result = lines[0];

      const bulletLabels = [
        "Building User Interfaces:",
        "API Integration:",
        "Core Stack Proficiency:",
        "Framework Experience:",
        "State Management:",
        "Responsive & UI Styling:",
        "Version Control:",
      ];

      bulletLabels.forEach((label) => {
        const escapedLabel = label.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );

        result = result.replace(
          new RegExp(`\\s+(?=${escapedLabel})`, "g"),
          "\n- "
        );
      });

      if (!result.startsWith("- ")) {
        result = `- ${result}`;
      }

      return result;
    }

    // If recruiter already entered separate lines,
    // make sure every line starts with "- ".
    return lines
      .map((line) => {
        if (line.startsWith("- ")) {
          return line;
        }

        return `- ${line}`;
      })
      .join("\n");
  };

  // =========================================================
  // FETCH APPLICANTS
  // =========================================================

  const fetchApplicants = async () => {
    const data = getUserData();

    if (!data) {
      return;
    }

    const { token, user } = data;

    const recruiterId = user.recruiter_id;

    if (!recruiterId) {
      setError("Recruiter profile ID was not found.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `http://127.0.0.1:8000/api/recruiter-applicants/${recruiterId}/`,
        {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const responseText = await response.text();

      let responseData = null;

      try {
        responseData = JSON.parse(responseText);
      } catch (error) {
        console.warn("Applicants response is not JSON.");
      }

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");

        return;
      }

      if (!response.ok) {
        throw new Error(
          responseData?.detail ||
            responseData?.error ||
            `Server returned HTTP ${response.status}.`
        );
      }

      setApplicants(
        Array.isArray(responseData)
          ? responseData
          : responseData?.results || []
      );
    } catch (error) {
      console.error("FETCH APPLICANTS ERROR:", error);

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH JOBS
  // =========================================================

  const fetchJobs = async () => {
    const data = getUserData();

    if (!data) {
      return;
    }

    const { token } = data;

    try {
      setJobsLoading(true);

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

      let responseData = null;

      try {
        responseData = JSON.parse(responseText);
      } catch (error) {
        console.warn("Jobs response is not JSON.");
      }

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");

        return;
      }

      if (!response.ok) {
        throw new Error(
          responseData?.detail ||
            responseData?.error ||
            `Server returned HTTP ${response.status}.`
        );
      }

      if (Array.isArray(responseData)) {
        setJobs(responseData);
      } else {
        setJobs(responseData?.results || []);
      }
    } catch (error) {
      console.error("FETCH JOBS ERROR:", error);

      setError(error.message);
    } finally {
      setJobsLoading(false);
    }
  };

  // =========================================================
  // UPDATE APPLICATION STATUS
  // =========================================================

  const updateStatus = async (
    applicationId,
    newStatus
  ) => {
    if (!applicationId) {
      alert("Application ID is missing.");
      return;
    }

    const data = getUserData();

    if (!data) {
      return;
    }

    const { token } = data;

    try {
      setUpdatingId(applicationId);
      setError("");

      const response = await fetch(
        `http://127.0.0.1:8000/api/application-status/${applicationId}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const responseText = await response.text();

      let responseData = null;

      try {
        responseData = JSON.parse(responseText);
      } catch (error) {
        console.warn("Status response is not JSON.");
      }

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");

        return;
      }

      if (!response.ok) {
        throw new Error(
          responseData?.detail ||
            responseData?.error ||
            `Server returned HTTP ${response.status}.`
        );
      }

      await fetchApplicants();

      alert(
        `Application status updated to ${newStatus}.`
      );
    } catch (error) {
      console.error(
        "STATUS UPDATE ERROR:",
        error
      );

      setError(error.message);

      alert(error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // =========================================================
  // HANDLE JOB FORM CHANGE
  // =========================================================

  const handleJobChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setJobForm((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // =========================================================
  // RESET JOB FORM
  // =========================================================

  const resetJobForm = () => {
    setJobForm({
      title: "",
      description: "",
      what_youll_be_doing: "",
      what_were_looking_for: "",
      education: "",
      key_skills: "",
      location: "",
      job_type: "Full Time",
      salary: "",
      experience: 0,
      shift: "Day Shift",
      shift_timing: "",
      cab_available: false,
      work_mode: "Work From Office",
      vacancies: 1,
    });

    setEditingJobId(null);
    setShowJobForm(false);
  };

  // =========================================================
  // CREATE JOB
  // =========================================================

  const createJob = async () => {
    const data = getUserData();

    if (!data) {
      return;
    }

    const { token } = data;

    try {
      setJobSaving(true);
      setError("");

      const jobData = {
        title: jobForm.title,

        description:
          jobForm.description,

        // IMPORTANT:
        // Save separate bullet lines
        what_youll_be_doing:
          formatBulletText(
            jobForm.what_youll_be_doing
          ),

        // IMPORTANT:
        // Save separate bullet lines
        what_were_looking_for:
          formatBulletText(
            jobForm.what_were_looking_for
          ),

        education:
          jobForm.education,

        key_skills:
          jobForm.key_skills,

        required_skills:
          jobForm.key_skills,

        location:
          jobForm.location,

        job_type:
          jobForm.job_type,

        salary:
          jobForm.salary,

        experience:
          Number(jobForm.experience),

        shift:
          jobForm.shift,

        shift_timing:
          jobForm.shift_timing,

        cab_available:
          jobForm.cab_available,

        work_mode:
          jobForm.work_mode,

        vacancies:
          Number(jobForm.vacancies),
      };

      const response = await fetch(
        "http://127.0.0.1:8000/api/jobs/",
        {
          method: "POST",

          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify(jobData),
        }
      );

      const responseText =
        await response.text();

      let responseData = null;

      try {
        responseData =
          JSON.parse(responseText);
      } catch (error) {
        console.warn(
          "Create job response is not JSON."
        );
      }

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");

        return;
      }

      if (!response.ok) {
        throw new Error(
          responseData?.detail ||
            responseData?.error ||
            JSON.stringify(responseData) ||
            `Server returned HTTP ${response.status}.`
        );
      }

      alert(
        "Job created successfully."
      );

      resetJobForm();

      await fetchJobs();
    } catch (error) {
      console.error(
        "CREATE JOB ERROR:",
        error
      );

      setError(error.message);

      alert(error.message);
    } finally {
      setJobSaving(false);
    }
  };

  // =========================================================
  // START EDIT JOB
  // =========================================================

  const startEditJob = (job) => {
    setEditingJobId(job.id);

    setJobForm({
      title: job.title || "",

      description:
        job.description || "",

      what_youll_be_doing:
        job.what_youll_be_doing || "",

      what_were_looking_for:
        job.what_were_looking_for || "",

      education:
        job.education || "",

      key_skills:
        job.key_skills || "",

      location:
        job.location || "",

      job_type:
        job.job_type || "Full Time",

      salary:
        job.salary || "",

      experience:
        job.experience ?? 0,

      shift:
        job.shift || "Day Shift",

      shift_timing:
        job.shift_timing || "",

      cab_available:
        Boolean(job.cab_available),

      work_mode:
        job.work_mode ||
        "Work From Office",

      vacancies:
        job.vacancies ?? 1,
    });

    setShowJobForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // UPDATE JOB
  // =========================================================

  const updateJob = async () => {
    const data = getUserData();

    if (!data) {
      return;
    }

    const { token } = data;

    try {
      setJobSaving(true);
      setError("");

      const jobData = {
        title:
          jobForm.title,

        description:
          jobForm.description,

        // IMPORTANT:
        // Format bullets before updating
        what_youll_be_doing:
          formatBulletText(
            jobForm.what_youll_be_doing
          ),

        // IMPORTANT:
        // Format bullets before updating
        what_were_looking_for:
          formatBulletText(
            jobForm.what_were_looking_for
          ),

        education:
          jobForm.education,

        key_skills:
          jobForm.key_skills,

        required_skills:
          jobForm.key_skills,

        location:
          jobForm.location,

        job_type:
          jobForm.job_type,

        salary:
          jobForm.salary,

        experience:
          Number(jobForm.experience),

        shift:
          jobForm.shift,

        shift_timing:
          jobForm.shift_timing,

        cab_available:
          jobForm.cab_available,

        work_mode:
          jobForm.work_mode,

        vacancies:
          Number(jobForm.vacancies),
      };

      const response = await fetch(
        `http://127.0.0.1:8000/api/jobs/${editingJobId}/`,
        {
          method: "PATCH",

          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify(jobData),
        }
      );

      const responseText =
        await response.text();

      let responseData = null;

      try {
        responseData =
          JSON.parse(responseText);
      } catch (error) {
        console.warn(
          "Update job response is not JSON."
        );
      }

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");

        return;
      }

      if (!response.ok) {
        throw new Error(
          responseData?.detail ||
            responseData?.error ||
            JSON.stringify(responseData) ||
            `Server returned HTTP ${response.status}.`
        );
      }

      alert(
        "Job updated successfully."
      );

      resetJobForm();

      await fetchJobs();
    } catch (error) {
      console.error(
        "UPDATE JOB ERROR:",
        error
      );

      setError(error.message);

      alert(error.message);
    } finally {
      setJobSaving(false);
    }
  };

  // =========================================================
  // SAVE JOB
  // =========================================================

  const handleSaveJob = async (event) => {
    event.preventDefault();

    if (!jobForm.title.trim()) {
      alert("Please enter Job Title.");
      return;
    }

    if (!jobForm.description.trim()) {
      alert(
        "Please enter Job Description."
      );
      return;
    }

    if (!jobForm.location.trim()) {
      alert("Please enter Job Location.");
      return;
    }

    if (!jobForm.key_skills.trim()) {
      alert("Please enter Key Skills.");
      return;
    }

    if (editingJobId) {
      await updateJob();
    } else {
      await createJob();
    }
  };

  // =========================================================
  // DELETE JOB
  // =========================================================

  const deleteJob = async (jobId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmed) {
      return;
    }

    const data = getUserData();

    if (!data) {
      return;
    }

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

      const responseText =
        await response.text();

      let responseData = null;

      try {
        responseData =
          JSON.parse(responseText);
      } catch (error) {
        // DELETE normally returns an empty response.
      }

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");

        return;
      }

      if (!response.ok) {
        throw new Error(
          responseData?.detail ||
            responseData?.error ||
            `Server returned HTTP ${response.status}.`
        );
      }

      alert(
        "Job deleted successfully."
      );

      await fetchJobs();
    } catch (error) {
      console.error(
        "DELETE JOB ERROR:",
        error
      );

      setError(error.message);

      alert(error.message);
    }
  };

  // =========================================================
  // VIEW RESUME
  // =========================================================

  const viewResume = (resumeFile) => {
    if (!resumeFile) {
      alert("Resume not available.");
      return;
    }

    const resumeUrl =
      resumeFile.startsWith("http")
        ? resumeFile
        : `http://127.0.0.1:8000${resumeFile}`;

    window.open(
      resumeUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    fetchApplicants();
    fetchJobs();
  }, []);

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalApplicants =
    applicants.length;

  const appliedCount =
    applicants.filter(
      (application) =>
        application.status === "Applied"
    ).length;

  const shortlistedCount =
    applicants.filter(
      (application) =>
        application.status ===
        "Shortlisted"
    ).length;

  const selectedCount =
    applicants.filter(
      (application) =>
        application.status === "Selected"
    ).length;

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-card">
          <h2>
            Loading Recruiter Dashboard...
          </h2>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="dashboard-container">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="dashboard-header">

        <div>
          <h1>
            Welcome, Recruiter!
          </h1>

          <p>
            Manage your jobs, applicants and
            application statuses.
          </p>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="dashboard-stats">

        <div className="stat-card">
          <h3>
            Total Applicants
          </h3>

          <p>
            {totalApplicants}
          </p>
        </div>

        <div className="stat-card">
          <h3>
            Applied
          </h3>

          <p>
            {appliedCount}
          </p>
        </div>

        <div className="stat-card">
          <h3>
            Shortlisted
          </h3>

          <p>
            {shortlistedCount}
          </p>
        </div>

        <div className="stat-card">
          <h3>
            Selected
          </h3>

          <p>
            {selectedCount}
          </p>
        </div>

      </div>

      {/* =====================================================
          MY JOBS
      ===================================================== */}

      <div className="dashboard-section">

        <div className="section-header">

          <div>
            <h2>
              My Jobs
            </h2>

            <p className="section-subtitle">
              Manage the jobs posted by you.
            </p>
          </div>

          <button
            className="create-job-button"
            onClick={() => {
              if (showJobForm) {
                resetJobForm();
              } else {
                setEditingJobId(null);
                setShowJobForm(true);
              }
            }}
          >
            {showJobForm
              ? "Cancel"
              : "+ Create New Job"}
          </button>

        </div>

        {/* ===================================================
            JOB FORM
        =================================================== */}

        {showJobForm && (

          <form
            onSubmit={handleSaveJob}
            className="job-form"
          >

            <h3>
              {editingJobId
                ? "Edit Job"
                : "Create New Job"}
            </h3>

            <div className="job-form-grid">

              {/* JOB TITLE */}

              <div className="form-group">

                <label>
                  Job Title *
                </label>

                <input
                  type="text"
                  name="title"
                  value={jobForm.title}
                  onChange={handleJobChange}
                  placeholder="Full Stack Python Developer"
                />

              </div>

              {/* LOCATION */}

              <div className="form-group">

                <label>
                  Location *
                </label>

                <input
                  type="text"
                  name="location"
                  value={jobForm.location}
                  onChange={handleJobChange}
                  placeholder="Hyderabad"
                />

              </div>

              {/* JOB TYPE */}

              <div className="form-group">

                <label>
                  Job Type
                </label>

                <select
                  name="job_type"
                  value={jobForm.job_type}
                  onChange={handleJobChange}
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

              {/* SALARY */}

              <div className="form-group">

                <label>
                  Salary
                </label>

                <input
                  type="text"
                  name="salary"
                  value={jobForm.salary}
                  onChange={handleJobChange}
                  placeholder="₹5 LPA - ₹8 LPA"
                />

              </div>

              {/* EXPERIENCE */}

              <div className="form-group">

                <label>
                  Experience
                </label>

                <input
                  type="number"
                  name="experience"
                  min="0"
                  value={jobForm.experience}
                  onChange={handleJobChange}
                />

              </div>

              {/* VACANCIES */}

              <div className="form-group">

                <label>
                  Vacancies
                </label>

                <input
                  type="number"
                  name="vacancies"
                  min="1"
                  value={jobForm.vacancies}
                  onChange={handleJobChange}
                />

              </div>

              {/* WORK MODE */}

              <div className="form-group">

                <label>
                  Work Mode
                </label>

                <select
                  name="work_mode"
                  value={jobForm.work_mode}
                  onChange={handleJobChange}
                >
                  <option value="Work From Office">
                    Work From Office
                  </option>

                  <option value="Hybrid">
                    Hybrid
                  </option>

                  <option value="Remote">
                    Remote
                  </option>
                </select>

              </div>

              {/* SHIFT */}

              <div className="form-group">

                <label>
                  Shift
                </label>

                <select
                  name="shift"
                  value={jobForm.shift}
                  onChange={handleJobChange}
                >
                  <option value="Day Shift">
                    Day Shift
                  </option>

                  <option value="Night Shift">
                    Night Shift
                  </option>

                  <option value="Rotational Shift">
                    Rotational Shift
                  </option>

                  <option value="Flexible Shift">
                    Flexible Shift
                  </option>
                </select>

              </div>

              {/* SHIFT TIMING */}

              <div className="form-group">

                <label>
                  Shift Timing
                </label>

                <input
                  type="text"
                  name="shift_timing"
                  value={jobForm.shift_timing}
                  onChange={handleJobChange}
                  placeholder="9:00 AM - 6:00 PM"
                />

              </div>

              {/* EDUCATION */}

              <div className="form-group">

                <label>
                  Education
                </label>

                <input
                  type="text"
                  name="education"
                  value={jobForm.education}
                  onChange={handleJobChange}
                  placeholder="B.Tech / B.E / MCA"
                />

              </div>

              {/* KEY SKILLS */}

              <div className="form-group">

                <label>
                  Key Skills *
                </label>

                <input
                  type="text"
                  name="key_skills"
                  value={jobForm.key_skills}
                  onChange={handleJobChange}
                  placeholder="Python, Django, SQL, React, Git"
                />

              </div>

              {/* DESCRIPTION */}

              <div className="form-group full-width">

                <label>
                  Description *
                </label>

                <textarea
                  name="description"
                  value={jobForm.description}
                  onChange={handleJobChange}
                  rows="4"
                  placeholder="Enter job description"
                />

              </div>

              {/* WHAT YOU'LL BE DOING */}

              <div className="form-group full-width">

                <label>
                  What You'll Be Doing
                </label>

                <textarea
                  name="what_youll_be_doing"
                  value={
                    jobForm.what_youll_be_doing
                  }
                  onChange={handleJobChange}
                  rows="8"
                  placeholder={`Enter each responsibility on a new line.

Example:
- Writing Clean Code: Develop reusable and maintainable code.
- Building User Interfaces: Translate designs into web pages.
- API Integration: Connect the frontend with backend APIs.`}
                />

              </div>

              {/* WHAT WE'RE LOOKING FOR */}

              <div className="form-group full-width">

                <label>
                  What We're Looking For
                </label>

                <textarea
                  name="what_were_looking_for"
                  value={
                    jobForm.what_were_looking_for
                  }
                  onChange={handleJobChange}
                  rows="9"
                  placeholder={`Enter each requirement on a new line.

Example:
- Core Stack Proficiency: Strong knowledge of HTML, CSS and JavaScript.
- Framework Experience: Knowledge of React or Angular.
- State Management: Familiarity with Redux or Zustand.
- Responsive & UI Styling: Experience with Tailwind CSS or Bootstrap.
- Version Control: Proficiency with Git and GitHub.
- API Integration: Experience with REST APIs.`}
                />

              </div>

              {/* CAB */}

              <div className="form-checkbox">

                <label>

                  <input
                    type="checkbox"
                    name="cab_available"
                    checked={
                      jobForm.cab_available
                    }
                    onChange={handleJobChange}
                  />

                  Cab Facility Available

                </label>

              </div>

            </div>

            {/* FORM BUTTONS */}

            <div className="job-form-actions">

              <button
                type="submit"
                className="save-job-button"
                disabled={jobSaving}
              >
                {jobSaving
                  ? "Saving..."
                  : editingJobId
                  ? "Update Job"
                  : "Create Job"}
              </button>

              <button
                type="button"
                className="cancel-job-button"
                onClick={resetJobForm}
                disabled={jobSaving}
              >
                Cancel
              </button>

            </div>

          </form>

        )}

        {/* ===================================================
            JOB TABLE
        =================================================== */}

        {jobsLoading ? (

          <div className="empty-state">

            <p>
              Loading jobs...
            </p>

          </div>

        ) : jobs.length === 0 ? (

          <div className="empty-state">

            <p>
              You have not created any jobs yet.
            </p>

          </div>

        ) : (

          <div className="table-container">

            <table className="dashboard-table">

              <thead>

                <tr>

                  <th>
                    Job Title
                  </th>

                  <th>
                    Location
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Salary
                  </th>

                  <th>
                    Experience
                  </th>

                  <th>
                    Work Mode
                  </th>

                  <th>
                    Shift
                  </th>

                  <th>
                    Vacancies
                  </th>

                  <th>
                    Key Skills
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {jobs.map((job) => (

                  <tr key={job.id}>

                    <td className="job-title-cell">
                      {job.title}
                    </td>

                    <td>
                      {job.location || "N/A"}
                    </td>

                    <td>
                      {job.job_type || "N/A"}
                    </td>

                    <td>
                      {job.salary || "N/A"}
                    </td>

                    <td>
                      {job.experience ?? 0} years
                    </td>

                    <td>
                      {job.work_mode || "N/A"}
                    </td>

                    <td>
                      {job.shift || "N/A"}
                    </td>

                    <td>
                      {job.vacancies ?? 0}
                    </td>

                    <td className="skills-cell">
                      {job.key_skills ||
                        job.required_skills ||
                        "N/A"}
                    </td>

                    <td>

                      <div className="table-actions">

                        <button
                          className="edit-button"
                          onClick={() =>
                            startEditJob(job)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="delete-button"
                          onClick={() =>
                            deleteJob(job.id)
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* =====================================================
          APPLICANTS
      ===================================================== */}

      <div className="dashboard-section">

        <div className="section-header">

          <div>

            <h2>
              Applicants
            </h2>

            <p className="section-subtitle">
              Manage candidates who applied to your jobs.
            </p>

          </div>

        </div>

        {applicants.length === 0 ? (

          <div className="empty-state">

            <p>
              No applicants found.
            </p>

          </div>

        ) : (

          <div className="table-container">

            <table className="dashboard-table applicants-table">

              <thead>

                <tr>

                  <th>
                    Candidate
                  </th>

                  <th>
                    Job
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Phone
                  </th>

                  <th>
                    Location
                  </th>

                  <th>
                    Experience
                  </th>

                  <th>
                    Applied Date
                  </th>

                  <th>
                    Resume
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Update Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {applicants.map(
                  (application) => (

                    <tr
                      key={
                        application.application_id
                      }
                    >

                      <td className="candidate-name-cell">

                        {application.candidate
                          ?.name ||
                          "Candidate"}

                      </td>

                      <td>

                        {application.job
                          ?.title ||
                          "Job"}

                      </td>

                      <td>

                        {application.candidate
                          ?.email ||
                          "N/A"}

                      </td>

                      <td>

                        {application.candidate
                          ?.phone ||
                          "N/A"}

                      </td>

                      <td>

                        {application.candidate
                          ?.location ||
                          "N/A"}

                      </td>

                      <td>

                        {application.candidate
                          ?.experience ??
                          0} years

                      </td>

                      <td>

                        {application.applied_date
                          ? new Date(
                              application.applied_date
                            ).toLocaleDateString()
                          : "N/A"}

                      </td>

                      <td>

                        {application.candidate?.resume?.file ? (

                          <button
                            className="view-resume-button"
                            onClick={() =>
                              viewResume(
                                application
                                  .candidate
                                  .resume
                                  .file
                              )
                            }
                          >
                            View Resume
                          </button>

                        ) : (

                          <span>
                            No Resume
                          </span>

                        )}

                      </td>

                      <td>

                        <span
                          className={`status-badge ${
                            application.status
                              ?.toLowerCase()
                              .replace(
                                /\s+/g,
                                "-"
                              ) || ""
                          }`}
                        >
                          {application.status ||
                            "N/A"}
                        </span>

                      </td>

                      <td>

                        <div className="status-table-actions">

                          <button
                            className="status-action applied"
                            disabled={
                              updatingId ===
                              application.application_id
                            }
                            onClick={() =>
                              updateStatus(
                                application.application_id,
                                "Applied"
                              )
                            }
                          >
                            Applied
                          </button>

                          <button
                            className="status-action shortlisted"
                            disabled={
                              updatingId ===
                              application.application_id
                            }
                            onClick={() =>
                              updateStatus(
                                application.application_id,
                                "Shortlisted"
                              )
                            }
                          >
                            Shortlisted
                          </button>

                          <button
                            className="status-action selected"
                            disabled={
                              updatingId ===
                              application.application_id
                            }
                            onClick={() =>
                              updateStatus(
                                application.application_id,
                                "Selected"
                              )
                            }
                          >
                            Selected
                          </button>

                          <button
                            className="status-action rejected"
                            disabled={
                              updatingId ===
                              application.application_id
                            }
                            onClick={() =>
                              updateStatus(
                                application.application_id,
                                "Rejected"
                              )
                            }
                          >
                            Rejected
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="dashboard-footer">

        <p>
          CareerBridge © 2026
        </p>

      </footer>

    </div>
  );
}

export default RecruiterDashboard;