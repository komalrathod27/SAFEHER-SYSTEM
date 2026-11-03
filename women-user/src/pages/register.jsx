import React, { useState } from "react";
import Swal from "sweetalert2";
import Axios from "axios";
import { indianStates, cityList } from "../data/locationdata";

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const [otherCity, setOtherCity] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [otherState, setOtherState] = useState("");

  const passwordChecks = {
    length: passwordValue.length >= 8,
    uppercase: /[A-Z]/.test(passwordValue),
    lowercase: /[a-z]/.test(passwordValue),
    number: /[0-9]/.test(passwordValue),
    special: /[^A-Za-z0-9\s]/.test(passwordValue),
    noSpaces: /^\S+$/.test(passwordValue),
  };

  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;

  // Create Account
  const handleCreateAccount = (e) => {
    e.preventDefault();
    if (isLoading) return;
    // Get values using ID
    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value.trim();
    const phoneNumber = document.getElementById("phoneNumber").value.trim();
    const gender = document.querySelector('input[name="gender"]:checked');
    const dob = document.getElementById("dob").value.trim();
    const city = selectedCity === "Other" ? otherCity.trim() : selectedCity;
    const state = selectedState === "Other" ? otherState.trim() : selectedState;
    const pincode = document.getElementById("pincode").value.trim();
    const address = document.getElementById("address").value.trim();
    const profilephoto = document.getElementById("profilephoto").files[0];

    // Gender value
    const genderValue = gender ? gender.value : "";

    // Full Name Validation
    if (fullName === "") {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please enter your full name.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // Email Validation
    if (email === "") {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please enter your email address.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email!",
        text: "Please enter a valid email address.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // Password Validation
    if (password.trim() === "") {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please enter your password.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    const strongPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/.test(
        password,
      );

    if (!strongPassword) {
      Swal.fire({
        icon: "error",
        title: "Weak Password!",
        text: "Password must contain at least 8 characters, uppercase, lowercase, number and special character, without spaces.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // Contact Number Validation
    if (phoneNumber === "") {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please enter your contact number.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Contact Number!",
        text: "Please enter a valid 10 digit Indian mobile number.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // Gender Validation
    if (genderValue === "") {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please select your gender.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // Date of Birth Validation
    if (dob === "") {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please select your date of birth.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // Date of Birth Validation
    const [year, month, day] = dob.split("-").map(Number);
    const dobDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isValidDate =
      /^\d{4}-\d{2}-\d{2}$/.test(dob) &&
      year >= 1000 &&
      year <= 9999 &&
      dobDate.getFullYear() === year &&
      dobDate.getMonth() === month - 1 &&
      dobDate.getDate() === day;

    if (!isValidDate || dobDate > today) {
      Swal.fire({
        icon: "error",
        title: "Invalid Date of Birth!",
        text: "Please select a valid date with a 4-digit year. Future dates are not allowed.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // City Validation
    if (!city) {
      Swal.fire({
        icon: "error",
        title: "Missing City!",
        text: "Please select or enter your city.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    if (!/^[a-zA-Z\s.-]+$/.test(city)) {
      Swal.fire({
        icon: "error",
        title: "Invalid City!",
        text: "Please enter a valid city.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // State Validation
    if (!state) {
      Swal.fire({
        icon: "error",
        title: "Missing State!",
        text: "Please select or enter your state.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    if (!/^[a-zA-Z\s.-]+$/.test(state)) {
      Swal.fire({
        icon: "error",
        title: "Invalid State!",
        text: "Please enter a valid state.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // Pincode Validation
    if (pincode === "") {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please enter your pincode.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Pincode!",
        text: "Please enter a valid 6 digit pincode.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // Address Validation
    if (address === "") {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please enter your complete address.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // Profile Photo Validation
    if (!profilephoto) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please upload your profile photo.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // Profile Photo Type Validation
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

    if (!allowedTypes.includes(profilephoto.type)) {
      Swal.fire({
        icon: "error",
        title: "Invalid File Type!",
        text: "Only JPG, JPEG and PNG images are allowed.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // Profile Photo Size Validation (Maximum 2 MB)
    if (profilephoto.size > 2 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "File Too Large!",
        text: "Profile photo size must not exceed 2 MB.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // Create FormData
    const data = new FormData();

    data.append("fullName", fullName);
    data.append("email", email);
    data.append("password", password);
    data.append("phoneNumber", phoneNumber);
    data.append("gender", genderValue);
    data.append("dob", dob);
    data.append("city", city);
    data.append("state", state);
    data.append("pincode", pincode);
    data.append("address", address);
    data.append("profilephoto", profilephoto);

    setIsLoading(true);

    // Send POST request to backend API
    Axios.post("http://localhost:3000/api/womanregister", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then((response) => {
        Swal.fire({
          icon: "success",
          title: "Registration Successful!",
          text: "Your account has been created successfully. Please login to continue.",
          confirmButtonColor: "#287df5",
        }).then(() => {
          window.location = "/login";
        });
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "Registration Failed!",
          text:
            error.response?.data?.message ||
            "Something went wrong. Please try again.",
          confirmButtonColor: "#287df5",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f5f9ff 0%, #fff5fa 100%)",
          padding: "50px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "1050px",
            margin: "0 auto",
          }}
        >
          {/* Registration Card */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "18px",
              padding: "40px 45px",
              boxShadow: "0 12px 40px rgba(35,55,90,0.10)",
              border: "1px solid #edf0f6",
            }}
          >
            {/* Form Heading */}
            <div
              style={{
                marginBottom: "30px",
                borderBottom: "1px solid #edf0f5",
                paddingBottom: "20px",
              }}
            >
              <h2
                style={{
                  margin: "0 0 7px",
                  color: "#172b62",
                  fontSize: "25px",
                  fontWeight: "650",
                  textAlign: "center",
                }}
              >
                Create Your SafeHer Account
              </h2>

              <p
                style={{
                  margin: "0",
                  color: "#7b8497",
                  fontSize: "14px",
                  textAlign: "center",
                }}
              >
                Register to access the SafeHer community safety platform.
              </p>
            </div>

            <form id="registerForm" onSubmit={handleCreateAccount}>
              {/* Full Name */}
              <div className="row">
                <div className="col-lg-12">
                  <div className="form-group" style={{ marginBottom: "22px" }}>
                    <label
                      style={{
                        color: "#26385f",
                        fontWeight: "600",
                        marginBottom: "8px",
                        display: "block",
                      }}
                    >
                      Full Name
                    </label>

                    <input
                      type="text"
                      id="fullName"
                      className="form-control"
                      placeholder="Enter your full name"
                      style={{
                        height: "48px",
                        borderRadius: "8px",
                        border: "1px solid #dce2ec",
                        padding: "10px 14px",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Email + Password */}
              <div className="row">
                <div className="col-lg-6">
                  <div className="form-group" style={{ marginBottom: "22px" }}>
                    <label
                      style={{
                        color: "#26385f",
                        fontWeight: "600",
                        marginBottom: "8px",
                        display: "block",
                      }}
                    >
                      Email Address
                    </label>

                    <input
                      type="email"
                      id="email"
                      className="form-control"
                      placeholder="Enter your email"
                      style={{
                        height: "48px",
                        borderRadius: "8px",
                        border: "1px solid #dce2ec",
                        padding: "10px 14px",
                      }}
                    />
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="form-group" style={{ marginBottom: "22px" }}>
                    <label
                      style={{
                        color: "#26385f",
                        fontWeight: "600",
                        marginBottom: "8px",
                        display: "block",
                      }}
                    >
                      Password
                    </label>

                    <div style={{ position: "relative" }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        className="form-control"
                        placeholder="Enter your password"
                        value={passwordValue}
                        onChange={(e) => setPasswordValue(e.target.value)}
                        style={{
                          height: "48px",
                          borderRadius: "8px",
                          border: "1px solid #dce2ec",
                          padding: "10px 65px 10px 14px",
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          border: "none",
                          background: "transparent",
                          color: "#287df5",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>

                    {passwordValue && (
                      <div style={{ marginTop: "10px" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: "5px",
                            marginBottom: "8px",
                          }}
                        >
                          {[1, 2, 3, 4, 5, 6].map((item) => (
                            <div
                              key={item}
                              style={{
                                height: "5px",
                                flex: 1,
                                borderRadius: "5px",
                                background:
                                  item <= passwordStrength
                                    ? passwordStrength <= 2
                                      ? "#e74c3c"
                                      : passwordStrength <= 4
                                        ? "#f39c12"
                                        : "#27ae60"
                                    : "#e5e7eb",
                              }}
                            />
                          ))}
                        </div>

                        <small
                          style={{
                            color:
                              passwordStrength <= 2
                                ? "#e74c3c"
                                : passwordStrength <= 4
                                  ? "#f39c12"
                                  : "#27ae60",
                            fontWeight: "600",
                          }}
                        >
                          Password Strength:{" "}
                          {passwordStrength <= 2
                            ? "Weak"
                            : passwordStrength <= 4
                              ? "Medium"
                              : passwordStrength === 5
                                ? "Strong"
                                : "Very Strong"}
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact + Gender */}
              <div className="row">
                <div className="col-lg-6">
                  <div className="form-group" style={{ marginBottom: "22px" }}>
                    <label
                      style={{
                        color: "#26385f",
                        fontWeight: "600",
                        marginBottom: "8px",
                        display: "block",
                      }}
                    >
                      Contact Number
                    </label>

                    <input
                      type="tel"
                      id="phoneNumber"
                      className="form-control"
                      placeholder="Enter 10 digit number"
                      style={{
                        height: "48px",
                        borderRadius: "8px",
                        border: "1px solid #dce2ec",
                        padding: "10px 14px",
                      }}
                    />
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="form-group" style={{ marginBottom: "22px" }}>
                    <label
                      style={{
                        color: "#26385f",
                        fontWeight: "600",
                        marginBottom: "10px",
                        display: "block",
                      }}
                    >
                      Gender
                    </label>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "25px",
                        height: "48px",
                      }}
                    >
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "7px",
                          margin: 0,
                          color: "#555f72",
                        }}
                      >
                        <input type="radio" name="gender" value="female" />
                        Female
                      </label>

                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "7px",
                          margin: 0,
                          color: "#555f72",
                        }}
                      >
                        <input type="radio" name="gender" value="male" />
                        Male
                      </label>

                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "7px",
                          margin: 0,
                          color: "#555f72",
                        }}
                      >
                        <input type="radio" name="gender" value="other" />
                        Other
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Date of Birth + City */}
              <div className="row">
                <div className="col-lg-6">
                  <div className="form-group" style={{ marginBottom: "22px" }}>
                    <label
                      style={{
                        color: "#26385f",
                        fontWeight: "600",
                        marginBottom: "8px",
                        display: "block",
                      }}
                    >
                      Date of Birth
                    </label>

                    <input
                      type="date"
                      id="dob"
                      className="form-control"
                      style={{
                        height: "48px",
                        borderRadius: "8px",
                        border: "1px solid #dce2ec",
                        padding: "10px 14px",
                      }}
                    />
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="form-group" style={{ marginBottom: "22px" }}>
                    <label
                      style={{
                        color: "#26385f",
                        fontWeight: "600",
                        marginBottom: "8px",
                        display: "block",
                      }}
                    >
                      City
                    </label>

                    {selectedCity === "Other" ? (
                      <input
                        type="text"
                        id="city"
                        className="form-control"
                        placeholder="Enter your city"
                        value={otherCity}
                        onChange={(e) => setOtherCity(e.target.value)}
                        maxLength={60}
                        style={{
                          height: "48px",
                          borderRadius: "8px",
                          border: "1px solid #dce2ec",
                          padding: "10px 14px",
                        }}
                      />
                    ) : (
                      <select
                        id="city"
                        className="form-control"
                        value={selectedCity}
                        onChange={(e) => {
                          setSelectedCity(e.target.value);
                          setOtherCity("");
                        }}
                        style={{
                          height: "48px",
                          borderRadius: "8px",
                          border: "1px solid #dce2ec",
                          padding: "10px 14px",
                        }}
                      >
                        <option value="">Select City</option>

                        {cityList.map((cityName) => (
                          <option key={cityName} value={cityName}>
                            {cityName}
                          </option>
                        ))}
                        <option value="Other">Other</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* State + Pincode */}
              <div className="row">
                <div className="col-lg-6">
                  <div className="form-group" style={{ marginBottom: "22px" }}>
                    <label
                      style={{
                        color: "#26385f",
                        fontWeight: "600",
                        marginBottom: "8px",
                        display: "block",
                      }}
                    >
                      State
                    </label>

                    {selectedState === "Other" ? (
                      <input
                        type="text"
                        id="state"
                        className="form-control"
                        placeholder="Enter your state"
                        value={otherState}
                        onChange={(e) => setOtherState(e.target.value)}
                        maxLength={60}
                        style={{
                          height: "48px",
                          borderRadius: "8px",
                          border: "1px solid #dce2ec",
                          padding: "10px 14px",
                        }}
                      />
                    ) : (
                      <select
                        id="state"
                        className="form-control"
                        value={selectedState}
                        onChange={(e) => {
                          setSelectedState(e.target.value);
                          setOtherState("");
                        }}
                        style={{
                          height: "48px",
                          borderRadius: "8px",
                          border: "1px solid #dce2ec",
                          padding: "10px 14px",
                        }}
                      >
                        <option value="">Select State</option>

                        {indianStates.map((stateName) => (
                          <option key={stateName} value={stateName}>
                            {stateName}
                          </option>
                        ))}

                        <option value="Other">Other</option>
                      </select>
                    )}
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="form-group" style={{ marginBottom: "22px" }}>
                    <label
                      style={{
                        color: "#26385f",
                        fontWeight: "600",
                        marginBottom: "8px",
                        display: "block",
                      }}
                    >
                      Pincode
                    </label>

                    <input
                      type="text"
                      id="pincode"
                      className="form-control"
                      placeholder="Enter 6 digit pincode"
                      style={{
                        width: "100%",
                        height: "48px",
                        borderRadius: "8px",
                        border: "1px solid #dce2ec",
                        padding: "10px 14px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="row">
                <div className="col-lg-12">
                  <div className="form-group" style={{ marginBottom: "22px" }}>
                    <label
                      style={{
                        color: "#26385f",
                        fontWeight: "600",
                        marginBottom: "8px",
                        display: "block",
                      }}
                    >
                      Address
                    </label>

                    <textarea
                      id="address"
                      className="form-control"
                      rows="3"
                      placeholder="Enter your complete address"
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #dce2ec",
                        padding: "12px 14px",
                        resize: "vertical",
                      }}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Profile Photo */}
              <div className="row">
                <div className="col-lg-12">
                  <div className="form-group" style={{ marginBottom: "28px" }}>
                    <label
                      style={{
                        color: "#26385f",
                        fontWeight: "600",
                        marginBottom: "8px",
                        display: "block",
                      }}
                    >
                      Profile Photo
                    </label>

                    <input
                      type="file"
                      id="profilephoto"
                      className="form-control"
                      accept=".jpg,.jpeg,.png"
                      style={{
                        height: "48px",
                        borderRadius: "8px",
                        border: "1px solid #dce2ec",
                        padding: "8px 12px",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Create Account */}
              <div style={{ textAlign: "center" }}>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    border: "none",
                    borderRadius: "25px",
                    padding: "13px 38px",
                    minWidth: "180px",
                    background: "linear-gradient(90deg, #287df5, #e94b9b)",
                    color: "#ffffff",
                    fontSize: "15px",
                    fontWeight: "600",
                    boxShadow: "0 6px 18px rgba(40,125,245,0.20)",
                    opacity: isLoading ? 0.7 : 1,
                    cursor: isLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </button>
              </div>
            </form>

            {/* Login */}
            <p
              style={{
                textAlign: "center",
                marginTop: "22px",
                marginBottom: "0",
                color: "#70798b",
                fontSize: "14px",
              }}
            >
              Already have an account?{" "}
              <a
                href="/login"
                style={{
                  color: "#287df5",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;
