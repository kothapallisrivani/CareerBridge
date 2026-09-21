import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function AdminCandidates() {
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCandidate, setSelectedCandidate] =
    useState(null);

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
      "https://careerbridge-4gzv.onrender.com/api/accounts/admin-candidates/",
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
              "Unable to load candidates."
          );
        }

        return data;
      })
      .then((data) => {
        setCandidates(data);
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
            <h1>Loading Candidates...</h1>
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
            <h1>Candidates Management</h1>

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

      <main className="dashboard-container">

        <section className="dashboard-welcome">

          <h1>Candidates Management</h1>

          <p>
            View all registered candidates in
            CareerBridge.
          </p>

        </section>

        <section style={{ marginTop: "30px" }}>

          <div className="dashboard-card">

            <h3>Total Candidates</h3>

            <h2>{candidates.length}</h2>

          </div>

        </section>

        <section style={{ marginTop: "30px" }}>

          <h2>All Candidates</h2>

          {candidates.length === 0 ? (

            <p>No candidates found.</p>

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
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Skills</th>
                    <th>Experience</th>
                    <th>Location</th>
                    <th>Action</th>

                  </tr>

                </thead>

                <tbody>

                  {candidates.map((candidate) => (

                    <tr key={candidate.id}>

                      <td>{candidate.id}</td>

                      <td>{candidate.name}</td>

                      <td>{candidate.email}</td>

                      <td>{candidate.phone}</td>

                      <td>{candidate.skills || "-"}</td>

                      <td>{candidate.experience}</td>

                      <td>
                        {candidate.location || "-"}
                      </td>

                      <td>

                        <button
                          onClick={() =>
                            setSelectedCandidate(
                              candidate
                            )
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

        {selectedCandidate && (

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

                <h2>Candidate Details</h2>

                <button
                  onClick={() =>
                    setSelectedCandidate(null)
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
                {selectedCandidate.id}
              </p>

              <p>
                <strong>Name:</strong>{" "}
                {selectedCandidate.name}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {selectedCandidate.email}
              </p>

              <p>
                <strong>Phone:</strong>{" "}
                {selectedCandidate.phone}
              </p>

              <p>
                <strong>Education:</strong>{" "}
                {selectedCandidate.education || "-"}
              </p>

              <p>
                <strong>Experience:</strong>{" "}
                {selectedCandidate.experience}
              </p>

              <p>
                <strong>Location:</strong>{" "}
                {selectedCandidate.location || "-"}
              </p>

              <p>
                <strong>Skills:</strong>{" "}
                {selectedCandidate.skills || "-"}
              </p>

            </div>

          </section>

        )}

      </main>

      <footer className="dashboard-footer">

        <p>
          © 2026 CareerBridge. All rights reserved.
        </p>

      </footer>

    </div>
  );
}

export default AdminCandidates;