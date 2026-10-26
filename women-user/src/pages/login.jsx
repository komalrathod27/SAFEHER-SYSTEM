import React from "react";
import Swal from "sweetalert2";
import Axios from "axios";

function Login() {
  // Handle Login
  const handleLogin = () => {
    // Get values using ID
    const identifier = document.getElementById("identifier").value;
    const password = document.getElementById("password").value;

    // Username / Email validation
    if (identifier.trim() === "") {
      Swal.fire({
        icon: "warning",
        title: "Required Field",
        text: "Please enter your username or email address.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // Password required validation
    if (password.trim() === "") {
      Swal.fire({
        icon: "warning",
        title: "Required Field",
        text: "Please enter your password.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // Password length validation
    if (password.length !== 6) {
      Swal.fire({
        icon: "error",
        title: "Invalid Password",
        text: "Password must be exactly 6 characters long.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // Later, add your Axios / Fetch API call here
    Axios.post("http://localhost:3000/api/womanlogin", { identifier, password })
      .then((response) => {
        const user = response.data;

        if (!user || !user._id) {
          Swal.fire({
            icon: "error",
            title: "Login Failed",
            text: "Invalid email or password.",
            confirmButtonColor: "#287df5",
          });
          return;
        }

        const data = {
          user_id: user._id,
          email: user.email,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber || "",
        };

        localStorage.setItem("mydata", JSON.stringify(data));

        Swal.fire({
          icon: "success",
          title: "Login Successful",
          text: `Welcome, ${user.fullName}!`,
        }).then(() => {
          window.location = "/";
        });
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text:
            error.response?.data?.message ||
            error.message ||
            `Invalid Email or Password. Please try again.`,
          confirmButtonColor: "#287df5",
        });
      });
  };

  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f5f9ff 0%, #fff5fa 100%)",
          padding: "70px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "550px",
          }}
        >
          {/* Login Card */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "18px",
              padding: "40px",
              boxShadow: "0 12px 40px rgba(35,55,90,0.10)",
              border: "1px solid #edf0f6",
            }}
          >
            {/* Heading */}
            <div
              style={{
                textAlign: "center",
                marginBottom: "30px",
              }}
            >
              <h2
                style={{
                  margin: "0 0 8px",
                  color: "#172b62",
                  fontSize: "25px",
                  fontWeight: "700",
                }}
              >
                Welcome Back
              </h2>

              <p
                style={{
                  margin: "0",
                  color: "#7b8497",
                  fontSize: "14px",
                }}
              >
                Login to continue to your SafeHer account.
              </p>
            </div>

            {/* Login Fields - No Form Tag */}

            {/* Username / Email */}
            <div
              style={{
                marginBottom: "22px",
              }}
            >
              <label
                htmlFor="identifier"
                style={{
                  display: "block",
                  color: "#26385f",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                Username or Email
              </label>

              <input
                type="text"
                id="identifier"
                className="form-control"
                placeholder="Enter username or email"
                style={{
                  height: "50px",
                  borderRadius: "8px",
                  border: "1px solid #dce2ec",
                  padding: "10px 14px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Password */}
            <div
              style={{
                marginBottom: "25px",
              }}
            >
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  color: "#26385f",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                Password
              </label>

              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="Enter your password"
                style={{
                  height: "50px",
                  borderRadius: "8px",
                  border: "1px solid #dce2ec",
                  padding: "10px 14px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Login Button */}
            <div
              style={{
                textAlign: "center",
                marginBottom: "22px",
              }}
            >
              <button
                type="button"
                onClick={handleLogin}
                name="submit"
                style={{
                  width: "100%",
                  height: "48px",
                  border: "none",
                  borderRadius: "25px",
                  background: "linear-gradient(90deg, #287df5, #e94b9b)",
                  color: "#ffffff",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 6px 18px rgba(40,125,245,0.20)",
                }}
              >
                Login
              </button>
            </div>

            {/* Register Link */}
            <p
              style={{
                textAlign: "center",
                margin: "0",
                color: "#70798b",
                fontSize: "14px",
              }}
            >
              Don't have an account?{" "}
              <a
                href="/register"
                style={{
                  color: "#287df5",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                Register Now
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
