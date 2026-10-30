import { useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import Axios from "axios";

const REMEMBERED_EMAIL_KEY = "safeherRememberedWomanEmail";

function Login() {
  const [identifier, setIdentifier] = useState(
    () => localStorage.getItem(REMEMBERED_EMAIL_KEY) || "",
  );
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(() =>
    Boolean(localStorage.getItem(REMEMBERED_EMAIL_KEY)),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    const email = identifier.trim();

    if (!email) {
      Swal.fire({
        icon: "warning",
        title: "Email Required",
        text: "Please enter your email address.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    if (!password.trim()) {
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
        icon: "error",
        title: "Invalid Password",
        text: "Password must be exactly 6 characters long.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await Axios.post(
        "http://localhost:3000/api/womanlogin",
        { identifier: email, password },
      );
      const user = response.data;

      if (!user?._id) {
        throw new Error("Invalid email or password.");
      }

      const session = {
        user_id: user._id,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber || "",
      };

      localStorage.setItem("mydata", JSON.stringify(session));

      if (rememberMe) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }

      await Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: `Welcome, ${user.fullName}!`,
        confirmButtonColor: "#287df5",
      });
      window.location.href = "/";
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text:
          error.response?.data?.message ||
          error.message ||
          "Invalid email or password. Please try again.",
        confirmButtonColor: "#287df5",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="woman-login-page">
      <style>{`
        .woman-login-page,
        .woman-login-page * {
          box-sizing: border-box;
        }

        .woman-login-page {
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

        .woman-login-card {
          width: 100%;
          max-width: 460px;
          padding: 34px 40px;
          border: 1px solid #edf0f6;
          border-radius: 20px;
          background: #ffffff;
          box-shadow: 0 18px 48px rgba(35, 55, 90, 0.12);
        }

        .woman-login-brand {
          display: flex;
          justify-content: center;
          margin-bottom: 18px;
        }

        .woman-login-brand img {
          display: block;
          width: min(100%, 220px);
          height: auto;
        }

        .woman-login-title {
          margin: 0;
          color: #172b62;
          font-size: 28px;
          font-weight: 700;
          line-height: 1.25;
          text-align: center;
        }

        .woman-login-subtitle {
          margin: 9px auto 27px;
          color: #7b8497;
          font-size: 14px;
          line-height: 1.6;
          text-align: center;
        }

        .woman-login-group {
          margin-bottom: 18px;
        }

        .woman-login-group label {
          display: block;
          margin-bottom: 8px;
          color: #26385f;
          font-size: 13px;
          font-weight: 700;
        }

        .woman-login-input {
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

        .woman-login-input::placeholder {
          color: #a5afbd;
        }

        .woman-login-input:focus {
          border-color: #e94b9b;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(233, 75, 155, 0.11);
        }

        .woman-login-options {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin: 2px 0 22px;
          color: #718096;
          font-size: 13px;
        }

        .woman-login-remember {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          cursor: pointer;
        }

        .woman-login-remember input {
          width: 15px;
          height: 15px;
          margin: 0;
          accent-color: #e94b9b;
        }

        .woman-login-forgot {
          padding: 0;
          border: 0;
          background: none;
          color: #287df5;
          font: inherit;
          font-weight: 600;
          cursor: pointer;
        }

        .woman-login-forgot:hover {
          color: #e94b9b;
          text-decoration: underline;
        }

        .woman-login-button {
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

        .woman-login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 26px rgba(40, 125, 245, 0.28);
        }

        .woman-login-button:disabled {
          cursor: wait;
          opacity: 0.75;
        }

        .woman-login-register {
          margin: 22px 0 0;
          color: #70798b;
          font-size: 13px;
          text-align: center;
        }

        .woman-login-register a {
          color: #287df5;
          font-weight: 700;
          text-decoration: none;
        }

        .woman-login-register a:hover {
          color: #e94b9b;
          text-decoration: underline;
        }

        @media (max-width: 991px) {
          .woman-login-page {
            min-height: calc(100vh - 76px);
            min-height: calc(100svh - 76px);
          }
        }

        @media (max-width: 480px) {
          .woman-login-page {
            padding: 28px 16px;
          }

          .woman-login-card {
            padding: 30px 24px;
            border-radius: 17px;
          }

          .woman-login-title {
            font-size: 25px;
          }

          .woman-login-options {
            font-size: 12px;
          }
        }

        @media (max-height: 700px) {
          .woman-login-page {
            align-items: flex-start;
          }
        }
      `}</style>

      <section className="woman-login-card" aria-labelledby="woman-login-title">
        <a href="/" className="woman-login-brand" aria-label="SafeHer home">
          <img src="/assets/images/all-img/SafeHer logo.png" alt="SafeHer" />
        </a>

        <h1 className="woman-login-title" id="woman-login-title">
          Welcome Back
        </h1>
        <p className="woman-login-subtitle">
          Login to continue to your SafeHer account.
        </p>

        <form onSubmit={handleLogin}>
          <div className="woman-login-group">
            <label htmlFor="woman-login-email">Email Address</label>
            <input
              id="woman-login-email"
              className="woman-login-input"
              type="email"
              autoComplete="email"
              placeholder="Enter your email address"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              required
            />
          </div>

          <div className="woman-login-group">
            <label htmlFor="woman-login-password">Password</label>
            <input
              id="woman-login-password"
              className="woman-login-input"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <div className="woman-login-options">
            <label className="woman-login-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              Remember me
            </label>

            <Link to="/forgotpassword" className="woman-login-forgot">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="woman-login-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="woman-login-register">
          Don&apos;t have an account? <a href="/register">Register Now</a>
        </p>
      </section>
    </main>
  );
}

export default Login;
