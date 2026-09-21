import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function AdminApplications() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedApplication, setSelectedApplication] =
    useState(null);

  // ==========================================
  // LOAD ADMIN APPLICATIONS
  // ==========================================

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
      "http://127.0.0.1:8000/api/accounts/admin-applications/",
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
              "Unable to load applications."
          );
        }

        return data;
      })
      .then((data) => {
        console.log(
          "ADMIN APPLICATIONS RESPONSE:",
          data
        );

        setApplications(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(
          "ADMIN APPLICATIONS ERROR:",
          error
        );

        setError(error.message);
        setLoading(false);
      });
  }, [navigate]);

  // ==========================================
  // GET DISPLAY APPLICATION ID
  // ==========================================
  // This is ONLY for displaying the application ID.
  // It does NOT change the real database ID.

  const getDisplayApplicationId = (application) => {
    const index = applications.findIndex(
      (item) => item.id === application.id
    );

    return index + 1;
  };

  // ==========================================
  // UPDATE APPLICATION STATUS
  // ==========================================

  const updateApplicationStatus = async (
    applicationId,
    newStatus
  ) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/accounts/admin-application-status/${applicationId}/`,
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.detail ||
            "Unable to update application status."
        );
      }

      // IMPORTANT:
      // application.id here is the REAL database ID.
      // We keep using it internally.

      setApplications((previousApplications) =>
        previousApplications.map((application) =>
          application.id === applicationId
            ? {
                ...application,
                status: data.status,
              }
            : application
        )
      );

      setSelectedApplication((previousApplication) =>
        previousApplication &&
        previousApplication.id === applicationId
          ? {
              ...previousApplication,
              status: data.status,
            }
          : previousApplication
      );
    } catch (error) {
      console.error(
        "APPLICATION STATUS ERROR:",
        error
      );

      alert(error.message);
    }
  };

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
            <h1>Loading Applications...</h1>
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
            <h1>Applications Management</h1>

            <p style={{ color: "red" }}>
              {error}
            </p>
          </section>
        </main>
      </div>
    );
  }

  // ==========================================
  // MAIN PAGE
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
            HEADER
        ====================================== */}

        <section className="dashboard-welcome">

          <h1>
            Applications Management
          </h1>

          <p>
            View and manage all candidate
            applications in CareerBridge.
          </p>

        </section>

        {/* ======================================
            TOTAL APPLICATIONS
        ====================================== */}

        <section
          style={{
            marginTop: "30px",
          }}
        >

          <div className="dashboard-card">

            <h3>
              Total Applications
            </h3>

            <h2>
              {applications.length}
            </h2>

          </div>

        </section>

        {/* ======================================
            APPLICATIONS TABLE
        ====================================== */}

        <section
          style={{
            marginTop: "30px",
          }}
        >

          <h2>
            All Applications
          </h2>

          {applications.length === 0 ? (

            <p>
              No applications found.
            </p>

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

                    <th
                      style={{
                        padding: "12px",
                        borderBottom:
                          "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      ID
                    </th>

                    <th
                      style={{
                        padding: "12px",
                        borderBottom:
                          "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      Candidate ID
                    </th>

                    <th
                      style={{
                        padding: "12px",
                        borderBottom:
                          "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      Job ID
                    </th>

                    <th
                      style={{
                        padding: "12px",
                        borderBottom:
                          "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      Status
                    </th>

                    <th
                      style={{
                        padding: "12px",
                        borderBottom:
                          "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      Applied Date
                    </th>

                    <th
                      style={{
                        padding: "12px",
                        borderBottom:
                          "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {applications.map(
                    (application, index) => (

                      <tr
                        key={application.id}
                      >

                        {/* =================================
                            DISPLAY-ONLY APPLICATION ID
                            =================================
                            index + 1 gives:
                            1, 2, 3, 4, 5, 6...

                            Real database ID is NOT changed.
                        */}

                        <td
                          style={{
                            padding: "12px",
                            borderBottom:
                              "1px solid #eee",
                            fontWeight: "600",
                          }}
                        >
                          {index + 1}
                        </td>

                        <td
                          style={{
                            padding: "12px",
                            borderBottom:
                              "1px solid #eee",
                          }}
                        >
                          {application.candidate}
                        </td>

                        <td
                          style={{
                            padding: "12px",
                            borderBottom:
                              "1px solid #eee",
                          }}
                        >
                          {application.job}
                        </td>

                        <td
                          style={{
                            padding: "12px",
                            borderBottom:
                              "1px solid #eee",
                            fontWeight: "600",
                          }}
                        >
                          {application.status}
                        </td>

                        <td
                          style={{
                            padding: "12px",
                            borderBottom:
                              "1px solid #eee",
                          }}
                        >
                          {application.applied_date
                            ? new Date(
                                application.applied_date
                              ).toLocaleString()
                            : "-"}
                        </td>

                        <td
                          style={{
                            padding: "12px",
                            borderBottom:
                              "1px solid #eee",
                          }}
                        >

                          <button
                            onClick={() =>
                              setSelectedApplication(
                                application
                              )
                            }
                            style={{
                              padding:
                                "8px 14px",
                              border: "none",
                              borderRadius:
                                "6px",
                              background:
                                "#2563eb",
                              color:
                                "#ffffff",
                              cursor:
                                "pointer",
                              fontWeight:
                                "600",
                            }}
                          >
                            View
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

        {/* ======================================
            APPLICATION DETAILS
        ====================================== */}

        {selectedApplication && (

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
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >

                <h2>
                  Application Details
                </h2>

                <button
                  onClick={() =>
                    setSelectedApplication(
                      null
                    )
                  }
                  style={{
                    padding: "8px 14px",
                    border: "none",
                    borderRadius: "6px",
                    background: "#dc2626",
                    color: "#ffffff",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Close
                </button>

              </div>

              {/* ==================================
                  DISPLAY-ONLY APPLICATION ID
              ================================== */}

              <p>
                <strong>
                  Application ID:
                </strong>{" "}
                {getDisplayApplicationId(
                  selectedApplication
                )}
              </p>

              <p>
                <strong>
                  Candidate ID:
                </strong>{" "}
                {selectedApplication.candidate}
              </p>

              <p>
                <strong>
                  Job ID:
                </strong>{" "}
                {selectedApplication.job}
              </p>

              <p>
                <strong>
                  Applied Date:
                </strong>{" "}
                {selectedApplication.applied_date
                  ? new Date(
                      selectedApplication.applied_date
                    ).toLocaleString()
                  : "-"}
              </p>

              {/* ==================================
                  APPLICATION STATUS
              ================================== */}

              <div
                style={{
                  marginTop: "20px",
                }}
              >

                <strong>
                  Application Status:
                </strong>

                <select
                  value={
                    selectedApplication.status
                  }
                  onChange={(event) =>
                    updateApplicationStatus(
                      selectedApplication.id,
                      event.target.value
                    )
                  }
                  style={{
                    marginLeft: "10px",
                    padding: "8px",
                    borderRadius: "6px",
                    border:
                      "1px solid #ccc",
                    cursor: "pointer",
                  }}
                >

                  <option value="Applied">
                    Applied
                  </option>

                  <option value="Shortlisted">
                    Shortlisted
                  </option>

                  <option value="Rejected">
                    Rejected
                  </option>

                  <option value="Selected">
                    Selected
                  </option>

                </select>

              </div>

            </div>

          </section>

        )}

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

export default AdminApplications;