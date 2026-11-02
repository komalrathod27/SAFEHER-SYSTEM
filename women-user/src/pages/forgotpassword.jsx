import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      Swal.fire(
        "Email Required",
        "Please enter your email address.",
        "warning",
      );
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(trimmedEmail)) {
      Swal.fire(
        "Invalid Email",
        "Please enter a valid email address.",
        "warning",
      );
      return;
    }

    navigate("/verifyotp", {
      state: { email: trimmedEmail },
    });
  };

  return (
    <main className="forgot-password-page">
      <style>{`
        .forgot-password-page,
        .forgot-password-page * {
          box-sizing: border-box;
        }

        .forgot-password-page {
          flex: 1 0 auto;
          min-height: calc(100vh - 88px);
          min-height: calc(100svh - 88px);
          display: flex;
          align-items: safe center;
          justify-content: center;
          padding: 20px;
          background: linear-gradient(135deg, #edf4ff, #fff0f7);
          font-family: "Poppins", sans-serif;
        }

        @media (max-width: 991px) {
          .forgot-password-page {
            min-height: calc(100vh - 76px);
            min-height: calc(100svh - 76px);
          }
        }

        .forgot-password-card {
          width: 100%;
          max-width: 440px;
          padding: 40px 35px;
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 12px 40px rgba(23, 43, 98, 0.12);
        }

        .forgot-password-card h1 {
          margin: 0 0 12px;
          color: #172b62;
          font-size: 27px;
          font-weight: 700;
          text-align: center;
        }

        .forgot-password-description {
          margin: 0 0 30px;
          color: #777f91;
          font-size: 14px;
          line-height: 1.6;
          text-align: center;
        }

        .forgot-password-group {
          margin-bottom: 24px;
        }

        .forgot-password-group label {
          display: block;
          margin-bottom: 9px;
          color: #26365f;
          font-size: 14px;
          font-weight: 600;
        }

        .forgot-password-group input {
          width: 100%;
          height: 49px;
          padding: 0 14px;
          border: 1px solid #dce2ed;
          border-radius: 9px;
          outline: none;
          background: #fbfcff;
          color: #26365f;
          font-size: 14px;
          box-sizing: border-box;
        }

        .forgot-password-group input:focus {
          border-color: #287df5;
          box-shadow: 0 0 0 3px rgba(40, 125, 245, 0.1);
        }

        .forgot-password-group input::placeholder {
          color: #a6adbb;
        }

        .forgot-password-button {
          width: 100%;
          height: 49px;
          border: none;
          border-radius: 9px;
          background: linear-gradient(90deg, #287df5, #e94b9b);
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s ease;
        }

        .forgot-password-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 7px 18px rgba(40, 125, 245, 0.22);
        }

        .forgot-password-back {
          display: block;
          margin-top: 24px;
          color: #287df5;
          font-size: 13px;
          font-weight: 600;
          text-align: center;
          text-decoration: none;
        }

        .forgot-password-back:hover {
          color: #e94b9b;
        }

        @media (max-width: 480px) {
          .forgot-password-card {
            padding: 32px 22px;
          }
        }
      `}</style>

      <section className="forgot-password-card">
        <h1>Forgot Password?</h1>

        <p className="forgot-password-description">
          Don't worry! Enter your registered email address to reset your
          password.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="forgot-password-group">
            <label htmlFor="forgot-email">Email Address</label>

            <input
              type="text"
              id="forgot-email"
              placeholder="Enter your email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              inputMode="email"
            />
          </div>

          <button type="submit" className="forgot-password-button">
            Continue
          </button>
        </form>

        <Link to="/login" className="forgot-password-back">
          ← Back to Login
        </Link>
      </section>
    </main>
  );
}

export default ForgotPassword;
