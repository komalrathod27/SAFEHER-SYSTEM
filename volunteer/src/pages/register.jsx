import React, { useState } from "react";
import Swal from "sweetalert2";
import Axios from "axios";
import { indianStates, cityList, serviceAreaMap } from "../data/locationdata";

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [otherCity, setOtherCity] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [otherState, setOtherState] = useState("");
  const [selectedQualification, setSelectedQualification] = useState("");
  const [otherQualification, setOtherQualification] = useState("");
  const [selectedServiceArea, setSelectedServiceArea] = useState("");
  const [otherServiceArea, setOtherServiceArea] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const qualificationOptions = [
    "10th Pass",
    "12th Pass",
    "Diploma",
    "Undergraduate",
    "Graduate",
    "Postgraduate",
    "Other",
  ];

  const passwordChecks = {
    length: passwordValue.length >= 8,
    uppercase: /[A-Z]/.test(passwordValue),
    lowercase: /[a-z]/.test(passwordValue),
    number: /[0-9]/.test(passwordValue),
    special: /[^A-Za-z0-9\s]/.test(passwordValue),
    noSpaces: /^\S+$/.test(passwordValue),
  };

  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const contact = document.getElementById("contact").value;
    const gender = document.getElementById("gender").value;
    const dob = document.getElementById("dob").value;
    const city = selectedCity === "Other" ? otherCity.trim() : selectedCity;
    const state = selectedState === "Other" ? otherState.trim() : selectedState;
    const pincode = document.getElementById("pincode").value;
    const address = document.getElementById("address").value;
    const profilePhoto = document.getElementById("profilePhoto").files[0];
    const qualification =
      selectedQualification === "Other"
        ? otherQualification.trim()
        : selectedQualification;
    const serviceArea =
      selectedCity === "Other" || selectedServiceArea === "Other"
        ? otherServiceArea.trim()
        : selectedServiceArea;
    const idProofType = document.getElementById("idProofType").value;
    const idProof = document.getElementById("idProof").files[0];
    const reason = document.getElementById("reason").value;

    if (name.trim() === "") {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please enter your full name.",
        confirmButtonColor: "#18a889",
      });
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (email.trim() === "") {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please enter your email address.",
        confirmButtonColor: "#18a889",
      });
      return;
    }

    if (!emailRegex.test(email.trim())) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address.",
        confirmButtonColor: "#18a889",
      });
      return;
    }

    // Password Validation
    if (password.trim() === "") {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please enter your password.",
        confirmButtonColor: "#18a889",
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
        confirmButtonColor: "#18a889",
      });
      return;
    }

    if (contact.trim() === "") {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please enter your contact number.",
        confirmButtonColor: "#18a889",
      });
      return;
    }

    if (!/^[6-9]\d{9}$/.test(contact.trim())) {
      Swal.fire({
        icon: "error",
        title: "Invalid Contact Number",
        text: "Please enter a valid 10-digit Indian mobile number.",
        confirmButtonColor: "#18a889",
      });
      return;
    }

    if (gender === "") {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please select your gender.",
        confirmButtonColor: "#18a889",
      });
      return;
    }

    if (dob === "") {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please select your date of birth.",
        confirmButtonColor: "#18a889",
      });
      return;
    }

    const [year, month, day] = dob.split("-").map(Number);
    const birthDate = new Date(year, month - 1, day);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ageLimit = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate(),
    );

    const isValidDate =
      birthDate.getFullYear() === year &&
      birthDate.getMonth() === month - 1 &&
      birthDate.getDate() === day;

    if (!isValidDate || birthDate > today) {
      Swal.fire({
        icon: "error",
        title: "Invalid Date!",
        text: "Please enter a valid date of birth.",
        confirmButtonColor: "#18a889",
      });
      return;
    }

    if (birthDate > ageLimit) {
      Swal.fire({
        icon: "warning",
        title: "Age Restriction!",
        text: "Volunteer must be at least 18 years old.",
        confirmButtonColor: "#18a889",
      });
      return;
    }

    if (!city) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please select or enter your city.",
        confirmButtonColor: "#18a889",
      });
      return;
    }

    if (!/^[a-zA-Z\s.-]+$/.test(city)) {
      Swal.fire({
        icon: "error",
        title: "Invalid City!",
        text: "Please enter a valid city name.",
        confirmButtonColor: "#18a889",
      });
      return;
    }

    if (!state) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please select or enter your state.",
        confirmButtonColor: "#18a889",
      });
      return;
    }

    if (!/^[a-zA-Z\s.-]+$/.test(state)) {
      Swal.fire({
        icon: "error",
        title: "Invalid State!",
        text: "Please enter a valid state name.",
        confirmButtonColor: "#18a889",
      });
      return;
    }

    if (pincode.trim() === "") {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please enter your pincode.",
        confirmButtonColor: "#18a889",
      });
      return;
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
      Swal.fire({
        icon: "error",
        title: "Invalid Pincode!",
        text: "Please enter a valid 6-digit pincode.",
        confirmButtonColor: "#18a889",
      });
      return;
    }

    if (address.trim() === "") {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please enter your complete address.",
        confirmButtonColor: "#18a889",
      });
      return;
    }

    const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png"];
    const maxFileSize = 2 * 1024 * 1024;

    if (!profilePhoto) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please upload your profile photo.",
        confirmButtonColor: "#18a889",
      });
      return;
    }

    if (!allowedImageTypes.includes(profilePhoto.type)) {
      Swal.fire({
        icon: "error",
        title: "Invalid File!",
        text: "Only JPG, JPEG and PNG images are allowed.",
        confirmButtonColor: "#18a889",
      });
      return;
    }

    if (profilePhoto.size > maxFileSize) {
      Swal.fire({
        icon: "error",
        title: "File Too Large!",
        text: "Profile photo must not exceed 2 MB.",
        confirmButtonColor: "#18a889",
      });
      return;
    }

    if (!qualification) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please enter your qualification.",
        confirmButtonColor: "#18a889",
      });
      return;
    }

    if (!/^[a-zA-Z0-9\s.,'-]+$/.test(qualification)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Qualification!",
        text: "Please enter a valid qualification.",
        confirmButtonColor: "#18a889",
      });
      return;
    }

    if (!serviceArea) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please select or enter your service area.",
        confirmButtonColor: "#18a889",
      });
      return;
    }

    if (!/^[a-zA-Z0-9\s.,'-]+$/.test(serviceArea)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Service Area!",
        text: "Please enter a valid service area.",
        confirmButtonColor: "#18a889",
      });
      return;
    }

    if (idProofType === "") {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please select your ID proof type.",
        confirmButtonColor: "#18a889",
      });
      return;
    }

    if (!idProof) {
      Swal.fire({
        icon: "error",
        title: "ID Proof Required!",
        text: "Please upload your ID proof.",
        confirmButtonColor: "#18a889",
      });
      return;
    }

    if (!allowedImageTypes.includes(idProof.type)) {
      Swal.fire({
        icon: "error",
        title: "Invalid File!",
        text: "Only JPG, JPEG and PNG files are allowed for ID proof.",
        confirmButtonColor: "#18a889",
      });
      return;
    }

    if (idProof.size > maxFileSize) {
      Swal.fire({
        icon: "error",
        title: "File Too Large!",
        text: "ID proof must not exceed 2 MB.",
        confirmButtonColor: "#18a889",
      });
      return;
    }

    if (reason.trim() === "") {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please tell us why you want to become a volunteer.",
        confirmButtonColor: "#18a889",
      });
      return;
    }

    // create Formdata
    const data = new FormData();

    data.append("name", name);
    data.append("email", email);
    data.append("password", password);
    data.append("contact_no", contact);
    data.append("gender", gender);
    data.append("dob", dob);
    data.append("city", city);
    data.append("state", state);
    data.append("pincode", pincode);
    data.append("address", address);
    data.append("profilePhoto", profilePhoto);
    data.append("qualification", qualification);
    data.append("serviceArea", serviceArea);
    data.append("proof_type", idProofType);
    data.append("idProof", idProof);
    data.append("reason", reason);

    // Send POST request to backend API
    setIsLoading(true);
    Axios.post("http://localhost:3000/api/volunteerregister", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then((response) => {
        Swal.fire({
          icon: "success",
          title: "Registration Successful",
          text: response.data.message,
          confirmButtonColor: "#18a889",
        }).then(() => {
          window.location = "/";
        });
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "Registration Failed!",
          text: error.response?.data?.message || "Something went wrong.",
          confirmButtonColor: "#18a889",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        .register-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at 15% 20%, rgba(91, 201, 170, 0.16), transparent 30%),
            radial-gradient(circle at 90% 80%, rgba(91, 201, 170, 0.12), transparent 30%),
            #f3faf7;
          padding: 35px 20px;
          font-family: "Poppins", Arial, sans-serif;
        }

        .register-card {
          width: 100%;
          max-width: 950px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 20px;
          padding: 38px 45px 42px;
          box-shadow: 0 8px 35px rgba(0, 80, 50, 0.10);
          border: 1px solid #e4f0eb;
        }

        /* ================= LOGO & HEADING ================= */

        .logo-section {
          text-align: center;
          margin-bottom: 30px;
        }

        .safeher-logo {
          width: 230px;
          height: auto;
          object-fit: contain;
          margin-bottom: 8px;
        }

        .logo-section h1 {
          margin: 8px 0 8px;
          color: #0d4f5e;
          font-size: 30px;
          font-weight: 700;
          letter-spacing: -0.3px;
        }

        .logo-section p {
          margin: 0;
          color: #6f8580;
          font-size: 14px;
          line-height: 1.6;
        }

        /* ================= SECTION TITLE ================= */

        .section-title {
          display: flex;
          align-items: center;
          gap: 15px;
          margin: 30px 0 23px;
          color: #176b4d;
          font-size: 17px;
          font-weight: 700;
        }

        .section-title::before,
        .section-title::after {
          content: "";
          height: 1px;
          background: #d5e8df;
          flex: 1;
        }

        .section-title span {
          white-space: nowrap;
        }

        /* ================= FORM LAYOUT ================= */

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 22px;
          margin-bottom: 0;
        }

        .three-columns {
          grid-template-columns: 1fr 1fr 1fr;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          margin-bottom: 20px;
        }

        .form-group label {
          margin-bottom: 8px;
          color: #263f37;
          font-size: 14px;
          font-weight: 600;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          border: 1px solid #d7e5df;
          border-radius: 9px;
          padding: 12px 14px;
          font-size: 14px;
          color: #263a32;
          background: #ffffff;
          outline: none;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .form-group input,
        .form-group select {
          height: 48px;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 95px;
          line-height: 1.5;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: #20a987;
          box-shadow: 0 0 0 3px rgba(32, 169, 135, 0.10);
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: #9aaba5;
        }

        /* ================= FILE INPUT ================= */

        .form-group input[type="file"] {
          padding: 10px 12px;
          cursor: pointer;
          background: #f8fbf9;
        }

        .form-group input[type="file"]::file-selector-button {
          border: none;
          background: #e4f5ef;
          color: #176b4d;
          padding: 7px 12px;
          border-radius: 6px;
          margin-right: 10px;
          cursor: pointer;
          font-family: inherit;
          font-weight: 500;
        }

        /* ================= BUTTON ================= */
        .button-section {
          text-align: center;
          margin-top: 12px;
        }

        .button-section button {
          width: 100%;
          max-width: 400px;
          border: none;
          background: linear-gradient(135deg, #18a889, #27b45f);
          color: white;
          padding: 14px 30px;
          border-radius: 9px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 8px 20px rgba(27, 166, 117, 0.18);
        }

        .button-section button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .button-section button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(27, 166, 117, 0.25);
        }

        .password-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }  

        .password-wrapper input {
          width: 100%;
          padding-right: 65px;
        }

        .toggle-password {
          position: absolute;
          right: 12px;
          border: none;
          background: transparent;
          color: #18a889;
          font-weight: 600;
          cursor: pointer;
        }

        .password-strength {
          margin-top: 9px;
        }

        .strength-bars {
          display: flex;
          gap: 5px;
          margin-bottom: 5px;
        }

        .strength-bars span {
          height: 5px;
          flex: 1;
          border-radius: 5px;
          background: #e5e7eb;
        }

        /* ================= MOBILE ================= */
        @media (max-width: 700px) {
          .register-page {
            padding: 20px 12px;
          }

          .register-card {
            padding: 28px 20px;
            border-radius: 15px;
          }

          .form-row,
          .three-columns {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .logo-section h1 {
            font-size: 25px;
          }

          .safeher-logo {
            width: 190px;
          }

          .section-title {
            font-size: 16px;
          }

          .button-section button {
            max-width: 100%;
          }
        }
      `}</style>

      <div className="register-page">
        <form className="register-card" onSubmit={handleSubmit}>
          {/* ================= SAFEHER LOGO & HEADING ================= */}
          <div className="logo-section">
            <h1>Volunteer Registration</h1>
            <p>Join SafeHer and help build a safer community.</p>
          </div>

          {/* ================= PERSONAL INFORMATION ================= */}
          <div className="section-title">
            <span>Personal Information</span>
          </div>

          {/* Row 1 - Full Name */}
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" id="name" placeholder="Enter your full name" />
          </div>

          {/* Row 2 - Email + Password */}
          <div className="form-row">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email address"
              />
            </div>

            <div className="form-group">
              <label>Password</label>

              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Enter your password"
                  value={passwordValue}
                  onChange={(e) => setPasswordValue(e.target.value)}
                />

                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {passwordValue && (
                <div className="password-strength">
                  <div className="strength-bars">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                      <span
                        key={item}
                        className={item <= passwordStrength ? "active" : ""}
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

          {/* Row 3 - Contact + Gender */}
          <div className="form-row">
            <div className="form-group">
              <label>Contact No.</label>
              <input
                type="tel"
                id="contact"
                placeholder="Enter contact number"
              />
            </div>

            <div className="form-group">
              <label>Gender</label>

              <select id="gender">
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          {/* Row 4 - Date of Birth */}
          <div className="form-group">
            <label>Date of Birth</label>
            <input type="date" id="dob" />
          </div>

          {/* Row 5 - City + State + Pincode */}
          <div className="form-row three-columns">
            <div className="form-group">
              <label>City</label>
              {selectedCity === "Other" ? (
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your city name"
                  value={otherCity}
                  onChange={(e) => setOtherCity(e.target.value)}
                  maxLength={60}
                />
              ) : (
                <select
                  className="form-control"
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setOtherCity("");
                    setSelectedServiceArea("");
                    setOtherServiceArea("");
                  }}
                >
                  <option value="">Select City</option>
                  {cityList.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              )}
            </div>

            <div className="form-group">
              <label>State</label>
              {selectedState === "Other" ? (
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your state name"
                  value={otherState}
                  onChange={(e) => setOtherState(e.target.value)}
                  maxLength={60}
                />
              ) : (
                <select
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

            <div className="form-group">
              <label>Pincode</label>
              <input type="text" id="pincode" placeholder="Enter pincode" />
            </div>
          </div>

          {/* Row 6 - Address */}
          <div className="form-group">
            <label>Address</label>
            <textarea
              id="address"
              placeholder="Enter your complete address"
              rows="3"
            ></textarea>
          </div>

          {/* Row 7 - Profile Photo */}
          <div className="form-group">
            <label>Profile Photo</label>
            <input type="file" id="profilePhoto" />
          </div>

          {/* ================= VOLUNTEER INFORMATION ================= */}
          <div className="section-title">
            <span>Volunteer Information</span>
          </div>

          {/* Qualification + Availability */}
          <div className="form-row">
            <div className="form-group">
              <label>Qualification</label>
              {selectedQualification === "Other" ? (
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your qualification"
                  value={otherQualification}
                  onChange={(e) => setOtherQualification(e.target.value)}
                  maxLength={60}
                />
              ) : (
                <select
                  className="form-control"
                  value={selectedQualification}
                  onChange={(e) => {
                    setSelectedQualification(e.target.value);
                    setOtherQualification("");
                  }}
                >
                  <option value="">Select Qualification</option>
                  {qualificationOptions.map((qualification) => (
                    <option key={qualification} value={qualification}>
                      {qualification}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label>Preferred Service Area</label>
              {selectedCity === "Other" || selectedServiceArea === "Other" ? (
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter preferred service area"
                  value={otherServiceArea}
                  onChange={(e) => setOtherServiceArea(e.target.value)}
                  maxLength={100}
                />
              ) : (
                <select
                  className="form-control"
                  value={selectedServiceArea}
                  onChange={(e) => {
                    setSelectedServiceArea(e.target.value);
                    setOtherServiceArea("");
                  }}
                  disabled={!selectedCity}
                >
                  <option value="">
                    {selectedCity ? "Select Service Area" : "Select City First"}
                  </option>
                  {(serviceAreaMap[selectedCity] || []).map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              )}
            </div>
          </div>

          {/* ID Proof Type + Upload ID Proof */}
          <div className="form-row">
            <div className="form-group">
              <label>ID Proof Type</label>
              <select id="idProofType">
                <option value="">Select ID Proof Type</option>
                <option>Aadhaar Card</option>
                <option>Driving License</option>
                <option>Pan Card</option>
                <option>Voter ID</option>
              </select>
            </div>

            <div className="form-group">
              <label>Upload ID Proof</label>

              <input type="file" id="idProof" accept=".jpg,.jpeg,.png" />
            </div>
          </div>

          {/* Reason for Joining */}
          <div className="form-group">
            <label>Reason for Joining</label>
            <textarea
              id="reason"
              placeholder="Tell us why you want to become a SafeHer volunteer..."
              rows="4"
            ></textarea>
          </div>

          {/* ================= APPLY BUTTON ================= */}
          <div className="button-section">
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Apply as Volunteer"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default Register;
