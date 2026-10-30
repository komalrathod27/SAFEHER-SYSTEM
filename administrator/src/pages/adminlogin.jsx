import Swal from "sweetalert2";
import Axios from "axios";

function AdminLogin() {
  const handleLogin = () => {
    const email = document.getElementById("admin-email").value.trim();
    const password = document.getElementById("admin-password").value.trim();

    // Email validation
    if (email === "") {
      Swal.fire({
        icon: "warning",
        title: "Email Required",
        text: "Please enter your email address.",
        confirmButtonColor: "#2f80ed",
      });
      return;
    }

    // Password validation
    if (password === "") {
      Swal.fire({
        icon: "warning",
        title: "Password Required",
        text: "Please enter your password.",
        confirmButtonColor: "#2f80ed",
      });
      return;
    }

    // Admin login
    Axios.post("http://localhost:3000/api/adminlogin", {
      email: email,
      password: password,
    })
      .then((response) => {
        const data = response.data;

        // Only approved/valid admin can enter dashboard
        if (data.status === "Approved") {
          sessionStorage.setItem(
            "mydata",
            JSON.stringify({
              _id: data._id,
              email: data.email,
              token: data.sessionToken,
            }),
          );

          Swal.fire({
            icon: "success",
            title: "Login Successful",
            text: "Welcome, Admin!",
            confirmButtonColor: "#2f80ed",
          }).then(() => {
            window.location.href = "/dashboard";
          });
        } else {
          // Safety check
          Swal.fire({
            icon: "error",
            title: "Login Failed",
            text: "Invalid email or password.",
            confirmButtonColor: "#2f80ed",
          });
        }
      })
      .catch((error) => {
        const data = error.response?.data;

        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: data?.message || "Invalid email or password.",
          confirmButtonColor: "#2f80ed",
        });
      });
  };

  return (
    <div className="admin-login">
      <style>{`
        .admin-login,
        .admin-login * {
          box-sizing: border-box;
        }

        .admin-login {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 35px 20px;
          font-family: "Inter", sans-serif;

          background:
            radial-gradient(
              circle at 10% 15%,
              rgba(47,128,237,0.12),
              transparent 30%
            ),
            radial-gradient(
              circle at 90% 85%,
              rgba(23,37,84,0.10),
              transparent 30%
            ),
            linear-gradient(
              135deg,
              #f4f7ff 0%,
              #f9fbff 100%
            );
        }

        .admin-card {
          width: 100%;
          max-width: 450px;
          padding: 38px 40px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          box-shadow: 0 18px 45px rgba(23,37,84,0.10);
        }

        /* BRAND */

        .admin-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          text-decoration: none;
        }

        .admin-brand img {
          width: 290px;
          height: auto;
        }

        /* HEADING */

        .admin-title {
          margin: 0;
          text-align: center;
          color: #172554;
          font-size: 29px;
          font-weight: 700;
        }

        .admin-subtitle {
          max-width: 350px;
          margin: 8px auto 28px;
          text-align: center;
          color: #718096;
          font-size: 14px;
          line-height: 1.65;
        }

        /* FORM */

        .admin-group {
          margin-bottom: 18px;
        }

        .admin-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          font-weight: 700;
          color: #172554;
        }

        .admin-input {
          width: 100%;
          height: 48px;
          padding: 0 14px;
          border: 1.5px solid #dce3ee;
          border-radius: 10px;
          outline: none;
          background: #fbfcff;
          color: #172554;
          font-size: 14px;
          transition: 0.25s;
        }

        .admin-input::placeholder {
          color: #a5afbd;
        }

        .admin-input:focus {
          border-color: #2f80ed;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(47,128,237,0.10);
        }

        /* OPTIONS */

        .admin-options {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 5px 0 22px;
          font-size: 13px;
        }

        .admin-link {
          color: #2f80ed;
          text-decoration: none;
          font-weight: 600;
        }

        .admin-link:hover {
          color: #172554;
          text-decoration: underline;
        }

        /* LOGIN BUTTON */

        .admin-login-btn {
          width: 100%;
          height: 49px;
          border: none;
          border-radius: 10px;

          background: linear-gradient(
            135deg,
            #172554,
            #2f80ed
          );

          color: #ffffff;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;

          box-shadow: 0 9px 22px rgba(47,128,237,0.20);
          transition: 0.25s;
        }

        .admin-login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 26px rgba(47,128,237,0.28);
        }

        /* FOOTER */

        .admin-footer {
          margin: 24px 0 0;
          text-align: center;
          color: #8995a5;
          font-size: 13px;
        }

        .admin-footer strong {
          color: #172554;
        }

        .admin-alert {
          padding: 25px !important;
          border-radius: 15px !important;
        }

        .admin-alert .swal2-icon {
          margin: 0 auto 15px !important;
          width: 95px !important;
          height: 95px !important;
        }

        .admin-alert .swal2-title {
          font-size: 35px !important;
        }

        .admin-alert .swal2-html-container {
          font-size: 18px !important;
          margin: 2px 0 0px !important;
        }

        .admin-alert .swal2-actions {
           margin-top: 15px !important;
        }

        /* RESPONSIVE */

        @media (max-width: 500px) {
          .admin-card {
            padding: 30px 22px;
          }

          .admin-brand img {
            width: 240px;
          }

          .admin-title {
            font-size: 25px;
          }

          .admin-options {
            font-size: 12px;
          }
        }
      `}</style>

      <div className="admin-card">
        {/* SafeHer Logo */}
        <a href="/" className="admin-brand">
          <img src="/images/SafeHer logo.png" alt="SafeHer" />
        </a>

        {/* Admin Title */}
        <h1 className="admin-title">Welcome, Admin</h1>
        <br />
        <br />
        <form>
          {/* Email */}
          <div className="admin-group">
            <label htmlFor="admin-email">Email Address</label>

            <input
              id="admin-email"
              type="email"
              className="admin-input"
              placeholder="Enter your email address"
            />
          </div>

          {/* Password */}
          <div className="admin-group">
            <label htmlFor="admin-password">Password</label>

            <input
              id="admin-password"
              type="password"
              className="admin-input"
              placeholder="Enter your password"
            />
          </div>

          {/* Login */}
          <button
            type="button"
            className="admin-login-btn"
            onClick={handleLogin}
          >
            Login
          </button>

          {/* Footer */}
          <p className="admin-footer">
            <strong>SafeHer</strong> · Admin Access Only
          </p>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
