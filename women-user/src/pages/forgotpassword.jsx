import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      Swal.fire({
        icon: "warning",
        title: "Email Required",
        text: "Please enter your registered email address.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    setIsSubmitting(true);

    // Frontend navigation only. OTP functionality will be added later.
    navigate("/verifyotp", {
      state: { email: trimmedEmail },
    });

    setIsSubmitting(false);
  };

  return (
    <main className="woman-forgot-page">
      <style>{`
        .woman-forgot-page,
        .woman-forgot-page * {
          box-sizing: border-box;
        }

        .woman-forgot-page {
          flex: 1 0 auto;
          min-height: calc(100vh - 88px);
          min-height: calc(100svh - 88px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 38px 20px;
          background:
            radial-gradient(circle at 12% 15%, rgba(40, 125, 245, 0.10), transparent 31%),
            radial-gradient(circle at 88% 85%, rgba(233, 75, 155, 0.10), transparent 32%),
            linear-gradient(135deg, #f5f9ff 0%, #fff5fa 100%);
          font-family: "Poppins", "Segoe UI", sans-serif;
        }

        .woman-forgot-card {
          width: 100%;
          max-width: 460px;
          padding: 36px 40px;
          border: 1px solid #edf0f6;
          border-radius: 20px;
          background: #ffffff;
          box-shadow: 0 18px 48px rgba(35, 55, 90, 0.12);
        }

        .woman-forgot-brand {
          display: flex;
          justify-content: center;
          margin-bottom: 22px;
        }

        .woman-forgot-brand img {
          display: block;
          width: min(100%, 220px);
          height: auto;
        }

        .woman-forgot-icon {
          width: 68px;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          border-radius: 20px;
          background: linear-gradient(135deg, #eaf2ff, #fff0f7);
          color: #287df5;
          font-size: 30px;
        }

        .woman-forgot-title {
          margin: 0;
          color: #172b62;
          font-size: 27px;
          font-weight: 700;
          line-height: 1.3;
          text-align: center;
        }

        .woman-forgot-subtitle {
          margin: 11px auto 28px;
          color: #7b8497;
          font-size: 14px;
          line-height: 1.7;
          text-align: center;
        }

        .woman-forgot-group {
          margin-bottom: 22px;
        }

        .woman-forgot-group label {
          display: block;
          margin-bottom: 8px;
          color: #26385f;
          font-size: 13px;
          font-weight: 700;
        }

        .woman-forgot-input {
          width: 100%;
          height: 50px;
          padding: 0 14px;
          border: 1.5px solid #dce2ec;
          border-radius: 10px;
          outline: none;
          background: #fbfcff;
          color: #172b62;
          font: inherit;
          font-size: 14px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .woman-forgot-input::placeholder {
          color: #a5afbd;
        }

        .woman-forgot-input:focus {
          border-color: #e94b9b;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(233, 75, 155, 0.11);
        }

        .woman-forgot-button {
          width: 100%;
          height: 50px;
          border: 0;
          border-radius: 12px;
          background: linear-gradient(100deg, #287df5 0%, #e94b9b 100%);
          box-shadow: 0 9px 22px rgba(40, 125, 245, 0.2);
          color: #ffffff;
          font: inherit;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .woman-forgot-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 26px rgba(40, 125, 245, 0.28);
        }

        .woman-forgot-button:disabled {
          cursor: wait;
          opacity: 0.75;
        }

        .woman-forgot-back {
          display: block;
          margin-top: 24px;
          color: #287df5;
          font-size: 13px;
          font-weight: 600;
          text-align: center;
          text-decoration: none;
        }

        .woman-forgot-back:hover {
          color: #e94b9b;
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .woman-forgot-page {
            padding: 28px 16px;
          }

          .woman-forgot-card {
            padding: 30px 24px;
            border-radius: 17px;
          }

          .woman-forgot-title {
            font-size: 24px;
          }
        }

        @media (max-height: 700px) {
          .woman-forgot-page {
            align-items: flex-start;
          }
        }
      `}</style>

      <section className="woman-forgot-card">
        <a href="/" className="woman-forgot-brand" aria-label="SafeHer home">
          <img src="/assets/images/all-img/SafeHer logo.png" alt="SafeHer" />
        </a>

        <div className="woman-forgot-icon">
          <i className="mdi mdi-lock-reset" aria-hidden="true"></i>
        </div>

        <h1 className="woman-forgot-title">Forgot Password?</h1>

        <p className="woman-forgot-subtitle">
          Don't worry! Enter your registered email address and we'll help you
          reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="woman-forgot-group">
            <label htmlFor="woman-forgot-email">Registered Email Address</label>

            <input
              id="woman-forgot-email"
              className="woman-forgot-input"
              type="email"
              autoComplete="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="woman-forgot-button"
            disabled={isSubmitting}
          >
            Continue
          </button>
        </form>

        <Link to="/login" className="woman-forgot-back">
          ← Back to Login
        </Link>
      </section>
    </main>
  );
}

export default ForgotPassword;
