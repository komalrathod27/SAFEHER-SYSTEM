import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import Axios from "axios";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      Swal.fire({
        icon: "warning",
        title: "Email Required",
        text: "Please enter your email address.",
        confirmButtonColor: "#16a085",
      });
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(trimmedEmail)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Email",
        text: "Please enter a valid email address.",
        confirmButtonColor: "#16a085",
      });
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    try {
      const response = await Axios.post(
        "http://localhost:3000/api/forgot-password/send-otp",
        {
          email: trimmedEmail,
          role: "volunteer",
        },
      );

      Swal.fire({
        icon: "success",
        title: "OTP Sent",
        text: response.data.message || "Please check your email for the OTP.",
        confirmButtonColor: "#16a085",
      }).then(() => {
        navigate("/verifyotp", {
          state: {
            email: trimmedEmail,
            role: "volunteer",
          },
        });
      });
    } catch (error) {
      const remainingSeconds = error.response?.data?.remainingSeconds;
      let remainingTime = "";

      if (typeof remainingSeconds === "number") {
        const days = Math.floor(remainingSeconds / 86400);
        const hours = Math.floor((remainingSeconds % 86400) / 3600);
        const minutes = Math.floor((remainingSeconds % 3600) / 60);
        const seconds = remainingSeconds % 60;

        if (days > 0) remainingTime += `${days}d `;
        if (hours > 0) remainingTime += `${hours}h `;
        if (minutes > 0) remainingTime += `${minutes}m `;
        if (seconds > 0 || !remainingTime) remainingTime += `${seconds}s`;
      }
      const isCooldownActive = error.response?.status === 429;
      Swal.fire({
        icon: isCooldownActive ? "warning" : "error",
        title: isCooldownActive
          ? "Maximum OTP Limit Reached"
          : "Unable to Send OTP",
        text: isCooldownActive
          ? `You have reached the maximum OTP generation limit. Please try again after ${remainingTime}.`
          : error.response?.data?.message ||
            "Something went wrong. Please try again later.",
        confirmButtonColor: "#16a085",
      });
    } finally {
      setIsLoading(false);
    }
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
          background: linear-gradient(135deg, #edf9f3, #f0faf6);
          font-family: "Inter", sans-serif;
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
          border: 1px solid #dcefe6;
          border-radius: 18px;
          box-shadow: 0 12px 40px rgba(22, 100, 75, 0.10);
        }

        .forgot-password-card h1 {
          margin: 0 0 12px;
          color: #0d414d;
          font-size: 27px;
          font-weight: 700;
          text-align: center;
        }

        .forgot-password-description {
          margin: 0 0 30px;
          color: #71847e;
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
          color: #0d414d;
          font-size: 14px;
          font-weight: 600;
        }

        .forgot-password-group input {
          width: 100%;
          height: 49px;
          padding: 0 14px;
          border: 1px solid #dcebe5;
          border-radius: 9px;
          outline: none;
          background: #fbfefd;
          color: #173b35;
          font-size: 14px;
          box-sizing: border-box;
        }

        .forgot-password-group input:focus {
          border-color: #16a085;
          box-shadow: 0 0 0 3px rgba(22, 160, 133, 0.10);
        }

        .forgot-password-group input::placeholder {
          color: #a5b5af;
        }

        .forgot-password-button {
          width: 100%;
          height: 49px;
          border: none;
          border-radius: 9px;
          background: linear-gradient(135deg, #16a085, #27ae60);
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s ease;
        }

        .forgot-password-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 7px 18px rgba(22, 160, 133, 0.22);
        }

        .forgot-password-back {
          display: block;
          margin-top: 24px;
          color: #139477;
          font-size: 13px;
          font-weight: 600;
          text-align: center;
          text-decoration: none;
        }

        .forgot-password-back:hover {
          color: #0d755e;
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
          Don't worry! Enter your registered volunteer email address to reset
          your password.
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

          <button
            type="submit"
            className="forgot-password-button"
            disabled={isLoading}
          >
            {isLoading ? "Sending OTP..." : "Continue"}
          </button>
        </form>

        <Link to="/" className="forgot-password-back">
          ← Back to Login
        </Link>
      </section>
    </main>
  );
}

export default ForgotPassword;
