import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../safeher-css/profile.css";

function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = () => {
    const mydata = JSON.parse(localStorage.getItem("mydata"));

    if (!mydata || !mydata.user_id) {
      return;
    }

    axios
      .get(`http://localhost:3000/api/getwomanuserdetails/${mydata.user_id}`)
      .then((response) => {
        setUser(response.data);
      })
      .catch((error) => {
        console.log("Error fetching profile:", error);
      });
  };

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditProfile = () => {
    setEditData({
      fullName: user.fullName || "",
      phoneNumber: user.phoneNumber || "",
      city: user.city || "",
      state: user.state || "",
      pincode: user.pincode || "",
      address: user.address || "",
    });

    setIsEditing(true);
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Image",
        text: "Please select a JPG, JPEG, or PNG image.",
      });

      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({
        icon: "warning",
        title: "Image Too Large",
        text: "Profile photo must be less than 2 MB.",
      });
      e.target.value = "";
      return;
    }

    const mydata = JSON.parse(localStorage.getItem("mydata"));
    if (!mydata || !mydata.user_id) {
      Swal.fire({
        icon: "error",
        title: "Session Expired",
        text: "Please login again.",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("profile_photo", file);
      const response = await axios.put(
        `http://localhost:3000/api/editwomanprofilephoto/${mydata.user_id}`,
        formData,
      );

      setUser(response.data.user);
      Swal.fire({
        icon: "success",
        title: "Photo Updated",
        text: "Your profile photo has been updated successfully.",
        timer: 1800,
        showConfirmButton: false,
      });
      e.target.value = "";
    } catch (error) {
      console.log("Profile photo upload error:", error);
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text:
          error.response?.data?.message ||
          "Unable to update profile photo. Please try again.",
      });
      e.target.value = "";
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleSaveChanges = async () => {
    // Basic validation
    if (
      !editData.fullName.trim() ||
      !editData.phoneNumber.trim() ||
      !editData.city.trim() ||
      !editData.state.trim() ||
      !editData.pincode.trim() ||
      !editData.address.trim()
    ) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Information",
        text: "Please fill in all editable fields.",
      });
      return;
    }

    // Phone validation
    if (!/^[6-9]\d{9}$/.test(editData.phoneNumber)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Phone Number",
        text: "Please enter a valid 10-digit phone number.",
      });
      return;
    }

    // Pincode validation
    if (!/^\d{6}$/.test(editData.pincode)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Pincode",
        text: "Pincode must contain exactly 6 digits.",
      });
      return;
    }

    const mydata = JSON.parse(localStorage.getItem("mydata"));

    if (!mydata || !mydata.user_id) {
      Swal.fire({
        icon: "error",
        title: "Session Expired",
        text: "Please login again.",
      });
      return;
    }

    try {
      setIsSaving(true);

      const response = await axios.put(
        `http://localhost:3000/api/editwomanprofile/${mydata.user_id}`,
        editData,
      );

      setUser(response.data.user);
      setIsEditing(false);
      setEditData({});

      Swal.fire({
        icon: "success",
        title: "Profile Updated",
        text: "Your profile has been updated successfully.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.log("Profile update error:", error);

      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text:
          error.response?.data?.message ||
          "Unable to update your profile. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    if (!currentPassword || !newPassword || !confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Information",
        text: "Please fill in all password fields.",
      });
      return;
    }
    if (newPassword.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Password",
        text: "New password must be at least 6 characters.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Password Mismatch",
        text: "New password and confirm password do not match.",
      });
      return;
    }
    if (currentPassword === newPassword) {
      Swal.fire({
        icon: "warning",
        title: "Same Password",
        text: "New password must be different from current password.",
      });
      return;
    }
    const mydata = JSON.parse(localStorage.getItem("mydata"));
    if (!mydata || !mydata.user_id) {
      Swal.fire({
        icon: "error",
        title: "Session Expired",
        text: "Please login again.",
      });
      return;
    }

    try {
      setIsChanging(true);
      await axios.put(
        `http://localhost:3000/api/changewomanpassword/${mydata.user_id}`,
        passwordData,
      );

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setIsChangingPassword(false);

      Swal.fire({
        icon: "success",
        title: "Password Changed",
        text: "Your password has been changed successfully.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.log("Change password error:", error);

      Swal.fire({
        icon: "error",
        title: "Unable to Change Password",
        text:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setIsChanging(false);
    }
  };

  if (!user) {
    return <div className="pf-page">Loading profile...</div>;
  }

  return (
    <div className="pf-page">
      {/* ===== HERO HEADER ===== */}
      <header className="pf-hero">
        <div className="pf-shape pf-shape-one"></div>
        <div className="pf-shape pf-shape-two"></div>
        <div className="pf-shape pf-shape-three"></div>

        <div className="pf-hero-inner">
          {/* PROFILE PHOTO */}
          <div className="pf-photo">
            <img
              src={
                user.profile_photo
                  ? `http://localhost:3000/public/${user.profile_photo}`
                  : "/assets/images/all-img/woman-user3.png"
              }
              alt="Profile"
            />

            <input
              type="file"
              id="profilePhotoInput"
              accept="image/jpeg,image/png,image/jpg"
              style={{ display: "none" }}
              onChange={handlePhotoChange}
            />

            <button
              type="button"
              className="pf-camera"
              aria-label="Change photo"
              onClick={() =>
                document.getElementById("profilePhotoInput").click()
              }
            >
              <i className="fa-solid fa-camera"></i>
            </button>
          </div>

          {/* PROFILE BASIC INFORMATION */}
          <div className="pf-user">
            <span className="pf-tag">
              <i className="fa-solid fa-shield-heart"></i>
              SafeHer Profile
            </span>

            <h1>{user.fullName}</h1>

            <p className="pf-user-mail">
              <i className="fa-regular fa-envelope"></i>
              {user.email}
            </p>

            <div className="pf-chips">
              <span className="pf-chip pf-chip-green">
                <i className="fa-solid fa-circle-check"></i>
                Account {user.status}
              </span>

              <span className="pf-chip">
                <i className="fa-regular fa-calendar"></i>
                Member since {new Date(user.createdAt).getFullYear()}
              </span>
            </div>
          </div>

          {/* EDIT / SAVE BUTTONS */}
          {!isEditing ? (
            <button
              type="button"
              className="pf-edit-btn"
              onClick={handleEditProfile}
            >
              <i className="fa-regular fa-pen-to-square"></i>
              Edit Profile
            </button>
          ) : (
            <div className="pf-edit-actions">
              <button
                type="button"
                className="pf-cancel-btn"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="pf-save-btn"
                onClick={handleSaveChanges}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Saving...
                  </>
                ) : (
                  <>Save Changes</>
                )}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ===== BODY ===== */}
      <div className="pf-container">
        <div className="pf-layout">
          {/* ===== MAIN COLUMN ===== */}
          <div className="pf-main">
            {/* PERSONAL INFORMATION */}
            <section className="pf-card">
              <div className="pf-card-head">
                <span className="pf-head-icon pf-blue">
                  <i className="fa-regular fa-user"></i>
                </span>

                <div>
                  <h2>Personal Information</h2>
                  <p>Your basic details</p>
                </div>
              </div>

              <div className="pf-grid">
                {/* FULL NAME - EDITABLE */}
                <div className="pf-item pf-span-2">
                  <span className="pf-item-icon">
                    <i className="fa-regular fa-id-badge"></i>
                  </span>

                  <div>
                    <label>Full Name</label>

                    {isEditing ? (
                      <input
                        type="text"
                        name="fullName"
                        value={editData.fullName || ""}
                        onChange={handleEditChange}
                        className="pf-edit-input"
                      />
                    ) : (
                      <p>{user.fullName}</p>
                    )}
                  </div>
                </div>

                {/* GENDER - READ ONLY */}
                <div className="pf-item">
                  <span className="pf-item-icon">
                    <i className="fa-solid fa-venus"></i>
                  </span>

                  <div>
                    <label>Gender</label>

                    {isEditing ? (
                      <div className="pf-readonly-field">
                        <span>{user.gender}</span>
                        <i className="fa-solid fa-lock"></i>
                      </div>
                    ) : (
                      <p>{user.gender}</p>
                    )}
                  </div>
                </div>

                {/* DOB - READ ONLY */}
                <div className="pf-item">
                  <span className="pf-item-icon">
                    <i className="fa-solid fa-cake-candles"></i>
                  </span>

                  <div>
                    <label>Date of Birth</label>

                    {isEditing ? (
                      <div className="pf-readonly-field">
                        <span>{user.dob}</span>
                        <i className="fa-solid fa-lock"></i>
                      </div>
                    ) : (
                      <p>{user.dob}</p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* CONTACT DETAILS */}
            <section className="pf-card">
              <div className="pf-card-head">
                <span className="pf-head-icon pf-purple">
                  <i className="fa-solid fa-address-book"></i>
                </span>

                <div>
                  <h2>Contact Details</h2>
                  <p>How we reach you</p>
                </div>
              </div>

              <div className="pf-grid">
                {/* EMAIL - READ ONLY */}
                <div className="pf-item">
                  <span className="pf-item-icon">
                    <i className="fa-regular fa-envelope"></i>
                  </span>

                  <div>
                    <label>Email Address</label>

                    {isEditing ? (
                      <div className="pf-readonly-field">
                        <span>{user.email}</span>
                        <i className="fa-solid fa-lock"></i>
                      </div>
                    ) : (
                      <p>{user.email}</p>
                    )}
                  </div>
                </div>

                {/* PHONE - EDITABLE */}
                <div className="pf-item">
                  <span className="pf-item-icon">
                    <i className="fa-solid fa-phone"></i>
                  </span>

                  <div>
                    <label>Contact Number</label>

                    {isEditing ? (
                      <input
                        type="text"
                        name="phoneNumber"
                        value={editData.phoneNumber || ""}
                        onChange={handleEditChange}
                        className="pf-edit-input"
                        maxLength="10"
                      />
                    ) : (
                      <p>{user.phoneNumber}</p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* ADDRESS INFORMATION */}
            <section className="pf-card">
              <div className="pf-card-head">
                <span className="pf-head-icon pf-pink">
                  <i className="fa-solid fa-location-dot"></i>
                </span>

                <div>
                  <h2>Address Information</h2>
                  <p>Where you live</p>
                </div>
              </div>

              <div className="pf-grid pf-grid-3">
                {/* CITY */}
                <div className="pf-item">
                  <span className="pf-item-icon">
                    <i className="fa-solid fa-city"></i>
                  </span>

                  <div>
                    <label>City</label>

                    {isEditing ? (
                      <input
                        type="text"
                        name="city"
                        value={editData.city || ""}
                        onChange={handleEditChange}
                        className="pf-edit-input"
                      />
                    ) : (
                      <p>{user.city}</p>
                    )}
                  </div>
                </div>

                {/* STATE */}
                <div className="pf-item">
                  <span className="pf-item-icon">
                    <i className="fa-regular fa-map"></i>
                  </span>

                  <div>
                    <label>State</label>

                    {isEditing ? (
                      <input
                        type="text"
                        name="state"
                        value={editData.state || ""}
                        onChange={handleEditChange}
                        className="pf-edit-input"
                      />
                    ) : (
                      <p>{user.state}</p>
                    )}
                  </div>
                </div>

                {/* PINCODE */}
                <div className="pf-item">
                  <span className="pf-item-icon">
                    <i className="fa-solid fa-hashtag"></i>
                  </span>

                  <div>
                    <label>Pincode</label>

                    {isEditing ? (
                      <input
                        type="text"
                        name="pincode"
                        value={editData.pincode || ""}
                        onChange={handleEditChange}
                        className="pf-edit-input"
                        maxLength="6"
                      />
                    ) : (
                      <p>{user.pincode}</p>
                    )}
                  </div>
                </div>

                {/* FULL ADDRESS */}
                <div className="pf-item pf-span-all">
                  <span className="pf-item-icon">
                    <i className="fa-solid fa-house"></i>
                  </span>

                  <div className="pf-address-content">
                    <label>Full Address</label>

                    {isEditing ? (
                      <textarea
                        name="address"
                        value={editData.address || ""}
                        onChange={handleEditChange}
                        className="pf-edit-textarea"
                        rows="3"
                      />
                    ) : (
                      <p>{user.address}</p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* ===== SIDE COLUMN ===== */}
          <aside className="pf-side">
            {/* ACCOUNT OVERVIEW */}
            <section className="pf-card">
              <div className="pf-card-head">
                <span className="pf-head-icon pf-green">
                  <i className="fa-solid fa-shield-halved"></i>
                </span>

                <div>
                  <h2>Account</h2>
                  <p>Status & membership</p>
                </div>
              </div>

              <ul className="pf-account-list">
                <li>
                  <span>Account Status</span>

                  <strong className="pf-status">
                    <i className="fa-solid fa-circle"></i> {user.status}
                  </strong>
                </li>

                <li>
                  <span>Member Since</span>
                  <strong>{new Date(user.createdAt).getFullYear()}</strong>
                </li>

                <li>
                  <span>Membership</span>
                  <strong>SafeHer Member</strong>
                </li>
              </ul>
            </section>

            {/* SECURITY */}
            <section className="pf-card">
              <div className="pf-card-head">
                <span className="pf-head-icon pf-navy">
                  <i className="fa-solid fa-lock"></i>
                </span>

                <div>
                  <h2>Security</h2>
                  <p>Keep your account safe</p>
                </div>
              </div>

              {!isChangingPassword ? (
                <div className="pf-password-box">
                  <div>
                    <label>Password</label>
                    <p>••••••</p>
                  </div>

                  <button
                    type="button"
                    className="pf-link-btn"
                    onClick={() => setIsChangingPassword(true)}
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="pf-password-form">
                  <div className="pf-password-field">
                    <label>Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="pf-password-field">
                    <label>New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="pf-password-field">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                    />
                  </div>

                  <div className="pf-password-actions">
                    <button
                      type="button"
                      className="pf-password-cancel"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordData({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                      }}
                      disabled={isChanging}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="pf-password-save"
                      onClick={handleChangePassword}
                      disabled={isChanging}
                    >
                      {isChanging ? "Changing..." : "Change Password"}
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* SAFETY NOTE */}
            <section className="pf-note">
              <i className="fa-solid fa-heart-pulse"></i>

              <h3>Your safety comes first</h3>

              <p>
                Keep your contact number and address up to date so SafeHer can
                reach you quickly when it matters.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Profile;
