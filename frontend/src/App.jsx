import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CandidateDashboard from "./pages/CandidateDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import RecruiterJobs from "./pages/RecruiterJobs";
import AdminDashboard from "./pages/AdminDashboard";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import SavedJobs from "./pages/SavedJobs";
import AdminCandidates from "./pages/admin/AdminCandidates";
import AdminRecruiters from "./pages/admin/AdminRecruiters";
import AdminJobs from "./pages/admin/AdminJobs";
import AdminApplications from "./pages/admin/AdminApplications";

function Home() {
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

          <Link to="/login">
            Login
          </Link>

          <Link to="/register">
            Register
          </Link>

        </div>

      </nav>

      {/* Main Content */}

      <main className="dashboard-container">

        <section className="dashboard-welcome">

          <h1>
            Welcome to CareerBridge
          </h1>

          <p>
            Your platform for managing your career,
            finding jobs, and tracking applications.
          </p>

          <div style={{ marginTop: "25px" }}>

            <Link
              to="/jobs"
              className="primary-btn"
            >
              Explore Jobs
            </Link>

          </div>

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


function App() {

  return (
    <BrowserRouter>

      <Routes>

        {/* Home */}

        <Route
          path="/"
          element={<Home />}
        />

        {/* Authentication */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* Candidate Dashboard */}

        <Route
          path="/candidate-dashboard"
          element={<CandidateDashboard />}
        />

        {/* Recruiter Dashboard */}

        <Route
          path="/recruiter-dashboard"
          element={<RecruiterDashboard />}
        />

        {/* Recruiter Job Management */}

        <Route
          path="/recruiter-jobs"
          element={<RecruiterJobs />}
        />

        {/* Admin Dashboard */}

        <Route
          path="/admin-dashboard"
          element={<AdminDashboard />}
        />

        {/* Jobs */}

        <Route
          path="/jobs"
          element={<Jobs />}
        />

        {/* Job Details */}

        <Route
          path="/jobs/:id"
          element={<JobDetails />}
        />

        {/* Saved Jobs */}

        <Route
          path="/saved-jobs"
          element={<SavedJobs />}
        />

        <Route
          path="/admin-dashboard/candidates"
          element={<AdminCandidates />}
        />

        <Route
          path="/admin-dashboard/recruiters"
          element={<AdminRecruiters />}
        />

        <Route
          path="/admin-dashboard/jobs"
          element={<AdminJobs />}
        />

        <Route
          path="/admin-dashboard/applications"
          element={<AdminApplications />}
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;