import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function AdminRecruiters() {
  const navigate = useNavigate();

  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);

  // ==========================================
  // LOAD ADMIN RECRUITERS
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
      "https://careerbridge-4gzv.onrender.com/api/accounts/admin-recruiters/",
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
              "Unable to load recruiters."
          );
        }

        return data;
      })
      .then((data) => {
        console.log(
          "ADMIN RECRUITERS RESPONSE:",
          data
        );

        setRecruiters(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(
          "ADMIN RECRUITERS ERROR:",
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
              Loading Recruiters...
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
              Recruiters Management
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
            PAGE HEADER
        ====================================== */}

        <section className="dashboard-welcome">

          <h1>
            Recruiters Management
          </h1>

          <p>
            View all registered recruiters in
            CareerBridge.
          </p>

        </section>

        {/* ======================================
            TOTAL RECRUITERS
        ====================================== */}

        <section
          style={{
            marginTop: "30px",
          }}
        >

          <div className="dashboard-card">

            <h3>
              Total Recruiters
            </h3>

            <h2>
              {recruiters.length}
            </h2>

          </div>

        </section>

        {/* ======================================
            RECRUITERS TABLE
        ====================================== */}

        <section
          style={{
            marginTop: "30px",
          }}
        >

          <h2>
            All Recruiters
          </h2>

          {recruiters.length === 0 ? (

            <p>
              No recruiters found.
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
                      Name
                    </th>

                    <th
                      style={{
                        padding: "12px",
                        borderBottom:
                          "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      Email
                    </th>

                    <th
                      style={{
                        padding: "12px",
                        borderBottom:
                          "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      Phone
                    </th>

                    <th
                      style={{
                        padding: "12px",
                        borderBottom:
                          "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      Company
                    </th>

                    <th
                      style={{
                        padding: "12px",
                        borderBottom:
                          "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      Position
                    </th>

                    <th
                      style={{
                        padding: "12px",
                        borderBottom:
                          "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      Location
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

                  {recruiters.map((recruiter) => (

                    <tr key={recruiter.id}>

                      <td
                        style={{
                          padding: "12px",
                          borderBottom:
                            "1px solid #eee",
                        }}
                      >
                        {recruiter.id}
                      </td>

                      <td
                        style={{
                          padding: "12px",
                          borderBottom:
                            "1px solid #eee",
                        }}
                      >
                        {recruiter.name}
                      </td>

                      <td
                        style={{
                          padding: "12px",
                          borderBottom:
                            "1px solid #eee",
                        }}
                      >
                        {recruiter.email}
                      </td>

                      <td
                        style={{
                          padding: "12px",
                          borderBottom:
                            "1px solid #eee",
                        }}
                      >
                        {recruiter.phone}
                      </td>

                      <td
                        style={{
                          padding: "12px",
                          borderBottom:
                            "1px solid #eee",
                        }}
                      >
                        {recruiter.company || "-"}
                      </td>

                      <td
                        style={{
                          padding: "12px",
                          borderBottom:
                            "1px solid #eee",
                        }}
                      >
                        {recruiter.position || "-"}
                      </td>

                      <td
                        style={{
                          padding: "12px",
                          borderBottom:
                            "1px solid #eee",
                        }}
                      >
                        {recruiter.location || "-"}
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
                            setSelectedRecruiter(
                              recruiter
                            )
                          }
                          style={{
                            padding: "8px 14px",
                            border: "none",
                            borderRadius: "6px",
                            background:
                              "#2563eb",
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

        {/* ======================================
            RECRUITER DETAILS
        ====================================== */}

        {selectedRecruiter && (

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
                  Recruiter Details
                </h2>

                <button
                  onClick={() =>
                    setSelectedRecruiter(null)
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

              <p>
                <strong>ID:</strong>{" "}
                {selectedRecruiter.id}
              </p>

              <p>
                <strong>Name:</strong>{" "}
                {selectedRecruiter.name}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {selectedRecruiter.email}
              </p>

              <p>
                <strong>Phone:</strong>{" "}
                {selectedRecruiter.phone}
              </p>

              <p>
                <strong>Company:</strong>{" "}
                {selectedRecruiter.company || "-"}
              </p>

              <p>
                <strong>Position:</strong>{" "}
                {selectedRecruiter.position || "-"}
              </p>

              <p>
                <strong>Website:</strong>{" "}
                {selectedRecruiter.website || "-"}
              </p>

              <p>
                <strong>Location:</strong>{" "}
                {selectedRecruiter.location || "-"}
              </p>

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

export default AdminRecruiters;