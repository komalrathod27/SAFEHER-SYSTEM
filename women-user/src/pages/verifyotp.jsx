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
      Swal.fire(
        "Email Missing",
        "Please enter your email address first.",
        "warning",
      ).then(() => {
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
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
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
    document.getElementById(`otp-${focusIndex}`)?.focus();
  };

  const handleVerify = (event) => {
    event.preventDefault();

    if (!email) {
      Swal.fire("Email Missing", "Please enter your email first.", "warning");
      return;
    }

    const enteredOtp = otp.join("");

    if (!enteredOtp) {
      Swal.fire("OTP Required", "Please enter your OTP.", "warning");
      return;
    }

    if (enteredOtp.length !== 6) {
      Swal.fire("Incomplete OTP", "Please enter all 6 digits.", "warning");
      return;
    }

    if (!/^\d{6}$/.test(enteredOtp)) {
      Swal.fire("Invalid OTP", "OTP must contain exactly 6 digits.", "warning");
      return;
    }

    // Frontend only: actual OTP verification will be added with backend.
    navigate("/resetpassword", {
      state: { email, otp: enteredOtp },
    });
  };

  const handleResendOtp = () => {
    if (!email) {
      Swal.fire("Email Missing", "Please enter your email first.", "warning");
      return;
    }

    Swal.fire(
      "Coming Soon",
      "OTP resend functionality will be available after backend integration.",
      "info",
    );
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
          background: linear-gradient(135deg, #edf4ff, #fff0f7);
          font-family: "Poppins", sans-serif;
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
          border-radius: 18px;
          box-shadow: 0 12px 40px rgba(23, 43, 98, 0.12);
        }

        .verify-otp-card h1 {
          margin: 0 0 12px;
          color: #172b62;
          font-size: 27px;
          font-weight: 700;
          text-align: center;
        }

        .verify-otp-description {
          margin: 0 0 12px;
          color: #777f91;
          font-size: 14px;
          line-height: 1.7;
          text-align: center;
        }

        .verify-otp-email {
          margin-bottom: 28px;
          color: #287df5;
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
          border: 1px solid #dce2ed;
          border-radius: 9px;
          outline: none;
          background: #fbfcff;
          color: #172b62;
          font-size: 21px;
          font-weight: 600;
          text-align: center;
        }

        .verify-otp-inputs input:focus {
          border-color: #287df5;
          box-shadow: 0 0 0 3px rgba(40, 125, 245, 0.1);
        }

        .verify-otp-button {
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

        .verify-otp-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 7px 18px rgba(40, 125, 245, 0.22);
        }

        .verify-otp-resend {
          margin-top: 22px;
          color: #777f91;
          font-size: 13px;
          text-align: center;
        }

        .verify-otp-resend button {
          border: none;
          background: none;
          color: #287df5;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .verify-otp-resend button:hover {
          color: #e94b9b;
        }

        .verify-otp-back {
          display: block;
          margin-top: 20px;
          color: #287df5;
          font-size: 13px;
          font-weight: 600;
          text-align: center;
          text-decoration: none;
        }

        .verify-otp-back:hover {
          color: #e94b9b;
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
                id={`otp-${index}`}
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
