import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import "../safeher-css/resetpassword.css";

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  useEffect(() => {
    if (!email) {
      Swal.fire(
        "Email Missing",
        "Please start the password reset process again.",
        "warning",
      ).then(() => {
        navigate("/forgotpassword", { replace: true });
      });
    }
  }, [email, navigate]);

  const handleResetPassword = (event) => {
    event.preventDefault();

    if (!email) {
      Swal.fire("Email Missing", "Please enter your email first.", "warning");
      return;
    }

    if (!password.trim()) {
      Swal.fire(
        "Password Required",
        "Please enter your new password.",
        "warning",
      );
      return;
    }

    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/;

    if (!passwordPattern.test(password)) {
      Swal.fire({
        icon: "warning",
        title: "Weak Password",
        html: `
          <div style="text-align:left; font-size:14px; line-height:1.8;">
            Your password must contain:
            <ul>
              <li>At least 8 characters</li>
              <li>At least one uppercase letter (A-Z)</li>
              <li>At least one lowercase letter (a-z)</li>
              <li>At least one number (0-9)</li>
              <li>At least one special character (@, #, $, etc.)</li>
              <li>No spaces</li>
            </ul>
          </div>
        `,
      });
      return;
    }

    if (!confirmPassword.trim()) {
      Swal.fire(
        "Confirm Password Required",
        "Please confirm your new password.",
        "warning",
      );
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire(
        "Password Mismatch",
        "New Password and Confirm Password do not match.",
        "error",
      );
      return;
    }

    // Frontend only: actual password update will be done through backend.
    setIsSuccess(true);
  };

  return (
    <main className="reset-password-page">
      <section className="reset-password-card">
        {isSuccess ? (
          <div className="reset-success-message">
            <div className="reset-success-check">✓</div>
            <h2>Password Reset Successful!</h2>
            <p>Your password has been reset successfully.</p>
            <p>Redirecting you to login...</p>
          </div>
        ) : (
          <>
            <h1>Reset Password</h1>

            <p className="reset-password-description">
              Create a new password for your SafeHer account.
            </p>

            <form onSubmit={handleResetPassword} noValidate>
              <div className="reset-password-group">
                <label htmlFor="new-password">New Password</label>

                <div className="reset-password-input-wrapper">
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="reset-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="reset-password-group">
                <label htmlFor="confirm-password">Confirm Password</label>

                <div className="reset-password-input-wrapper">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="reset-password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="reset-password-hint">
                Password must contain at least 8 characters, uppercase,
                lowercase, number and special character.
              </div>

              <button type="submit" className="reset-password-button">
                Reset Password
              </button>
            </form>

            <Link to="/login" className="reset-password-back">
              ← Back to Login
            </Link>
          </>
        )}
      </section>
    </main>
  );
}

export default ResetPassword;
