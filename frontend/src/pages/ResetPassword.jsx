import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setPasswordError("");
    setConfirmPasswordError("");
    setGeneralError("");
    setSuccessMessage("");

    // =========================================================
    // FRONTEND VALIDATION
    // =========================================================

    if (!password.trim()) {
      setPasswordError("Please enter a new password.");
      return;
    }

    if (password.length < 8) {
      setPasswordError(
        "Password must be at least 8 characters long."
      );
      return;
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError(
        "Please confirm your new password."
      );
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError(
        "Passwords do not match."
      );
      return;
    }

    // =========================================================
    // GET RESET INFORMATION
    // =========================================================

    const uid = localStorage.getItem("reset_uid");
    const token = localStorage.getItem("reset_token");

    if (!uid || !token) {
      setGeneralError(
        "Password reset session has expired. Please request a new reset link."
      );
      return;
    }

    setLoading(true);

    try {
      // =========================================================
      // RESET PASSWORD API
      // =========================================================

      const response = await fetch(
        "http://127.0.0.1:8000/api/accounts/reset-password/",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            uid: uid,
            token: token,
            password: password,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "RESET PASSWORD RESPONSE:",
        data
      );

      // =========================================================
      // BACKEND ERROR
      // =========================================================

      if (!response.ok) {
        setGeneralError(
          data.error ||
          "Unable to reset password."
        );

        setLoading(false);
        return;
      }

      // =========================================================
      // SUCCESS
      // =========================================================

      setSuccessMessage(
        "Password reset successfully. Redirecting to login..."
      );

      // Remove used reset information
      localStorage.removeItem("reset_uid");
      localStorage.removeItem("reset_token");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      console.error(
        "RESET PASSWORD ERROR:",
        error
      );

      setGeneralError(
        "Unable to connect to server. Make sure Django is running."
      );
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="auth-header">

          <h1>
            Career<span>Bridge</span>
          </h1>

          <h2>Reset Password</h2>

          <p>
            Enter your new password below.
          </p>

        </div>

        {/* =====================================================
            GENERAL ERROR
        ====================================================== */}

        {generalError && (
          <div className="error-message">
            {generalError}
          </div>
        )}

        {/* =====================================================
            SUCCESS MESSAGE
        ====================================================== */}

        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        {/* =====================================================
            RESET PASSWORD FORM
        ====================================================== */}

        <form onSubmit={handleSubmit}>

          {/* ===================================================
              NEW PASSWORD
          ==================================================== */}

          <div className="form-group">

            <label htmlFor="password">
              New Password
            </label>

            <input
              type="password"
              id="password"
              placeholder="Enter new password"
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

          {/* ===================================================
              CONFIRM PASSWORD
          ==================================================== */}

          <div className="form-group">

            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(
                  event.target.value
                );
                setConfirmPasswordError("");
                setGeneralError("");
              }}
            />

            {confirmPasswordError && (
              <div className="field-error">
                {confirmPasswordError}
              </div>
            )}

          </div>

          {/* ===================================================
              RESET BUTTON
          ==================================================== */}

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading
              ? "Resetting Password..."
              : "Reset Password"}
          </button>

        </form>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <div className="auth-footer">

          <p>
            Remember your password?{" "}

            <Link to="/login">
              Back to Login
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

export default ResetPassword;