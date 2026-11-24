import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import Axios from "axios";

function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const email =
    location.state?.email ||
    sessionStorage.getItem("volunteer_forgot_password_email") ||
    "";
  const role = "volunteer";
  const resetTokenKey = `safeher_reset_${role}_${email.toLowerCase()}`;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const [expiresAt, setExpiresAt] = useState(null);
  const [cooldownUntil, setCooldownUntil] = useState(null);

  const [otpStatus, setOtpStatus] = useState("loading");
  const [attempts, setAttempts] = useState(0);
  const [generationCount, setGenerationCount] = useState(0);

  const [isStatusLoading, setIsStatusLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // ================= UPDATE OTP STATUS =================
  const updateOtpStatus = (data) => {
    setOtpStatus(data.otpStatus || "not_requested");
    setAttempts(data.attempts || 0);
    setGenerationCount(data.generationCount || 0);
    setExpiresAt(data.expiresAt || null);
    setCooldownUntil(data.cooldownUntil || null);
  };

  // ================= FETCH OTP STATUS =================
  const fetchOtpStatus = async () => {
    try {
      const response = await Axios.get(
        "http://localhost:3000/api/forgot-password/status",
        {
          params: {
            email: email.trim().toLowerCase(),
            role,
          },
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

      updateOtpStatus(data);

      // Restore reset authorization after refreshing the page
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
      setOtpStatus("error");
      console.error("Unable to fetch OTP status:", error);
      throw error;
    } finally {
      setIsStatusLoading(false);
    }
  };

  // ================= INITIAL OTP STATUS =================
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

      return;
    }

    sessionStorage.setItem("volunteer_forgot_password_email", email);

    fetchOtpStatus().catch(() => {
      Swal.fire({
        icon: "error",
        title: "Unable to Load Status",
        text: "Unable to retrieve OTP status. Please try again.",
        confirmButtonColor: "#16a085",
      });
    });
  }, [email, navigate]);

  // ================= OTP & COOLDOWN TIMER =================
  useEffect(() => {
    const updateTimers = () => {
      const now = Date.now();

      const otpRemaining = expiresAt
        ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - now) / 1000))
        : 0;

      const cooldownRemaining = cooldownUntil
        ? Math.max(
            0,
            Math.ceil((new Date(cooldownUntil).getTime() - now) / 1000),
          )
        : 0;

      setSecondsLeft(otpRemaining);
      setCooldownSeconds(cooldownRemaining);
    };

    updateTimers();

    const timer = setInterval(updateTimers, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, cooldownUntil]);

  // ================= OTP INPUT CHANGE =================
  const handleOtpChange = (value, index) => {
    const digit = value.replace(/\D/g, "").slice(-1);

    const updatedOtp = [...otp];
    updatedOtp[index] = digit;

    setOtp(updatedOtp);

    if (digit && index < 5) {
      document.getElementById(`vol-otp-${index + 1}`)?.focus();
    }
  };

  // ================= BACKSPACE NAVIGATION =================
  const handleKeyDown = (event, index) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`vol-otp-${index - 1}`)?.focus();
    }
  };

  // ================= PASTE OTP =================
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

  // ================= VERIFY OTP =================
  const handleVerify = async (event) => {
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

    if (isStatusLoading || otpStatus !== "pending" || secondsLeft <= 0) {
      Swal.fire({
        icon: "warning",
        title: "OTP Unavailable",
        text: "Your OTP is expired or unavailable. Please request a new one.",
        confirmButtonColor: "#16a085",
      });
      return;
    }

    const enteredOtp = otp.join("");

    if (!/^\d{6}$/.test(enteredOtp)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid OTP",
        text: "Please enter all 6 digits of your OTP.",
        confirmButtonColor: "#16a085",
      });
      return;
    }

    if (isVerifying) return;

    setIsVerifying(true);

    try {
      const response = await Axios.post(
        "http://localhost:3000/api/forgot-password/verify-otp",
        {
          email: email.trim().toLowerCase(),
          role,
          otp: enteredOtp,
        },
      );

      const resetToken = response.data.resetToken;

      if (!resetToken) {
        throw new Error("Password reset authorization was not received.");
      }

      // Save reset token separately from the login session
      sessionStorage.setItem(resetTokenKey, resetToken);

      await Swal.fire({
        icon: "success",
        title: "OTP Verified",
        text: "Your OTP has been verified successfully.",
        confirmButtonColor: "#16a085",
      });

      navigate("/resetpassword", {
        state: {
          email,
          role,
          resetToken,
        },
      });
    } catch (error) {
      setOtp(["", "", "", "", "", ""]);

      try {
        await fetchOtpStatus();
      } catch (statusError) {
        console.error("Unable to refresh OTP status:", statusError);
      }

      Swal.fire({
        icon: "error",
        title: "Verification Failed",
        text:
          error.response?.data?.message ||
          error.message ||
          "Unable to verify OTP. Please try again.",
        confirmButtonColor: "#16a085",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // ================= RESEND OTP =================
  const handleResendOtp = async () => {
    if (
      !email ||
      isResending ||
      isStatusLoading ||
      secondsLeft > 0 ||
      cooldownSeconds > 0 ||
      otpStatus === "verified"
    ) {
      return;
    }

    setIsResending(true);

    try {
      const response = await Axios.post(
        "http://localhost:3000/api/forgot-password/send-otp",
        {
          email: email.trim().toLowerCase(),
          role,
        },
      );

      updateOtpStatus(response.data);

      setOtp(["", "", "", "", "", ""]);

      await Swal.fire({
        icon: "success",
        title: "OTP Sent",
        text:
          response.data.message ||
          "A new verification code has been sent to your email.",
        confirmButtonColor: "#16a085",
      });

      document.getElementById("vol-otp-0")?.focus();
    } catch (error) {
      try {
        await fetchOtpStatus();
      } catch (statusError) {
        console.error("Unable to refresh OTP status:", statusError);
      }

      Swal.fire({
        icon: "error",
        title: "Unable to Resend OTP",
        text:
          error.response?.data?.message ||
          "Something went wrong. Please try again later.",
        confirmButtonColor: "#16a085",
      });
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

        .verify-otp-resend button:disabled {
          color: #a0aaa6;
          cursor: not-allowed;
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
                disabled={
                  isStatusLoading ||
                  otpStatus !== "pending" ||
                  secondsLeft <= 0 ||
                  isVerifying
                }
              />
            ))}
          </div>

          <p
            style={{
              textAlign: "center",
              color: secondsLeft === 0 ? "#e74c3c" : "#71847e",
              fontSize: "13px",
              marginBottom: "10px",
            }}
          >
            {isStatusLoading
              ? "Checking OTP status..."
              : otpStatus === "error"
                ? "Unable to check OTP status."
                : cooldownSeconds > 0
                  ? "Maximum OTP limit reached. Please try again after 24 hours."
                  : secondsLeft > 0
                    ? `OTP expires in 00:${String(secondsLeft).padStart(2, "0")}`
                    : otpStatus === "locked"
                      ? "Maximum attempts reached. Request a new OTP."
                      : otpStatus === "verified"
                        ? "OTP already verified."
                        : "OTP expired. Please request a new one."}
          </p>

          <p
            style={{
              textAlign: "center",
              color: "#71847e",
              fontSize: "12px",
              marginBottom: "18px",
            }}
          >
            Attempts used: {attempts}/5
          </p>

          <button
            type="submit"
            className="verify-otp-button"
            disabled={
              isStatusLoading ||
              otpStatus !== "pending" ||
              secondsLeft <= 0 ||
              isVerifying
            }
          >
            {isVerifying ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="verify-otp-resend">
          {cooldownSeconds > 0 ? (
            <>
              Maximum OTP limit reached. Try again after{" "}
              <strong>
                {Math.floor(cooldownSeconds / 3600)}h{" "}
                {Math.floor((cooldownSeconds % 3600) / 60)}m{" "}
                {cooldownSeconds % 60}s
              </strong>
            </>
          ) : (
            <>
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={
                  isStatusLoading ||
                  isResending ||
                  secondsLeft > 0 ||
                  cooldownSeconds > 0 ||
                  otpStatus === "verified"
                }
              >
                {isResending ? "Sending..." : "Resend OTP"}
              </button>
            </>
          )}
        </div>
        <Link to="/forgotpassword" className="verify-otp-back">
          ← Back to Forgot Password
        </Link>
      </section>
    </main>
  );
}

export default VerifyOTP;
