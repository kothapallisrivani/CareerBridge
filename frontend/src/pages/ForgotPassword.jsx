import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function ForgotPassword() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "http://127.0.0.1:8000/api/accounts/forgot-password/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: email.trim(),
                    }),
                }
            );

            const data = await response.json();

            console.log("PASSWORD RESET RESPONSE:", data);

            if (!response.ok) {
                setError(
                    data.error ||
                    "Unable to process password reset request."
                );

                setLoading(false);
                return;
            }

            // Check that backend returned reset information
            if (!data.uid || !data.token) {
                console.error(
                    "UID or TOKEN missing:",
                    data
                );

                setError(
                    "Password reset information was not received."
                );

                setLoading(false);
                return;
            }

            // Save UID and token
            localStorage.setItem(
                "reset_uid",
                data.uid
            );

            localStorage.setItem(
                "reset_token",
                data.token
            );

            console.log("RESET UID:", data.uid);
            console.log("RESET TOKEN SAVED");

            // Go automatically to Reset Password page
            navigate("/reset-password", {
                replace: true,
            });

        } catch (error) {
            console.error(
                "FORGOT PASSWORD ERROR:",
                error
            );

            setError(
                "Unable to connect to server. Make sure Django is running."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-card">

                <div className="auth-header">

                    <h1>
                        Career<span>Bridge</span>
                    </h1>

                    <h2>Forgot Password?</h2>

                    <p>
                        Enter your registered email to reset your password.
                    </p>

                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="form-group">

                        <label htmlFor="email">
                            Email Address
                        </label>

                        <input
                            type="email"
                            id="email"
                            placeholder="Enter your registered email"
                            value={email}
                            onChange={(event) => {
                                setEmail(event.target.value);
                                setError("");
                            }}
                        />

                    </div>

                    <button
                        type="submit"
                        className="auth-btn"
                        disabled={loading}
                    >
                        {loading
                            ? "Processing..."
                            : "Send Reset Link"
                        }
                    </button>

                </form>

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

export default ForgotPassword;