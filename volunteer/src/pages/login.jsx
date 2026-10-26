import React from "react";
import Swal from "sweetalert2";
import Axios from "axios";

function VolunteerLogin() {
  const handleLogin = () => {
    const email = document.getElementById("vol-email").value.trim();
    const password = document.getElementById("vol-password").value.trim();

    // Email validation
    if (email === "") {
      Swal.fire({
        icon: "warning",
        title: "Email Required",
        text: "Please enter your email address.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
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

    if (password.length !== 6) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Password",
        text: "Password must be exactly 6 characters.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // Login API
    Axios.post("http://localhost:3000/api/volunteerlogin", {
      email: email,
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
          };

          sessionStorage.setItem("mydata", JSON.stringify(data));
          localStorage.setItem("mydata", JSON.stringify(data));

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
      });
  };

  return (
    <div className="vol-login">
      <style>{`
        .vol-login,
        .vol-login * {
          box-sizing: border-box;
        }

        .vol-login {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 35px 20px;
          font-family: "Inter", sans-serif;
          background:
            radial-gradient(
              circle at 10% 15%,
              rgba(22,160,133,0.12),
              transparent 30%
            ),
            radial-gradient(
              circle at 90% 85%,
              rgba(39,174,96,0.10),
              transparent 30%
            ),
            linear-gradient(135deg, #f2fbf7 0%, #f8fcfa 100%);
            font-family: "Inter", sans-serif;
        }

        .vol-card {
          width: 100%;
          max-width: 450px;
          padding: 20px 38px;
          background: #ffffff;
          border: 1px solid #dcefe6;
          border-radius: 20px;
          box-shadow: 0 18px 45px rgba(22, 100, 75, 0.10);
        }

        /* BRAND */

        .vol-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          text-decoration: none;
        }

        .vol-brand img {
        width: 250px;
        height: auto;
        }

        /* HEADING */
        .vol-title {
          margin: 0;
          text-align: center;
          color: #0d414d;
          font-size: 27px;
          font-weight: 700;
        }

        .vol-subtitle {
          max-width: 350px;
          margin: 8px auto 28px;
          text-align: center;
          color: #71847e;
          font-size: 14px;
          line-height: 1.35;
        }

        /* FORM */

        .vol-group {
          margin-bottom: 18px;
        }

        .vol-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          font-weight: 700;
        }

        .mail {
        color: #0d414d;
        }

        .vol-input {
          width: 100%;
          height: 48px;
          padding: 0 14px;
          border: 1.5px solid #dcebe5;
          border-radius: 10px;
          outline: none;
          background: #fbfefd;
          color: #173b35;
          font-size: 14px;
          transition: 0.25s;
        }

        .vol-input::placeholder {
          color: #a5b5af;
        }

        .vol-input:focus {
          border-color: #16a085;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(22,160,133,0.10);
        }

        /* OPTIONS */

        .vol-options {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 5px 0 22px;
          font-size: 13px;
        }

        .vol-remember {
          color: #71847e;
        }

        .vol-remember input {
          margin-right: 6px;
          accent-color: #16a085;
        }

        .vol-link {
          color: #139477;
          text-decoration: none;
          font-weight: 600;
        }

        .vol-link:hover {
          color: #0d755e;
          text-decoration: underline;
        }

        /* LOGIN BUTTON */

        .vol-login-btn {
          width: 100%;
          height: 49px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, #16a085, #27ae60);
          color: #ffffff;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 9px 22px rgba(22,160,133,0.20);
          transition: 0.25s;
        }

        .vol-login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 26px rgba(22,160,133,0.28);
        }

        /* DIVIDER */

        .vol-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 25px 0;
          color: #a0b0aa;
          font-size: 11px;
          font-weight: 600;
        }

        .vol-divider::before,
        .vol-divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #e3eee9;
        }

        /* REGISTER */

        .vol-register {
          margin: 24px 0 0;
          text-align: center;
          color: #70847e;
          font-size: 13.5px;
        }

        .vol-register a {
          color: #16a085;
          font-weight: 700;
          text-decoration: none;
        }

        .vol-register a:hover {
          text-decoration: underline;
        }

        /* RESPONSIVE */

        @media (max-width: 500px) {
          .vol-card {
            padding: 30px 22px;
          }

          .vol-title {
            font-size: 25px;
          }

          .vol-options {
            font-size: 12px;
          }
        }
      `}</style>

      <div className="vol-card">
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
            <input type="checkbox" />
            Remember me
          </label>

          <a href="/forgot-password" className="vol-link">
            Forgot password?
          </a>
        </div>

        {/* Login */}
        <button type="button" className="vol-login-btn" onClick={handleLogin}>
          Sign In as Volunteer
        </button>

        <div className="vol-divider">NEW TO SAFEHER?</div>

        {/* Register */}
        <p className="vol-register">
          Want to help our community? <a href="/register">Apply as Volunteer</a>
        </p>
      </div>
    </div>
  );
}

export default VolunteerLogin;
