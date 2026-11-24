import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const role = location.state?.role || "woman";
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [expiresAt, setExpiresAt] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [otpStatus, setOtpStatus] = useState("loading");
  const [attempts, setAttempts] = useState(0);
  const [generationCount, setGenerationCount] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState(null);
  const [cooldownSecondsLeft, setCooldownSecondsLeft] = useState(0);
  const [isStatusLoading, setIsStatusLoading] = useState(true);

  const resetTokenKey = `safeher_reset_${role}_${email.toLowerCase()}`;

  const fetchOtpStatus = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/forgot-password/status",
        {
          params: { email, role },
        },
      );

      const data = response.data;
      if (!data.exists) {
        setOtpStatus("not_requested");
        setAttempts(0);
        setGenerationCount(0);
        setExpiresAt(null);
        setCooldownUntil(null);
        return data;
      }
      setOtpStatus(data.otpStatus);
      setAttempts(data.attempts);
      setGenerationCount(data.generationCount);

      const expiryTime = data.expiresAt
        ? new Date(data.expiresAt).getTime()
        : null;

      const cooldownTime = data.cooldownUntil
        ? new Date(data.cooldownUntil).getTime()
        : null;
      setExpiresAt(expiryTime);
      setCooldownUntil(cooldownTime);

      // If OTP was already verified, restore reset authorization
      if (data.otpStatus === "verified") {
        const savedToken = sessionStorage.getItem(resetTokenKey);
        if (savedToken) {
          navigate("/resetpassword", {
            replace: true,
            state: {
              email,
              role,
              resetToken: savedToken,
            },
          });
        }
      }
      return data;
    } catch (error) {
      console.error("OTP Status Error:", error);
      setOtpStatus("error");

      throw error;
    } finally {
      setIsStatusLoading(false);
    }
  };

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

  useEffect(() => {
    if (!email) return;

    fetchOtpStatus().catch(() => {
      Swal.fire(
        "Unable to Load OTP Status",
        "Please refresh the page or try again later.",
        "error",
      );
    });
  }, [email, role]);

  useEffect(() => {
    const updateTimers = () => {
      const now = Date.now();
      const remainingOTP = expiresAt
        ? Math.max(0, Math.ceil((expiresAt - now) / 1000))
        : 0;
      const remainingCooldown = cooldownUntil
        ? Math.max(0, Math.ceil((cooldownUntil - now) / 1000))
        : 0;

      setSecondsLeft(remainingOTP);
      setCooldownSecondsLeft(remainingCooldown);
    };
    updateTimers();
    const timer = setInterval(updateTimers, 1000);
    return () => clearInterval(timer);
  }, [expiresAt, cooldownUntil]);

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

    const updatedOtp = [
      ...pastedDigits.split(""),
      ...Array(6 - pastedDigits.length).fill(""),
    ];
    setOtp(updatedOtp);
    const focusIndex = Math.min(pastedDigits.length, 5);
    document.getElementById(`otp-${focusIndex}`)?.focus();
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    if (!email) {
      Swal.fire("Email Missing", "Please enter your email first.", "warning");
      return;
    }

    if (isStatusLoading || otpStatus !== "pending" || secondsLeft <= 0) {
      Swal.fire(
        "OTP Unavailable",
        "Your OTP is expired or unavailable. Please request a new OTP.",
        "warning",
      );
      return;
    }
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6 || !/^\d{6}$/.test(enteredOtp)) {
      Swal.fire(
        "Invalid OTP",
        "Please enter all 6 digits of your OTP.",
        "warning",
      );
      return;
    }

    if (secondsLeft <= 0) {
      Swal.fire(
        "OTP Expired",
        "Your OTP has expired. Please request a new OTP.",
        "warning",
      );
      return;
    }

    if (isVerifying) return;
    try {
      setIsVerifying(true);

      const response = await axios.post(
        "http://localhost:3000/api/forgot-password/verify-otp",
        {
          email,
          role,
          otp: enteredOtp,
        },
      );

      if (response.data.success) {
        const resetToken = response.data.resetToken;

        // Preserve reset authorization across page refresh
        sessionStorage.setItem(resetTokenKey, resetToken);
        await Swal.fire(
          "OTP Verified",
          "Your email has been verified successfully.",
          "success",
        );

        navigate("/resetpassword", {
          state: {
            email,
            role,
            resetToken: response.data.resetToken,
          },
        });
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Unable to verify OTP. Please try again.";
      setOtp(["", "", "", "", "", ""]);

      // Refresh attempts and OTP status from MongoDB
      try {
        await fetchOtpStatus();
      } catch (statusError) {
        console.error("Unable to refresh OTP status:", statusError);
      }
      Swal.fire("OTP Verification Failed", message, "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (
      !email ||
      secondsLeft > 0 ||
      cooldownSecondsLeft > 0 ||
      isResending ||
      otpStatus === "verified"
    ) {
      return;
    }
    try {
      setIsResending(true);
      const response = await axios.post(
        "http://localhost:3000/api/forgot-password/send-otp",
        {
          email,
          role,
        },
      );
      if (response.data.success) {
        const data = response.data;
        //clear prvious otp digits
        setOtp(["", "", "", "", "", ""]);

        // Restore the newly generated OTP status
        setOtpStatus(data.otpStatus);
        setAttempts(data.attempts);
        setGenerationCount(data.generationCount);

        // Restore the actual expiry saved in MongoDB
        setExpiresAt(
          data.expiresAt ? new Date(data.expiresAt).getTime() : null,
        );

        setCooldownUntil(
          data.cooldownUntil ? new Date(data.cooldownUntil).getTime() : null,
        );

        await Swal.fire(
          "OTP Sent",
          "A new OTP has been sent to your registered email address.",
          "success",
        );
        document.getElementById("otp-0")?.focus();
      }
    } catch (error) {
      // Refresh status if resend fails
      try {
        await fetchOtpStatus();
      } catch (statusError) {
        console.error("Unable to refresh OTP status:", statusError);
      }

      Swal.fire(
        "Unable to Resend OTP",
        error.response?.data?.message ||
          "Something went wrong. Please try again later.",
        "error",
      );
    } finally {
      setIsResending(false);
    }
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
          display: block;
          width: 90%;
          height: 46px;
          margin: 0 auto;
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

        .verify-otp-timer {
          margin-top: -18px;
          margin-bottom: 25px;
          color: #777f91;
          font-size: 13px;
          text-align: center;
        }

        .verify-otp-timer strong {
          color: #e94b9b;
          font-weight: 700;
        }

        .verify-otp-resend button:disabled {
          color: #a6adbb;
          cursor: not-allowed;
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
        <div className="verify-otp-timer">
          {isStatusLoading ? (
            <span>Loading OTP status...</span>
          ) : otpStatus === "error" ? (
            <span>Unable to load OTP status. Please refresh.</span>
          ) : otpStatus === "verified" ? (
            <span>OTP already verified.</span>
          ) : secondsLeft > 0 ? (
            <>
              OTP expires in:{" "}
              <strong>00:{String(secondsLeft).padStart(2, "0")}</strong>
            </>
          ) : cooldownSecondsLeft > 0 ? (
            <span>
              Resend available after:{" "}
              <strong>
                {Math.floor(cooldownSecondsLeft / 3600)}h{" "}
                {Math.floor((cooldownSecondsLeft % 3600) / 60)}m{" "}
                {cooldownSecondsLeft % 60}s
              </strong>
            </span>
          ) : (
            <span>OTP expired. You can request a new OTP.</span>
          )}
        </div>
        <p className="verify-otp-description">
          Incorrect attempts: {attempts}/5
        </p>

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
                disabled={
                  isStatusLoading ||
                  otpStatus !== "pending" ||
                  secondsLeft === 0 ||
                  isVerifying
                }
              />
            ))}
          </div>

          <button
            type="submit"
            className="verify-otp-button"
            disabled={
              isStatusLoading ||
              isVerifying ||
              isResending ||
              otpStatus !== "pending" ||
              secondsLeft <= 0
            }
          >
            {isVerifying ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="verify-otp-resend">
          Didn't receive the code?{" "}
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={
              isStatusLoading ||
              isResending ||
              otpStatus === "verified" ||
              otpStatus === "error" ||
              secondsLeft > 0 ||
              cooldownSecondsLeft > 0
            }
          >
            {isResending ? "Sending..." : "Resend OTP"}
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
