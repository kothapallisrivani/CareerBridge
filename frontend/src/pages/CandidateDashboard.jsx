import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function CandidateDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [jobMatches, setJobMatches] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});

  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeMessage, setResumeMessage] = useState("");

  const token = localStorage.getItem("token");

  // ==================================================
  // GET JOB TITLE
  // ==================================================

  const getJobTitle = (jobId, jobObject = null) => {
    if (
      jobObject &&
      typeof jobObject === "object" &&
      jobObject.title
    ) {
      return jobObject.title;
    }

    const job = jobs.find(
      (item) => Number(item.id) === Number(jobId)
    );

    if (job) {
      return job.title;
    }

    return jobId ? `Job #${jobId}` : "Job";
  };

  // ==================================================
  // FETCH JOBS
  // ==================================================

  const fetchJobs = async () => {
    if (!token) {
      return [];
    }

    try {
      const response = await fetch(
        "https://careerbridge-4gzv.onrender.com/api/jobs/",
        {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();

      const jobList = Array.isArray(data)
        ? data
        : data.results || [];

      setJobs(jobList);

      return jobList;
    } catch (err) {
      console.error("Jobs fetch error:", err);
      return [];
    }
  };

  // ==================================================
  // FETCH DASHBOARD
  // ==================================================

  const fetchDashboard = async () => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      setLoading(true);
      setError("");

      await fetchJobs();

      const dashboardResponse = await fetch(
        "https://careerbridge-4gzv.onrender.com/api/candidates/dashboard/",
        {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const dashboardResult =
        await dashboardResponse.json();

      console.log(
        "Candidate dashboard:",
        dashboardResult
      );

      if (!dashboardResponse.ok) {
        setError(
          dashboardResult.detail ||
            dashboardResult.error ||
            "Unable to load dashboard."
        );

        setLoading(false);
        return;
      }

      setDashboardData(dashboardResult);

      // ==================================================
      // FETCH MATCHING JOBS
      // ==================================================

      const matchingResponse = await fetch(
        "https://careerbridge-4gzv.onrender.com/api/matching/match/",
        {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const matchingData =
        await matchingResponse.json();

      console.log(
        "Matching jobs:",
        matchingData
      );

      if (matchingResponse.ok) {
        setJobMatches(
          Array.isArray(matchingData)
            ? matchingData
            : matchingData.results || []
        );
      } else {
        setJobMatches([]);
      }

      setLoading(false);
    } catch (err) {
      console.error(
        "Candidate dashboard error:",
        err
      );

      setError(
        "Unable to connect to server. Make sure Django is running."
      );

      setLoading(false);
    }
  };

  // ==================================================
  // INITIAL LOAD
  // ==================================================

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ==================================================
  // PROFILE EDIT
  // ==================================================

  const handleEditProfile = () => {
    if (!dashboardData?.profile) {
      return;
    }

    setProfileForm({
      name: dashboardData.profile.name || "",
      email: dashboardData.profile.email || "",
      phone: dashboardData.profile.phone || "",
      skills: dashboardData.profile.skills || "",
      education:
        dashboardData.profile.education || "",
      experience:
        dashboardData.profile.experience || 0,
      location:
        dashboardData.profile.location || "",
    });

    setEditingProfile(true);
  };

  // ==================================================
  // PROFILE CHANGE
  // ==================================================

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==================================================
  // SAVE PROFILE
  // ==================================================

  const handleSaveProfile = async () => {
    if (!dashboardData?.profile?.id) {
      return;
    }

    try {
      const response = await fetch(
        `https://careerbridge-4gzv.onrender.com/api/candidates/${dashboardData.profile.id}/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: profileForm.name,
            email: profileForm.email,
            phone: profileForm.phone,
            skills: profileForm.skills,
            education: profileForm.education,
            experience: Number(
              profileForm.experience
            ),
            location: profileForm.location,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.detail ||
            data.error ||
            "Unable to update profile."
        );
        return;
      }

      setDashboardData((previous) => ({
        ...previous,
        profile: data,
      }));

      setEditingProfile(false);

      alert("Profile updated successfully!");
    } catch (err) {
      console.error(
        "Profile update error:",
        err
      );

      alert(
        "Unable to connect to server."
      );
    }
  };

  // ==================================================
  // RESUME UPLOAD
  // ==================================================

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    if (!dashboardData?.profile?.id) {
      setResumeMessage(
        "Candidate profile not found."
      );

      event.target.value = "";
      return;
    }

    if (file.type !== "application/pdf") {
      setResumeMessage(
        "Only PDF files are allowed."
      );

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setResumeMessage(
        "Resume file must be 5 MB or smaller."
      );

      event.target.value = "";
      return;
    }

    setUploadingResume(true);
    setResumeMessage("");

    try {
      const formData = new FormData();

      formData.append(
        "resume_file",
        file
      );

      const response = await fetch(
        "https://careerbridge-4gzv.onrender.com/api/resumes/",
        {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const errorMessage =
          data.detail ||
          data.error ||
          data.resume_file ||
          "Unable to upload resume.";

        setResumeMessage(
          Array.isArray(errorMessage)
            ? errorMessage.join(", ")
            : errorMessage
        );

        return;
      }

      setResumeMessage(
        "Resume uploaded successfully!"
      );

      await fetchDashboard();
    } catch (err) {
      console.error(
        "Resume upload error:",
        err
      );

      setResumeMessage(
        "Unable to connect to server."
      );
    } finally {
      setUploadingResume(false);
      event.target.value = "";
    }
  };

  // ==================================================
  // DELETE RESUME
  // ==================================================

  const handleDeleteResume = async (resumeId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this resume?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `https://careerbridge-4gzv.onrender.com/api/resumes/${resumeId}/`,
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
          data.detail ||
            data.error ||
            "Unable to delete resume."
        );

        return;
      }

      alert(
        "Resume deleted successfully!"
      );

      await fetchDashboard();
    } catch (err) {
      console.error(
        "Resume delete error:",
        err
      );

      alert(
        "Unable to connect to server."
      );
    }
  };

  // ==================================================
  // LOGOUT
  // ==================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <section className="dashboard-section">
            <h2>
              Loading Candidate Dashboard...
            </h2>
          </section>
        </div>
      </div>
    );
  }

  // ==================================================
  // ERROR
  // ==================================================

  if (error) {
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

            <Link to="/jobs">
              Jobs
            </Link>

            <Link to="/login">
              Login
            </Link>

          </div>

        </nav>

        <main className="dashboard-container">

          <section className="dashboard-section">

            <h2>
              Unable to Load Dashboard
            </h2>

            <p>{error}</p>

            <button
              className="primary-btn"
              onClick={fetchDashboard}
            >
              Try Again
            </button>

          </section>

        </main>

      </div>
    );
  }

  // ==================================================
  // DATA
  // ==================================================

  const profile = dashboardData?.profile;

  const resumes =
    dashboardData?.resumes || [];

  const applications =
    dashboardData?.applications || [];

  const statistics =
    dashboardData?.statistics || {};

  // ==================================================
  // RECOMMENDED JOB ORDER
  // ==================================================

  const recommendedJobOrder = {
    "Junior Python Full Stack Developer": 1,
    "Back-End Developer": 2,
    "Full Stack Python Developer": 3,
  };

  const getMatchJobTitle = (match) => {
    const jobId =
      typeof match.job === "object"
        ? match.job?.id
        : match.job || match.job_id;

    return (
      match.job_title ||
      (typeof match.job === "object"
        ? match.job?.title
        : null) ||
      match.job_details?.title ||
      getJobTitle(
        jobId,
        typeof match.job === "object"
          ? match.job
          : null
      )
    );
  };

  const sortedJobMatches = [...jobMatches].sort(
    (a, b) => {
      const titleA = getMatchJobTitle(a);
      const titleB = getMatchJobTitle(b);

      const orderA =
        recommendedJobOrder[titleA] || 999;

      const orderB =
        recommendedJobOrder[titleB] || 999;

      return orderA - orderB;
    }
  );

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="dashboard-page">

      {/* ==================================================
          NAVBAR
      ================================================== */}

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
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </nav>

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="dashboard-container">

        {/* ==================================================
            WELCOME
        ================================================== */}

        <section className="dashboard-welcome">

          <h1>
            Welcome,{" "}
            {profile?.name || "Candidate"}!
          </h1>

          <p>
            Manage your profile, resumes,
            applications, and job matches
            from your CareerBridge dashboard.
          </p>

        </section>

        {/* ==================================================
            STATISTICS
        ================================================== */}

        <section className="dashboard-stats">

          <div className="stat-card">

            <h3>
              Applications
            </h3>

            <p>
              {statistics.total_applications || 0}
            </p>

          </div>

          <div className="stat-card">

            <h3>
              Job Matches
            </h3>

            <p>
              {statistics.total_job_matches || 0}
            </p>

          </div>

          <div className="stat-card">

            <h3>
              Average Match
            </h3>

            <p>
              {statistics.average_match_score || 0}%
            </p>

          </div>

          <div className="stat-card">

            <h3>
              Resumes
            </h3>

            <p>
              {resumes.length}
            </p>

          </div>

        </section>

        {/* ==================================================
            1. MY PROFILE
        ================================================== */}

        <section className="dashboard-section">

          <div className="section-header">

            <h2>
              My Profile
            </h2>

            {!editingProfile && (
              <button
                className="secondary-btn"
                onClick={handleEditProfile}
              >
                Edit Profile
              </button>
            )}

          </div>

          {!editingProfile ? (

            <div className="profile-grid">

              <div>
                <strong>Name</strong>

                <p>
                  {profile?.name ||
                    "Not provided"}
                </p>
              </div>

              <div>
                <strong>Email</strong>

                <p>
                  {profile?.email ||
                    "Not provided"}
                </p>
              </div>

              <div>
                <strong>Phone</strong>

                <p>
                  {profile?.phone ||
                    "Not provided"}
                </p>
              </div>

              <div>
                <strong>Location</strong>

                <p>
                  {profile?.location ||
                    "Not provided"}
                </p>
              </div>

              <div>
                <strong>Education</strong>

                <p>
                  {profile?.education ||
                    "Not provided"}
                </p>
              </div>

              <div>
                <strong>Experience</strong>

                <p>
                  {profile?.experience || 0} years
                </p>
              </div>

              <div className="profile-full-width">

                <strong>Skills</strong>

                <p>
                  {profile?.skills ||
                    "Not provided"}
                </p>

              </div>

            </div>

          ) : (

            <div className="profile-edit-form">

              <div className="form-group">

                <label>
                  Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={profileForm.name || ""}
                  onChange={handleProfileChange}
                />

              </div>

              <div className="form-group">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={profileForm.email || ""}
                  onChange={handleProfileChange}
                />

              </div>

              <div className="form-group">

                <label>
                  Phone
                </label>

                <input
                  type="text"
                  name="phone"
                  value={profileForm.phone || ""}
                  onChange={handleProfileChange}
                />

              </div>

              <div className="form-group">

                <label>
                  Location
                </label>

                <input
                  type="text"
                  name="location"
                  value={profileForm.location || ""}
                  onChange={handleProfileChange}
                />

              </div>

              <div className="form-group">

                <label>
                  Education
                </label>

                <input
                  type="text"
                  name="education"
                  value={profileForm.education || ""}
                  onChange={handleProfileChange}
                />

              </div>

              <div className="form-group">

                <label>
                  Experience
                </label>

                <input
                  type="number"
                  name="experience"
                  min="0"
                  value={profileForm.experience || 0}
                  onChange={handleProfileChange}
                />

              </div>

              <div className="form-group profile-full-width">

                <label>
                  Skills
                </label>

                <textarea
                  name="skills"
                  value={profileForm.skills || ""}
                  onChange={handleProfileChange}
                  rows="4"
                />

              </div>

              <div className="profile-form-actions">

                <button
                  className="primary-btn"
                  onClick={handleSaveProfile}
                >
                  Save Changes
                </button>

                <button
                  className="secondary-btn"
                  onClick={() =>
                    setEditingProfile(false)
                  }
                >
                  Cancel
                </button>

              </div>

            </div>

          )}

        </section>

        {/* ==================================================
            2. MY RESUMES
        ================================================== */}

        <section className="dashboard-section">

          <div className="section-header">

            <h2>
              My Resumes
            </h2>

            <label className="primary-btn upload-btn">

              {uploadingResume
                ? "Uploading..."
                : "Upload Resume"}

              <input
                type="file"
                accept=".pdf"
                onChange={handleResumeUpload}
                disabled={uploadingResume}
                hidden
              />

            </label>

          </div>

          {resumeMessage && (
            <p className="application-message">
              {resumeMessage}
            </p>
          )}

          {resumes.length === 0 ? (

            <p>
              No resumes uploaded yet.
            </p>

          ) : (

            <div className="resume-list">

              {resumes.map((resume) => {

                const resumeUrl =
                  resume.resume_file
                    ? `https://careerbridge-4gzv.onrender.com${resume.resume_file}`
                    : "";

                const fallbackResumeName =
                  `${(profile?.name || "Candidate")
                    .trim()
                    .replace(/\s+/g, "")}_resume.pdf`;

                const resumeFileName =
                  resume.original_filename ||
                  fallbackResumeName;

                const uploadedDate =
                  resume.uploaded_date
                    ? new Date(
                        resume.uploaded_date
                      ).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : "-";

                return (
                  <div
                    className="resume-item"
                    key={resume.id}
                  >

                    <div className="resume-info">

                      <h3>

                        <span
                          aria-hidden="true"
                          style={{
                            marginRight: "8px",
                          }}
                        >
                          📄
                        </span>

                        {resumeFileName}

                      </h3>

                      <p>
                        Uploaded: {uploadedDate}
                      </p>

                    </div>

                    <div className="resume-actions">

                      {resumeUrl && (
                        <a
                          href={resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="secondary-btn"
                        >
                          View/Edit
                        </a>
                      )}

                      <button
                        type="button"
                        className="danger-btn"
                        onClick={() =>
                          handleDeleteResume(
                            resume.id
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </div>
                );
              })}

            </div>

          )}

        </section>

        {/* ==================================================
            3. CANDIDATE APPLICATIONS
        ================================================== */}

        <section className="dashboard-section">

          <div className="section-header">

            <h2>
              Candidate Applications
            </h2>

            <Link
              to="/jobs"
              className="secondary-btn"
            >
              Find More Jobs
            </Link>

          </div>

          {applications.length === 0 ? (

            <p>
              You have not applied to any jobs yet.
            </p>

          ) : (

            <div className="applications-list">

              {applications.map(
                (application) => {

                  const applicationJobId =
                    typeof application.job ===
                    "object"
                      ? application.job?.id
                      : application.job ||
                        application.job_id;

                  const applicationJobTitle =
                    application.job_title ||
                    (typeof application.job ===
                    "object"
                      ? application.job?.title
                      : null) ||
                    application.job_details?.title ||
                    getJobTitle(
                      applicationJobId,
                      typeof application.job ===
                      "object"
                        ? application.job
                        : null
                    );

                  return (

                    <div
                      className="application-card"
                      key={application.id}
                    >

                      <div className="application-header">

                        <h3>

                          {applicationJobId ? (

                            <Link
                              to={`/jobs/${applicationJobId}`}
                              className="job-title-link"
                            >
                              {applicationJobTitle}
                            </Link>

                          ) : (

                            applicationJobTitle

                          )}

                        </h3>

                        <span
                          className={`application-status ${
                            application.status
                              ? application.status.toLowerCase()
                              : ""
                          }`}
                        >
                          {application.status ||
                            "Applied"}
                        </span>

                      </div>

                      <div className="application-details">

                        <p>

                          <strong>
                            Application ID:
                          </strong>{" "}

                          {/* UPDATED:
                              Show candidate-specific
                              application number
                          */}

                          #{application.application_number}

                        </p>

                        {application.applied_date && (

                          <p>

                            <strong>
                              Applied On:
                            </strong>{" "}

                            {new Date(
                              application.applied_date
                            ).toLocaleDateString()}

                          </p>

                        )}

                      </div>

                      {applicationJobId && (

                        <div className="application-actions">

                          <Link
                            to={`/jobs/${applicationJobId}`}
                            className="secondary-btn"
                          >
                            View Job
                          </Link>

                        </div>

                      )}

                    </div>

                  );
                }
              )}

            </div>

          )}

        </section>

        {/* ==================================================
            4. RECOMMENDED JOB MATCHES
        ================================================== */}

        <section className="dashboard-section">

          <div className="section-header">

            <h2>
              Recommended Job Matches
            </h2>

            <Link
              to="/jobs"
              className="secondary-btn"
            >
              Browse All Jobs
            </Link>

          </div>

          {sortedJobMatches.length === 0 ? (

            <p>
              No matching jobs found.
            </p>

          ) : (

            <div className="job-match-list">

              {sortedJobMatches.map(
                (match, index) => {

                  const jobId =
                    typeof match.job ===
                    "object"
                      ? match.job?.id
                      : match.job ||
                        match.job_id;

                  const jobTitle =
                    match.job_title ||
                    (typeof match.job ===
                    "object"
                      ? match.job?.title
                      : null) ||
                    match.job_details?.title ||
                    getJobTitle(
                      jobId,
                      typeof match.job ===
                      "object"
                        ? match.job
                        : null
                    );

                  return (

                    <div
                      className="job-match-card"
                      key={
                        match.id ||
                        `${jobId}-${index}`
                      }
                    >

                      <div className="job-match-header">

                        <h3>

                          {jobId ? (

                            <Link
                              to={`/jobs/${jobId}`}
                              className="job-title-link"
                            >
                              {jobTitle}
                            </Link>

                          ) : (

                            jobTitle

                          )}

                        </h3>

                        <span className="match-score">

                          {match.match_score || 0}%

                        </span>

                      </div>

                      <div className="match-progress">

                        <div
                          className="match-progress-bar"
                          style={{
                            width: `${Math.min(
                              Number(
                                match.match_score || 0
                              ),
                              100
                            )}%`,
                          }}
                        />

                      </div>

                      {match.matched_skills && (

                        <div className="skills-section">

                          <strong>
                            Matched Skills:
                          </strong>

                          <div className="skill-tags">

                            {Array.isArray(
                              match.matched_skills
                            ) ? (

                              match.matched_skills.map(
                                (
                                  skill,
                                  skillIndex
                                ) => (

                                  <span
                                    className="skill-tag matched"
                                    key={skillIndex}
                                  >
                                    {skill}
                                  </span>

                                )
                              )

                            ) : (

                              <span>
                                {match.matched_skills}
                              </span>

                            )}

                          </div>

                        </div>

                      )}

                      {match.missing_skills && (

                        <div className="skills-section">

                          <strong>
                            Missing Skills:
                          </strong>

                          <div className="skill-tags">

                            {Array.isArray(
                              match.missing_skills
                            ) ? (

                              match.missing_skills.map(
                                (
                                  skill,
                                  skillIndex
                                ) => (

                                  <span
                                    className="skill-tag missing"
                                    key={skillIndex}
                                  >
                                    {skill}
                                  </span>

                                )
                              )

                            ) : (

                              <span>
                                {match.missing_skills}
                              </span>

                            )}

                          </div>

                        </div>

                      )}

                      <div className="job-match-footer">

                        <Link
                          to={`/jobs/${jobId}`}
                          className="primary-btn"
                        >
                          View Job Details
                        </Link>

                      </div>

                    </div>

                  );
                }
              )}

            </div>

          )}

        </section>

      </main>

      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer className="dashboard-footer">

        <p>
          © 2026 CareerBridge. All rights reserved.
        </p>

      </footer>

    </div>
  );
}

export default CandidateDashboard;