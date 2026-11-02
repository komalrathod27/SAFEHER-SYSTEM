import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  useEffect(() => {
    if (!email) {
      Swal.fire({
        icon: "warning",
        title: "Email Missing",
        text: "Please enter your email address first.",
        confirmButtonColor: "#16a085",
      }).then(() => {
        navigate("/forgotpassword", { replace: true });
      });
    }
  }, [email, navigate]);

  const handleOtpChange = (value, index) => {
    const digit = value.replace(/\D/g, "").slice(-1);

    const updatedOtp = [...otp];
    updatedOtp[index] = digit;
    setOtp(updatedOtp);

    if (digit && index < 5) {
      document.getElementById(`vol-otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`vol-otp-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();

    const pastedDigits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedDigits) return;

    const updatedOtp = [...otp];

    pastedDigits.split("").forEach((digit, index) => {
      updatedOtp[index] = digit;
    });

    setOtp(updatedOtp);

    const focusIndex = Math.min(pastedDigits.length, 5);
    document.getElementById(`vol-otp-${focusIndex}`)?.focus();
  };

  const handleVerify = (event) => {
    event.preventDefault();

    if (!email) {
      Swal.fire({
        icon: "warning",
        title: "Email Missing",
        text: "Please enter your email first.",
        confirmButtonColor: "#16a085",
      });
      return;
    }

    const enteredOtp = otp.join("");

    if (!enteredOtp) {
      Swal.fire({
        icon: "warning",
        title: "OTP Required",
        text: "Please enter your OTP.",
        confirmButtonColor: "#16a085",
      });
      return;
    }

    if (enteredOtp.length !== 6) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete OTP",
        text: "Please enter all 6 digits.",
        confirmButtonColor: "#16a085",
      });
      return;
    }

    if (!/^\d{6}$/.test(enteredOtp)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid OTP",
        text: "OTP must contain exactly 6 digits.",
        confirmButtonColor: "#16a085",
      });
      return;
    }

    // Frontend only: actual OTP verification will be added with backend.
    navigate("/resetpassword", {
      state: { email, otp: enteredOtp },
    });
  };

  const handleResendOtp = () => {
    if (!email) {
      Swal.fire({
        icon: "warning",
        title: "Email Missing",
        text: "Please enter your email first.",
        confirmButtonColor: "#16a085",
      });
      return;
    }

    Swal.fire({
      icon: "info",
      title: "Coming Soon",
      text: "OTP resend functionality will be available after backend integration.",
      confirmButtonColor: "#16a085",
    });
  };

  return (
    <main className="verify-otp-page">
      <style>{`
        .verify-otp-page,
        .verify-otp-page * {
          box-sizing: border-box;
        }

        .verify-otp-page {
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
          .verify-otp-page {
            min-height: calc(100vh - 76px);
            min-height: calc(100svh - 76px);
          }
        }

        .verify-otp-card {
          width: 100%;
          max-width: 440px;
          padding: 40px 35px;
          background: #fff;
          border: 1px solid #dcefe6;
          border-radius: 18px;
          box-shadow: 0 12px 40px rgba(22, 100, 75, 0.10);
        }

        .verify-otp-card h1 {
          margin: 0 0 12px;
          color: #0d414d;
          font-size: 27px;
          font-weight: 700;
          text-align: center;
        }

        .verify-otp-description {
          margin: 0 0 12px;
          color: #71847e;
          font-size: 14px;
          line-height: 1.7;
          text-align: center;
        }

        .verify-otp-email {
          margin-bottom: 28px;
          color: #16a085;
          font-size: 13px;
          font-weight: 600;
          text-align: center;
          overflow-wrap: anywhere;
        }

        .verify-otp-inputs {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 28px;
        }

        .verify-otp-inputs input {
          width: 48px;
          height: 53px;
          border: 1px solid #dcebe5;
          border-radius: 9px;
          outline: none;
          background: #fbfefd;
          color: #173b35;
          font-size: 21px;
          font-weight: 600;
          text-align: center;
        }

        .verify-otp-inputs input:focus {
          border-color: #16a085;
          box-shadow: 0 0 0 3px rgba(22, 160, 133, 0.10);
        }

        .verify-otp-button {
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

        .verify-otp-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 7px 18px rgba(22, 160, 133, 0.22);
        }

        .verify-otp-resend {
          margin-top: 22px;
          color: #71847e;
          font-size: 13px;
          text-align: center;
        }

        .verify-otp-resend button {
          border: none;
          background: none;
          color: #139477;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .verify-otp-resend button:hover {
          color: #0d755e;
        }

        .verify-otp-back {
          display: block;
          margin-top: 20px;
          color: #139477;
          font-size: 13px;
          font-weight: 600;
          text-align: center;
          text-decoration: none;
        }

        .verify-otp-back:hover {
          color: #0d755e;
        }

        @media (max-width: 400px) {
          .verify-otp-card {
            padding: 32px 18px;
          }

          .verify-otp-inputs {
            gap: 7px;
          }

          .verify-otp-inputs input {
            width: 42px;
            height: 49px;
          }
        }
      `}</style>

      <section className="verify-otp-card">
        <h1>Verify OTP</h1>

        <p className="verify-otp-description">
          Enter the 6-digit verification code sent to your registered email.
        </p>

        <div className="verify-otp-email">{email}</div>

        <form onSubmit={handleVerify} noValidate>
          <div className="verify-otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`vol-otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(event) => handleOtpChange(event.target.value, index)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                onPaste={index === 0 ? handlePaste : undefined}
                aria-label={`OTP digit ${index + 1}`}
              />
            ))}
          </div>

          <button type="submit" className="verify-otp-button">
            Verify OTP
          </button>
        </form>

        <div className="verify-otp-resend">
          Didn't receive the code?{" "}
          <button type="button" onClick={handleResendOtp}>
            Resend OTP
          </button>
        </div>

        <Link to="/forgotpassword" className="verify-otp-back">
          ← Back to Forgot Password
        </Link>
      </section>
    </main>
  );
}

export default VerifyOTP;
