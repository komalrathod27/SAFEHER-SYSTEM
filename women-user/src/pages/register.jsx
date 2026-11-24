import React, { useState } from "react";
import Swal from "sweetalert2";
import Axios from "axios";
import { indianStates, cityList } from "../data/locationdata";
import "../safeher-css/register.css";

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

    // Validate Date of Birth
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
    <div className="woman-register-page">
      <div className="woman-register-container">
        <div className="woman-register-card">
          {/* Form Heading */}
          <div className="woman-register-heading">
            <h2>Create Your SafeHer Account</h2>

            <p>Register to access the SafeHer community safety platform.</p>
          </div>

          <form id="registerForm" onSubmit={handleCreateAccount}>
            {/* Full Name */}
            <div className="row">
              <div className="col-lg-12">
                <div className="form-group">
                  <label>Full Name</label>

                  <input
                    type="text"
                    id="fullName"
                    className="form-control"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            </div>

            {/* Email + Password */}
            <div className="row">
              <div className="col-lg-6">
                <div className="form-group">
                  <label>Email Address</label>

                  <input
                    type="email"
                    id="email"
                    className="form-control"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="col-lg-6">
                <div className="form-group">
                  <label>Password</label>

                  <div className="woman-register-password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="form-control"
                      placeholder="Enter your password"
                      value={passwordValue}
                      onChange={(e) => setPasswordValue(e.target.value)}
                    />

                    <button
                      type="button"
                      className="woman-register-show-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  {passwordValue && (
                    <div className="woman-register-strength">
                      <div className="woman-register-strength-bars">
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                          <div
                            key={item}
                            style={{
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
                        className="woman-register-strength-text"
                        style={{
                          color:
                            passwordStrength <= 2
                              ? "#e74c3c"
                              : passwordStrength <= 4
                                ? "#f39c12"
                                : "#27ae60",
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
                <div className="form-group">
                  <label>Contact Number</label>

                  <input
                    type="tel"
                    id="phoneNumber"
                    className="form-control"
                    placeholder="Enter 10 digit number"
                  />
                </div>
              </div>

              <div className="col-lg-6">
                <div className="form-group">
                  <label>Gender</label>

                  <div className="woman-register-gender-options">
                    <label>
                      <input type="radio" name="gender" value="female" />
                      Female
                    </label>

                    <label>
                      <input type="radio" name="gender" value="male" />
                      Male
                    </label>

                    <label>
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
                <div className="form-group">
                  <label>Date of Birth</label>

                  <input type="date" id="dob" className="form-control" />
                </div>
              </div>

              <div className="col-lg-6">
                <div className="form-group">
                  <label>City</label>

                  {selectedCity === "Other" ? (
                    <input
                      type="text"
                      id="city"
                      className="form-control"
                      placeholder="Enter your city"
                      value={otherCity}
                      onChange={(e) => setOtherCity(e.target.value)}
                      maxLength={60}
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
                <div className="form-group">
                  <label>State</label>

                  {selectedState === "Other" ? (
                    <input
                      type="text"
                      id="state"
                      className="form-control"
                      placeholder="Enter your state"
                      value={otherState}
                      onChange={(e) => setOtherState(e.target.value)}
                      maxLength={60}
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
                <div className="form-group">
                  <label>Pincode</label>

                  <input
                    type="text"
                    id="pincode"
                    className="form-control"
                    placeholder="Enter 6 digit pincode"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="row">
              <div className="col-lg-12">
                <div className="form-group">
                  <label>Address</label>

                  <textarea
                    id="address"
                    className="form-control"
                    rows="3"
                    placeholder="Enter your complete address"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Profile Photo */}
            <div className="row">
              <div className="col-lg-12">
                <div className="form-group">
                  <label>Profile Photo</label>

                  <input
                    type="file"
                    id="profilephoto"
                    className="form-control"
                    accept=".jpg,.jpeg,.png"
                  />
                </div>
              </div>
            </div>

            {/* Create Account */}
            <div className="woman-register-submit-wrapper">
              <button
                type="submit"
                className="woman-register-submit"
                disabled={isLoading}
                style={{
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </form>

          {/* Login */}
          <p className="woman-register-login">
            Already have an account? <a href="/login">Login</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
