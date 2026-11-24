import { useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import Axios from "axios";
import "../safeher-css/login.css";

function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
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

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Email",
        text: "Please enter a valid email address.",
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
        token: user.sessionToken,
      };

      localStorage.setItem("mydata", JSON.stringify(session));

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

        <form onSubmit={handleLogin} noValidate>
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
