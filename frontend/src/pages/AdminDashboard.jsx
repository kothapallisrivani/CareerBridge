import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

    // ==========================================
    // ADMIN DASHBOARD
    // ==========================================

    fetch(
      "http://127.0.0.1:8000/api/accounts/admin-dashboard/",
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
            data.detail ||
              "Unable to load admin dashboard."
          );
        }

        return data;
      })
      .then((data) => {
        console.log(
          "ADMIN DASHBOARD RESPONSE:",
          data
        );

        setDashboardData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(
          "ADMIN DASHBOARD ERROR:",
          error
        );

        setError(error.message);
        setLoading(false);
      });
  }, [navigate]);

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // ==========================================
  // LOADING
  // ==========================================

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

            <h1>
              Loading Admin Dashboard...
            </h1>

          </section>

        </main>

      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

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

            <h1>
              Admin Dashboard
            </h1>

            <p
              style={{
                color: "red",
              }}
            >
              {error}
            </p>

          </section>

        </main>

      </div>
    );
  }

  // ==========================================
  // MAIN DASHBOARD
  // ==========================================

  return (
    <div className="dashboard-page">

      {/* ========================================
          NAVBAR
      ======================================== */}

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

      {/* ========================================
          MAIN CONTENT
      ======================================== */}

      <main className="dashboard-container">

        {/* ======================================
            WELCOME
        ====================================== */}

        <section className="dashboard-welcome">

          <h1>
            Welcome to Admin Dashboard
          </h1>

          <p>
            Manage candidates, recruiters, jobs,
            applications, and CareerBridge activities.
          </p>

        </section>

        {/* ======================================
            STATISTICS
        ====================================== */}

        {dashboardData && (

          <section
            style={{
              marginTop: "30px",
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
            }}
          >

            {/* CANDIDATES */}

            <Link
              to="/admin-dashboard/candidates"
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
            >

              <div className="dashboard-card">

                <h3>
                  Total Candidates
                </h3>

                <h2>
                  {dashboardData.total_candidates ?? 0}
                </h2>

                <p
                  style={{
                    color: "#2563eb",
                    fontWeight: "600",
                  }}
                >
                  View Candidates →
                </p>

              </div>

            </Link>

            {/* RECRUITERS */}

            <Link
              to="/admin-dashboard/recruiters"
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
            >

              <div className="dashboard-card">

                <h3>
                  Total Recruiters
                </h3>

                <h2>
                  {dashboardData.total_recruiters ?? 0}
                </h2>

                <p
                  style={{
                    color: "#2563eb",
                    fontWeight: "600",
                  }}
                >
                  View Recruiters →
                </p>

              </div>

            </Link>

            {/* JOBS */}

            <Link
              to="/admin-dashboard/jobs"
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
            >

              <div className="dashboard-card">

                <h3>
                  Total Jobs
                </h3>

                <h2>
                  {dashboardData.total_jobs ?? 0}
                </h2>

                <p
                  style={{
                    color: "#2563eb",
                    fontWeight: "600",
                  }}
                >
                  View Jobs →
                </p>

              </div>

            </Link>

            {/* APPLICATIONS */}

            <Link
              to="/admin-dashboard/applications"
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
            >

              <div className="dashboard-card">

                <h3>
                  Total Applications
                </h3>

                <h2>
                  {dashboardData.total_applications ?? 0}
                </h2>

                <p
                  style={{
                    color: "#2563eb",
                    fontWeight: "600",
                  }}
                >
                  View Applications →
                </p>

              </div>

            </Link>

          </section>

        )}

        {/* ======================================
            ADMIN MANAGEMENT
        ====================================== */}

        <section
          style={{
            marginTop: "40px",
          }}
        >

          <h2>
            Admin Management
          </h2>

          <p
            style={{
              color: "#666",
              marginBottom: "25px",
            }}
          >
            Select a section to view and manage
            CareerBridge data.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "20px",
            }}
          >

            {/* ==================================
                CANDIDATES
            ================================== */}

            <Link
              to="/admin-dashboard/candidates"
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
            >

              <div
                className="dashboard-card"
                style={{
                  cursor: "pointer",
                  height: "100%",
                }}
              >

                <h2>
                  👤 Candidates
                </h2>

                <p>
                  View all registered candidates.
                </p>

                <strong>
                  Total:{" "}
                  {dashboardData?.total_candidates ?? 0}
                </strong>

                <p
                  style={{
                    color: "#2563eb",
                    fontWeight: "600",
                    marginTop: "15px",
                  }}
                >
                  Manage Candidates →
                </p>

              </div>

            </Link>

            {/* ==================================
                RECRUITERS
            ================================== */}

            <Link
              to="/admin-dashboard/recruiters"
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
            >

              <div
                className="dashboard-card"
                style={{
                  cursor: "pointer",
                  height: "100%",
                }}
              >

                <h2>
                  🏢 Recruiters
                </h2>

                <p>
                  View all registered recruiters.
                </p>

                <strong>
                  Total:{" "}
                  {dashboardData?.total_recruiters ?? 0}
                </strong>

                <p
                  style={{
                    color: "#2563eb",
                    fontWeight: "600",
                    marginTop: "15px",
                  }}
                >
                  Manage Recruiters →
                </p>

              </div>

            </Link>

            {/* ==================================
                JOBS
            ================================== */}

            <Link
              to="/admin-dashboard/jobs"
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
            >

              <div
                className="dashboard-card"
                style={{
                  cursor: "pointer",
                  height: "100%",
                }}
              >

                <h2>
                  💼 Jobs
                </h2>

                <p>
                  View and manage all posted jobs.
                </p>

                <strong>
                  Total:{" "}
                  {dashboardData?.total_jobs ?? 0}
                </strong>

                <p
                  style={{
                    color: "#2563eb",
                    fontWeight: "600",
                    marginTop: "15px",
                  }}
                >
                  Manage Jobs →
                </p>

              </div>

            </Link>

            {/* ==================================
                APPLICATIONS
            ================================== */}

            <Link
              to="/admin-dashboard/applications"
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
            >

              <div
                className="dashboard-card"
                style={{
                  cursor: "pointer",
                  height: "100%",
                }}
              >

                <h2>
                  📄 Applications
                </h2>

                <p>
                  View and manage candidate
                  applications.
                </p>

                <strong>
                  Total:{" "}
                  {dashboardData?.total_applications ?? 0}
                </strong>

                <p
                  style={{
                    color: "#2563eb",
                    fontWeight: "600",
                    marginTop: "15px",
                  }}
                >
                  Manage Applications →
                </p>

              </div>

            </Link>

          </div>

        </section>

      </main>

      {/* ========================================
          FOOTER
      ======================================== */}

      <footer className="dashboard-footer">

        <p>
          © 2026 CareerBridge. All rights reserved.
        </p>

      </footer>

    </div>
  );
}

export default AdminDashboard;