import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Clear previous errors
    setUsernameError("");
    setPasswordError("");
    setGeneralError("");

    // =========================
    // FRONTEND VALIDATION
    // =========================

    if (!username.trim()) {
      setUsernameError("Please enter your username or email.");
      return;
    }

    if (!password.trim()) {
      setPasswordError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      // =========================
      // CHECK USERNAME
      // =========================

      console.log("USERNAME SENT:", username.trim());

      // =========================
      // LOGIN API REQUEST
      // =========================

      const response = await fetch(
        "https://careerbridge-4gzv.onrender.com/api/accounts/login/",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            username: username.trim(),
            password: password,
          }),
        }
      );

      const data = await response.json();

      // Show backend response in console
      console.log("LOGIN RESPONSE:", data);

      // =========================
      // BACKEND ERROR
      // =========================

      if (!response.ok) {
        if (data.detail) {
          setGeneralError(data.detail);
        } else if (data.error) {
          setGeneralError(data.error);
        } else {
          setGeneralError(
            "Invalid username/email or password."
          );
        }

        setLoading(false);
        return;
      }

      // =========================
      // LOGIN SUCCESS
      // =========================

      console.log("LOGIN SUCCESS");
      console.log("USER:", data.user);

      // Save authentication token
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // Save user information
      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      }

      // =========================
      // ROLE-BASED NAVIGATION
      // =========================

      if (data.user?.role === "candidate") {
        navigate("/candidate-dashboard");
      } else if (data.user?.role === "recruiter") {
        navigate("/recruiter-dashboard");
      } else if (data.user?.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/");
      }

    } catch (error) {
      console.error("LOGIN ERROR:", error);

      setGeneralError(
        "Unable to connect to server. Make sure Django is running."
      );
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        {/* =========================
            HEADER
        ========================== */}

        <div className="auth-header">

          <h1>
            Career<span>Bridge</span>
          </h1>

          <h2>Welcome Back</h2>

          <p>
            Login to continue your career journey.
          </p>

        </div>

        {/* =========================
            GENERAL ERROR
        ========================== */}

        {generalError && (
          <div className="error-message">
            {generalError}
          </div>
        )}

        {/* =========================
            LOGIN FORM
        ========================== */}

        <form onSubmit={handleSubmit}>

          {/* =========================
              USERNAME / EMAIL
          ========================== */}

          <div className="form-group">

            <label htmlFor="username">
              Username or Email
            </label>

            <input
              type="text"
              id="username"
              placeholder="Enter username or email"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                setUsernameError("");
                setGeneralError("");
              }}
            />

            {usernameError && (
              <div className="field-error">
                {usernameError}
              </div>
            )}

          </div>

          {/* =========================
              PASSWORD
          ========================== */}

          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setPasswordError("");
                setGeneralError("");
              }}
            />

            {passwordError && (
              <div className="field-error">
                {passwordError}
              </div>
            )}

          </div>

          {/* =========================
              REMEMBER ME
              FORGOT PASSWORD
          ========================== */}

          <div className="form-options">

            <label>
              <input type="checkbox" />
              Remember me
            </label>

            <Link to="/forgot-password">
              Forgot Password?
            </Link>

          </div>

          {/* =========================
              LOGIN BUTTON
          ========================== */}

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {/* =========================
            FOOTER
        ========================== */}

        <div className="auth-footer">

          <p>
            Don't have an account?{" "}

            <Link to="/register">
              Create an account
            </Link>
          </p>

          <Link
            to="/"
            className="back-home"
          >
            ← Back to Home
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Login;