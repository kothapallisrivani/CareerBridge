import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    role: "Candidate",
    password: "",
    confirmPassword: "",
  });

  const [nameError, setNameError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [termsError, setTermsError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // =========================
  // HANDLE INPUT CHANGE
  // =========================

  const handleChange = (event) => {
    const { id, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [id]: value,
    }));

    if (id === "name") {
      setNameError("");
    }

    if (id === "username") {
      setUsernameError("");
    }

    if (id === "email") {
      setEmailError("");
    }

    if (id === "phone") {
      setPhoneError("");
    }

    if (id === "password") {
      setPasswordError("");
    }

    if (id === "confirmPassword") {
      setConfirmPasswordError("");
    }

    setGeneralError("");
  };

  // =========================
  // HANDLE TERMS CHECKBOX
  // =========================

  const handleTermsChange = (event) => {
    setTermsAccepted(event.target.checked);
    setTermsError("");
  };

  // =========================
  // HANDLE FORM SUBMIT
  // =========================

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Clear previous errors
    setNameError("");
    setUsernameError("");
    setEmailError("");
    setPhoneError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setTermsError("");
    setGeneralError("");
    setSuccess("");

    let hasError = false;

    // =========================
    // FULL NAME VALIDATION
    // =========================

    if (!formData.name.trim()) {
      setNameError("Please enter your full name.");
      hasError = true;
    }

    // =========================
    // USERNAME VALIDATION
    // =========================

    if (!formData.username.trim()) {
      setUsernameError("Please enter a username.");
      hasError = true;
    } else if (formData.username.trim().length < 3) {
      setUsernameError(
        "Username must contain at least 3 characters."
      );
      hasError = true;
    }

    // =========================
    // EMAIL VALIDATION
    // =========================

    if (!formData.email.trim()) {
      setEmailError("Please enter your email.");
      hasError = true;
    } else {
      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(formData.email.trim())) {
        setEmailError("Invalid email address.");
        hasError = true;
      }
    }

    // =========================
    // PHONE VALIDATION
    // =========================

    if (!formData.phone.trim()) {
      setPhoneError("Please enter your phone number.");
      hasError = true;
    } else {
      const phonePattern = /^[0-9]{10}$/;

      if (!phonePattern.test(formData.phone.trim())) {
        setPhoneError(
          "Enter a valid 10-digit phone number."
        );
        hasError = true;
      }
    }

    // =========================
    // PASSWORD VALIDATION
    // =========================

    if (!formData.password.trim()) {
      setPasswordError("Please enter your password.");
      hasError = true;
    } else if (formData.password.length < 8) {
      setPasswordError(
        "Password must contain at least 8 characters."
      );
      hasError = true;
    }

    // =========================
    // CONFIRM PASSWORD
    // =========================

    if (!formData.confirmPassword.trim()) {
      setConfirmPasswordError(
        "Please confirm your password."
      );
      hasError = true;
    } else if (
      formData.password !== formData.confirmPassword
    ) {
      setConfirmPasswordError(
        "Passwords do not match."
      );
      hasError = true;
    }

    // =========================
    // TERMS & CONDITIONS
    // =========================

    if (!termsAccepted) {
      setTermsError(
        "Please accept the Terms and Conditions."
      );
      hasError = true;
    }

    // Stop if validation failed
    if (hasError) {
      return;
    }

    setLoading(true);

    // =========================
    // SEND DATA TO DJANGO
    // =========================

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/accounts/register/",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: formData.name.trim(),
            username: formData.username.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            role: formData.role,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      console.log("Registration response:", data);

      // =========================
      // BACKEND ERRORS
      // =========================

      if (!response.ok) {
        let errorHandled = false;

        // Username error
        if (data.username) {
          const usernameMessage = Array.isArray(
            data.username
          )
            ? data.username[0]
            : data.username;

          setUsernameError(usernameMessage);
          errorHandled = true;
        }

        // Email error
        if (data.email) {
          const emailMessage = Array.isArray(
            data.email
          )
            ? data.email[0]
            : data.email;

          setEmailError(emailMessage);
          errorHandled = true;
        }

        // Password error
        if (data.password) {
          const passwordMessage = Array.isArray(
            data.password
          )
            ? data.password[0]
            : data.password;

          setPasswordError(passwordMessage);
          errorHandled = true;
        }

        // Phone error
        if (data.phone) {
          const phoneMessage = Array.isArray(
            data.phone
          )
            ? data.phone[0]
            : data.phone;

          setPhoneError(phoneMessage);
          errorHandled = true;
        }

        // Non-field errors
        if (data.non_field_errors) {
          const message = Array.isArray(
            data.non_field_errors
          )
            ? data.non_field_errors[0]
            : data.non_field_errors;

          setGeneralError(message);
          errorHandled = true;
        }

        // Detail error
        if (data.detail) {
          setGeneralError(data.detail);
          errorHandled = true;
        }

        // General error
        if (data.error) {
          setGeneralError(data.error);
          errorHandled = true;
        }

        if (!errorHandled) {
          setGeneralError(
            "Something went wrong. Please try again."
          );
        }

        setLoading(false);
        return;
      }

      // =========================
      // REGISTRATION SUCCESS
      // =========================

      setSuccess(
        "Account created successfully! Redirecting to login..."
      );

      // Redirect to Login
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);

      setGeneralError(
        "Unable to connect to server. Make sure Django is running."
      );

      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card register-card">

        {/* =========================
            HEADER
        ========================== */}

        <div className="auth-header">
          <h1>
            Career<span>Bridge</span>
          </h1>

          <h2>Create Your Account</h2>

          <p>
            Create your CareerBridge account
            and start your career journey.
          </p>
        </div>

        {/* =========================
            SUCCESS MESSAGE
        ========================== */}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        {/* =========================
            GENERAL ERROR
        ========================== */}

        {generalError && (
          <div className="error-message">
            {generalError}
          </div>
        )}

        {/* =========================
            REGISTRATION FORM
        ========================== */}

        <form onSubmit={handleSubmit}>

          {/* =========================
              FULL NAME
          ========================== */}

          <div className="form-group">
            <label htmlFor="name">
              Full Name
            </label>

            <input
              type="text"
              id="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
            />

            {nameError && (
              <div className="field-error">
                {nameError}
              </div>
            )}
          </div>

          {/* =========================
              USERNAME
          ========================== */}

          <div className="form-group">
            <label htmlFor="username">
              Username
            </label>

            <input
              type="text"
              id="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
            />

            {usernameError && (
              <div className="field-error">
                {usernameError}
              </div>
            )}
          </div>

          {/* =========================
              EMAIL
          ========================== */}

          <div className="form-group">
            <label htmlFor="email">
              Gmail / Email Address
            </label>

            <input
              type="email"
              id="email"
              placeholder="Enter your Gmail or email"
              value={formData.email}
              onChange={handleChange}
            />

            {emailError && (
              <div className="field-error">
                {emailError}
              </div>
            )}
          </div>

          {/* =========================
              PHONE
          ========================== */}

          <div className="form-group">
            <label htmlFor="phone">
              Phone Number
            </label>

            <input
              type="tel"
              id="phone"
              placeholder="Enter your 10-digit phone number"
              value={formData.phone}
              onChange={handleChange}
              maxLength="10"
            />

            {phoneError && (
              <div className="field-error">
                {phoneError}
              </div>
            )}
          </div>

          {/* =========================
              REGISTER AS
          ========================== */}

          <div className="form-group">
            <label htmlFor="role">
              Register As
            </label>

            <select
              id="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="Candidate">
                Candidate
              </option>

              <option value="Recruiter">
                Recruiter
              </option>
            </select>
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
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
            />

            {passwordError && (
              <div className="field-error">
                {passwordError}
              </div>
            )}
          </div>

          {/* =========================
              CONFIRM PASSWORD
          ========================== */}

          <div className="form-group">
            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            {confirmPasswordError && (
              <div className="field-error">
                {confirmPasswordError}
              </div>
            )}
          </div>

          {/* =========================
              TERMS & CONDITIONS
          ========================== */}

          <label className="terms">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={handleTermsChange}
            />

            <span>
              I agree to the Terms & Conditions
              and Privacy Policy.
            </span>
          </label>

          {termsError && (
            <div className="field-error terms-error">
              {termsError}
            </div>
          )}

          {/* =========================
              CREATE ACCOUNT BUTTON
          ========================== */}

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        {/* =========================
            FOOTER
        ========================== */}

        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login">
              Login here
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

export default Register;