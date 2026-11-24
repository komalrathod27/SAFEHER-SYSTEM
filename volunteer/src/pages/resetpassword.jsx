import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import "../volunteer-css/resetpassword.css";

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const email =
    location.state?.email ||
    sessionStorage.getItem("volunteer_forgot_password_email") ||
    "";

  const role = "volunteer";
  const resetTokenKey = `safeher_reset_${role}_${email.toLowerCase()}`;

  const resetToken =
    location.state?.resetToken || sessionStorage.getItem(resetTokenKey) || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isCheckingAuthorization, setIsCheckingAuthorization] = useState(true);

  const checkResetAuthorization = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/forgot-password/status",
        {
          params: { email, role },
        },
      );

      const data = response.data;

      if (
        data.otpStatus !== "verified" ||
        !data.resetTokenExpiresAt ||
        !resetToken
      ) {
        sessionStorage.removeItem(resetTokenKey);

        Swal.fire({
          icon: "warning",
          title: "Authorization Missing",
          text: "Please verify your OTP again to reset your password.",
          confirmButtonColor: "#16a085",
        }).then(() => {
          navigate("/forgotpassword", { replace: true });
        });

        return;
      }

      // Token expiry par page refresh hone se alert nahi dikhana
      const expiryTime = new Date(data.resetTokenExpiresAt).getTime();
      if (expiryTime <= Date.now()) {
        setRemainingSeconds(0);
        return;
      }
      setRemainingSeconds(
        Math.max(0, Math.ceil((expiryTime - Date.now()) / 1000)),
      );
    } catch (error) {
      console.error("Reset Authorization Error:", error);

      Swal.fire({
        icon: "error",
        title: "Unable to Verify Authorization",
        text: "Please try again later.",
        confirmButtonColor: "#16a085",
      }).then(() => {
        navigate("/forgotpassword", { replace: true });
      });
    } finally {
      setIsCheckingAuthorization(false);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate("/", { replace: true });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  useEffect(() => {
    if (!email || !resetToken) {
      setIsCheckingAuthorization(false);

      Swal.fire({
        icon: "warning",
        title: "Reset Authorization Missing",
        text: "Please verify your OTP again to reset your password.",
        confirmButtonColor: "#16a085",
      }).then(() => {
        navigate("/forgotpassword", { replace: true });
      });

      return;
    }

    checkResetAuthorization();
  }, [email, resetToken, navigate]);

  useEffect(() => {
    if (isCheckingAuthorization || remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isCheckingAuthorization, remainingSeconds > 0]);

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (!email || !resetToken || isCheckingAuthorization) {
      Swal.fire({
        icon: "warning",
        title: "Authorization Missing",
        text: "Please verify your OTP again.",
        confirmButtonColor: "#16a085",
      });
      return;
    }

    if (remainingSeconds <= 0) {
      sessionStorage.removeItem(resetTokenKey);
      await Swal.fire({
        icon: "warning",
        title: "Authorization Failed",
        text: "Your reset authorization has expired. Please verify your OTP again.",
        confirmButtonColor: "#16a085",
      });

      navigate("/forgotpassword", { replace: true });
      return;
    }

    if (!password) {
      Swal.fire({
        icon: "warning",
        title: "Password Required",
        text: "Please enter your new password.",
        confirmButtonColor: "#16a085",
      });
      return;
    }

    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/;

    if (!passwordPattern.test(password)) {
      Swal.fire({
        icon: "warning",
        title: "Weak Password",
        confirmButtonColor: "#16a085",
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

    if (!confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Confirm Password Required",
        text: "Please confirm your new password.",
        confirmButtonColor: "#16a085",
      });
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Password Mismatch",
        text: "New Password and Confirm Password do not match.",
        confirmButtonColor: "#16a085",
      });
      return;
    }

    if (isLoading) return;

    try {
      setIsLoading(true);

      const response = await axios.post(
        "http://localhost:3000/api/forgot-password/reset-password",
        {
          email,
          role,
          resetToken,
          newPassword: password,
        },
      );

      if (response.data.success) {
        sessionStorage.removeItem(resetTokenKey);
        setIsSuccess(true);
      }
    } catch (error) {
      const message = error.response?.data?.message || "";
      const isAuthorizationFailed =
        message.toLowerCase().includes("expired") ||
        message.toLowerCase().includes("invalid reset authorization");

      if (isAuthorizationFailed) {
        sessionStorage.removeItem(resetTokenKey);
        setRemainingSeconds(0);

        await Swal.fire({
          icon: "warning",
          title: "Authorization Failed",
          text: "Your reset authorization has expired or is invalid. Please verify your OTP again.",
          confirmButtonColor: "#16a085",
        });

        navigate("/forgotpassword", { replace: true });
        return;
      }

      Swal.fire({
        icon: "error",
        title: "Password Reset Failed",
        text:
          error.response?.data?.message ||
          "Unable to reset your password. Please try again.",
        confirmButtonColor: "#16a085",
      });
    } finally {
      setIsLoading(false);
    }
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
              Create a new password for your SafeHer Volunteer account.
            </p>

            {isCheckingAuthorization ? (
              <p className="reset-password-description">
                Verifying reset authorization...
              </p>
            ) : remainingSeconds > 0 ? (
              <p className="reset-password-description">
                Reset link expires in:{" "}
                <strong>
                  {Math.floor(remainingSeconds / 60)}:
                  {String(remainingSeconds % 60).padStart(2, "0")}
                </strong>
              </p>
            ) : null}

            <form onSubmit={handleResetPassword} noValidate>
              <div className="reset-password-group">
                <label htmlFor="vol-new-password">New Password</label>

                <div className="reset-password-input-wrapper">
                  <input
                    id="vol-new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    disabled={isLoading}
                  />

                  <button
                    type="button"
                    className="reset-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="reset-password-group">
                <label htmlFor="vol-confirm-password">Confirm Password</label>

                <div className="reset-password-input-wrapper">
                  <input
                    id="vol-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    disabled={isLoading}
                  />

                  <button
                    type="button"
                    className="reset-password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="reset-password-hint">
                Password must contain at least 8 characters, uppercase,
                lowercase, number and special character.
              </div>

              <button
                type="submit"
                className="reset-password-button"
                disabled={isLoading || isCheckingAuthorization}
              >
                {isLoading ? "Updating Password..." : "Reset Password"}
              </button>
            </form>

            <Link to="/" className="reset-password-back">
              ← Back to Login
            </Link>
          </>
        )}
      </section>
    </main>
  );
}

export default ResetPassword;
