import React, { useState } from "react";
import Swal from "sweetalert2";
import Axios from "axios";
import "../volunteer-css/login.css";

function VolunteerLogin() {
  const REMEMBERED_EMAIL_KEY = "volunteer_remembered_email";
  const REMEMBER_ME_KEY = "volunteer_remember_me";

  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(
    () => localStorage.getItem(REMEMBER_ME_KEY) === "true",
  );
  const [email, setEmail] = useState(
    () => localStorage.getItem(REMEMBERED_EMAIL_KEY) || "",
  );

  const handleLogin = (e) => {
    e.preventDefault();
    if (isLoading) return;

    const trimmedEmail = email.trim().toLowerCase();
    const password = document.getElementById("vol-password").value.trim();

    // Email validation
    if (trimmedEmail === "") {
      Swal.fire({
        icon: "warning",
        title: "Email Required",
        text: "Please enter your email address.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(trimmedEmail)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Email",
        text: "Please enter a valid email address.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // Password validation
    if (password === "") {
      Swal.fire({
        icon: "warning",
        title: "Password Required",
        text: "Please enter your password.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // Login API
    setIsLoading(true);
    Axios.post("http://localhost:3000/api/volunteerlogin", {
      email: trimmedEmail,
      password: password,
    })
      .then((response) => {
        const user = response.data;

        if (user.status === "Approved") {
          const data = {
            user_id: user._id,
            email: user.email,
            name: user.name,
            contact_no: user.contact_no || "",
            profile_photo: user.profile_photo || "",
            token: user.sessionToken,
          };

          localStorage.removeItem("mydata");
          sessionStorage.removeItem("mydata");

          if (rememberMe) {
            localStorage.setItem("mydata", JSON.stringify(data));
            localStorage.setItem(REMEMBER_ME_KEY, "true");
            localStorage.setItem(REMEMBERED_EMAIL_KEY, trimmedEmail);
          } else {
            sessionStorage.setItem("mydata", JSON.stringify(data));
            localStorage.setItem(REMEMBER_ME_KEY, "false");
            localStorage.removeItem(REMEMBERED_EMAIL_KEY);
          }

          Swal.fire({
            icon: "success",
            title: "Login Successful",
            text: `Welcome, ${user.name}!`,
            confirmButtonColor: "#287df5",
          }).then(() => {
            window.location.href = "/dashboard";
          });
        }
      })
      .catch((error) => {
        const data = error.response?.data;

        if (data?.status === "Pending") {
          Swal.fire({
            icon: "warning",
            title: "Application Pending",
            text: data.message,
            confirmButtonColor: "#f39c12",
          });
        } else if (data?.status === "Rejected") {
          Swal.fire({
            icon: "error",
            title: "Application Rejected",
            text: data.message,
            confirmButtonColor: "#e74c3c",
          });
        } else if (data?.status === "Invalid") {
          Swal.fire({
            icon: "error",
            title: "Login Failed",
            text: data.message,
            confirmButtonColor: "#287df5",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Login Failed",
            text: data.message || "Something went wrong. Please try again.",
            confirmButtonColor: "#287df5",
          });
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="vol-login">
      <form className="vol-card" onSubmit={handleLogin}>
        {/* SafeHer Volunteer Logo */}
        <a href="/" className="vol-brand">
          <img src="/images/icon/volunteer-logo.png" alt="Safeher" />
        </a>

        {/* Volunteer title */}
        <h1 className="vol-title">Welcome, Volunteer</h1>

        <p className="vol-subtitle">
          Sign in to your volunteer account and help to build a safer community
          with SafeHer.
        </p>

        {/* Email */}
        <div className="vol-group">
          <label htmlFor="vol-email" className="mail">
            Email Address
          </label>

          <input
            id="vol-email"
            type="email"
            className="vol-input"
            placeholder="Enter your email address"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="vol-group">
          <label htmlFor="vol-password" className="pswd">
            Password
          </label>

          <input
            id="vol-password"
            type="password"
            className="vol-input"
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </div>

        {/* Remember / Forgot */}
        <div className="vol-options">
          <label className="vol-remember">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => {
                const checked = event.target.checked;
                setRememberMe(checked);
                localStorage.setItem(REMEMBER_ME_KEY, String(checked));

                if (!checked) {
                  localStorage.removeItem(REMEMBERED_EMAIL_KEY);
                }
              }}
            />
            Remember me
          </label>

          <a href="/forgotpassword" className="vol-link">
            Forgot password?
          </a>
        </div>

        {/* Login */}
        <button type="submit" className="vol-login-btn" disabled={isLoading}>
          {isLoading ? "Signing In..." : "Sign In as Volunteer"}
        </button>

        <div className="vol-divider">NEW TO SAFEHER?</div>

        {/* Register */}
        <p className="vol-register">
          Want to help our community? <a href="/register">Apply as Volunteer</a>
        </p>
      </form>
    </div>
  );
}

export default VolunteerLogin;
