import React, { useEffect, useState } from "react";
import Axios from "axios";
import Swal from "sweetalert2";
import "../volunteer-css/profile.css";

function Profile() {
  const [editMode, setEditMode] = useState(false);
  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [originalVolunteer, setOriginalVolunteer] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fetchVolunteerProfile = async (userId) => {
    try {
      const response = await Axios.get(
        `http://localhost:3000/api/getvolunteerprofile/${userId}`,
      );

      setVolunteer(response.data);
      setOriginalVolunteer(response.data);
    } catch (error) {
      console.log("Profile fetch error:", error);

      Swal.fire({
        icon: "error",
        title: "Unable to Load Profile",
        text:
          error.response?.data?.message ||
          "Something went wrong while loading your profile.",
        confirmButtonColor: "#16a085",
      });
    }
  };

  useEffect(() => {
    const storedData = sessionStorage.getItem("mydata");

    if (!storedData) {
      Swal.fire({
        icon: "error",
        title: "Session Expired",
        text: "Please login again.",
        confirmButtonColor: "#16a085",
      }).then(() => {
        window.location.href = "/volunteerlogin";
      });

      return;
    }

    const volunteerData = JSON.parse(storedData);

    if (!volunteerData.user_id) {
      Swal.fire({
        icon: "error",
        title: "Invalid Session",
        text: "Volunteer information not found.",
        confirmButtonColor: "#16a085",
      });

      setLoading(false);
      return;
    }

    fetchVolunteerProfile(volunteerData.user_id).finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="vol-profile-page">
        <div className="vol-profile-loading">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!volunteer) {
    return (
      <div className="vol-profile-page">
        <div className="vol-profile-loading">
          <i className="fa-solid fa-user-slash"></i>
          <p>Profile information not available.</p>
        </div>
      </div>
    );
  }

  //photo change
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Image",
        text: "Only JPG, JPEG and PNG images are allowed.",
        confirmButtonColor: "#16a085",
      });

      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({
        icon: "warning",
        title: "Image Too Large",
        text: "Profile photo must be less than 2 MB.",
        confirmButtonColor: "#16a085",
      });

      return;
    }

    setSelectedPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  // Save Profile Changes
  const handleSaveProfile = () => {
    const storedData = sessionStorage.getItem("mydata");

    if (!storedData) {
      Swal.fire({
        icon: "error",
        title: "Session Expired",
        text: "Please login again.",
        confirmButtonColor: "#16a085",
      });

      return;
    }

    const volunteerData = JSON.parse(storedData);

    if (!volunteerData.user_id) {
      Swal.fire({
        icon: "error",
        title: "Invalid Session",
        text: "Volunteer information not found.",
        confirmButtonColor: "#16a085",
      });
      return;
    }

    const name = volunteer.name?.trim();
    const contact = volunteer.contact_no?.trim();
    const city = volunteer.city?.trim();
    const state = volunteer.state?.trim();
    const pincode = volunteer.pincode?.trim();
    const address = volunteer.address?.trim();
    const qualification = volunteer.qualification?.trim();
    const serviceArea = volunteer.serviceArea?.trim();
    const reason = volunteer.reason?.trim();

    // Name validation
    if (name === "") {
      Swal.fire({
        icon: "warning",
        title: "Name Required",
        text: "Please enter your full name.",
        confirmButtonColor: "#16a085",
      });
      return;
    }

    if (!/^[A-Za-z\s]{2,50}$/.test(name)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Name",
        text: "Name should contain only letters and spaces.",
        confirmButtonColor: "#16a085",
      });
      return;
    }

    // Contact validation
    if (!/^[6-9]\d{9}$/.test(contact)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Contact Number",
        text: "Please enter a valid 10-digit mobile number.",
        confirmButtonColor: "#16a085",
      });
      return;
    }

    // City validation
    if (city === "") {
      Swal.fire({
        icon: "warning",
        title: "City Required",
        text: "Please enter your city.",
        confirmButtonColor: "#16a085",
      });
      return;
    }

    if (!/^[A-Za-z\s]{2,50}$/.test(city)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid City",
        text: "City should contain only letters and spaces.",
        confirmButtonColor: "#16a085",
      });
      return;
    }

    // State validation
    if (state === "") {
      Swal.fire({
        icon: "warning",
        title: "State Required",
        text: "Please enter your state.",
        confirmButtonColor: "#16a085",
      });
      return;
    }

    if (!/^[A-Za-z\s]{2,50}$/.test(state)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid State",
        text: "State should contain only letters and spaces.",
        confirmButtonColor: "#16a085",
      });
      return;
    }

    // Pincode validation
    if (!/^\d{6}$/.test(pincode)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Pincode",
        text: "Pincode must be exactly 6 digits.",
        confirmButtonColor: "#16a085",
      });
      return;
    }

    // Address validation
    if (address.length < 5) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Address",
        text: "Please enter a valid address.",
        confirmButtonColor: "#16a085",
      });
      return;
    }

    // Qualification validation
    if (qualification.length < 2) {
      Swal.fire({
        icon: "warning",
        title: "Qualification Required",
        text: "Please enter your qualification.",
        confirmButtonColor: "#16a085",
      });
      return;
    }

    // Service area validation
    if (serviceArea.length < 2) {
      Swal.fire({
        icon: "warning",
        title: "Service Area Required",
        text: "Please enter your service area.",
        confirmButtonColor: "#16a085",
      });
      return;
    }

    // Reason validation
    if (reason.length < 10) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Reason",
        text: "Reason for joining should contain at least 10 characters.",
        confirmButtonColor: "#16a085",
      });
      return;
    }

    // Password validation
    if (newPassword) {
      if (newPassword.length < 6) {
        Swal.fire({
          icon: "warning",
          title: "Invalid Password",
          text: "New password must be at least 6 characters long.",
          confirmButtonColor: "#16a085",
        });
        return;
      }

      if (!confirmPassword) {
        Swal.fire({
          icon: "warning",
          title: "Confirm Password",
          text: "Please confirm your new password.",
          confirmButtonColor: "#16a085",
        });
        return;
      }

      if (newPassword !== confirmPassword) {
        Swal.fire({
          icon: "warning",
          title: "Password Mismatch",
          text: "New password and confirm password do not match.",
          confirmButtonColor: "#16a085",
        });
        return;
      }
    }

    Axios.put(
      `http://localhost:3000/api/updatevolunteerprofile/${volunteerData.user_id}`,
      {
        name,
        contact_no: contact,
        city,
        state,
        pincode,
        address,
        qualification,
        serviceArea,
        reason,
      },
    )
      .then(async (response) => {
        if (newPassword) {
          try {
            await Axios.put(
              `http://localhost:3000/api/updatevolunteerpassword/${volunteerData.user_id}`,
              {
                password: newPassword,
              },
            );
          } catch (passwordError) {
            console.log("Password update error:", passwordError);

            Swal.fire({
              icon: "error",
              title: "Password Update Failed",
              text:
                passwordError.response?.data?.message ||
                "Profile information was saved, but the password could not be updated.",
              confirmButtonColor: "#16a085",
            });

            return;
          }
        }
        if (selectedPhoto) {
          try {
            const formData = new FormData();

            formData.append("profilePhoto", selectedPhoto);

            await Axios.put(
              `http://localhost:3000/api/updatevolunteerphoto/${volunteerData.user_id}`,
              formData,
            );
          } catch (photoError) {
            console.log("Profile photo upload error:", photoError);

            await fetchVolunteerProfile(volunteerData.user_id);

            setSelectedPhoto(null);
            setPhotoPreview(null);
            setNewPassword("");
            setConfirmPassword("");
            setEditMode(false);

            Swal.fire({
              icon: "error",
              title: "Photo Upload Failed",
              text:
                photoError.response?.data?.message ||
                "Profile information was saved, but the new photo could not be uploaded.",
              confirmButtonColor: "#16a085",
            });

            return;
          }
        }

        await fetchVolunteerProfile(volunteerData.user_id);

        setSelectedPhoto(null);
        setPhotoPreview(null);
        setEditMode(false);

        Swal.fire({
          icon: "success",
          title: "Profile Updated",
          text: "Your profile has been updated successfully.",
          confirmButtonColor: "#16a085",
        });
      })
      .catch((error) => {
        console.log("Profile update error:", error);

        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text:
            error.response?.data?.message ||
            "Something went wrong while updating your profile.",
          confirmButtonColor: "#16a085",
        });
      });
  };

  const formattedDob = volunteer.dob
    ? new Date(volunteer.dob).toISOString().split("T")[0]
    : "";

  const profilePhoto = volunteer.profile_photo
    ? `http://localhost:3000/volunteer/${volunteer.profile_photo}`
    : "/images/icon/avatar-01.jpg";

  return (
    <div className="vol-profile-page">
      {/* ================= PAGE HEADER ================= */}
      <div className="vol-profile-heading">
        <div>
          <h2>My Profile</h2>
          <p>View and manage your volunteer profile information.</p>
        </div>

        {!editMode ? (
          <button
            className="vol-edit-btn"
            onClick={() => {
              setOriginalVolunteer({ ...volunteer });
              setEditMode(true);
            }}
          >
            <i className="fa-solid fa-pen"></i>
            Edit Profile
          </button>
        ) : (
          <div className="vol-profile-actions">
            <button
              className="vol-cancel-btn"
              onClick={() => {
                setVolunteer({ ...originalVolunteer });
                setSelectedPhoto(null);
                setPhotoPreview(null);
                setEditMode(false);
              }}
            >
              Cancel
            </button>

            <button className="vol-save-btn" onClick={handleSaveProfile}>
              <i className="fa-solid fa-check"></i>
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* ================= PROFILE CARD ================= */}
      <div className="vol-profile-card">
        {/* ================= PROFILE TOP ================= */}
        <div className="vol-profile-top">
          <div className="vol-profile-photo">
            <img
              src={photoPreview || profilePhoto}
              alt={volunteer.name || "Volunteer Profile"}
            />

            {editMode && (
              <>
                <input
                  type="file"
                  id="profilePhotoInput"
                  accept="image/jpeg,image/jpg,image/png"
                  style={{ display: "none" }}
                  onChange={handlePhotoChange}
                />

                <button
                  type="button"
                  className="vol-photo-edit"
                  onClick={() =>
                    document.getElementById("profilePhotoInput").click()
                  }
                >
                  <i className="fa-solid fa-camera"></i>
                </button>
              </>
            )}
          </div>

          <div className="vol-profile-basic">
            <h3>{volunteer.name}</h3>
            <p>{volunteer.email}</p>

            <span className="vol-status approved">
              <span></span>
              {volunteer.status}
            </span>
          </div>
        </div>

        {/* ================= PERSONAL INFORMATION ================= */}
        <div className="vol-profile-section">
          <h4>
            <i className="fa-solid fa-user"></i>
            Personal Information
          </h4>

          {/* Name + Email */}
          <div className="vol-profile-grid">
            <div className="vol-field">
              <label>Full Name</label>
              <input
                type="text"
                value={volunteer.name || ""}
                disabled={!editMode}
                readOnly={!editMode}
                onChange={(e) =>
                  setVolunteer({
                    ...volunteer,
                    name: e.target.value,
                  })
                }
              />
            </div>

            <div className="vol-field">
              <label>Email Address</label>
              <input type="email" value={volunteer.email || ""} disabled />
            </div>
          </div>

          {/* Gender + DOB + Contact */}
          <div className="vol-profile-grid three-column">
            <div className="vol-field">
              <label>Gender</label>
              <input type="text" value={volunteer.gender || ""} disabled />
            </div>

            <div className="vol-field">
              <label>Date of Birth</label>
              <input type="date" value={formattedDob} disabled />
            </div>

            <div className="vol-field">
              <label>Contact Number</label>
              <input
                type="text"
                value={volunteer.contact_no || ""}
                disabled={!editMode}
                readOnly={!editMode}
                onChange={(e) =>
                  setVolunteer({
                    ...volunteer,
                    contact_no: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="vol-profile-section">
          {!editMode ? (
            <div className="vol-field">
              <label>Password</label>

              <input type="password" value="••••••" disabled />
            </div>
          ) : (
            <div className="vol-profile-grid">
              <div className="vol-field">
                <label>New Password</label>

                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="vol-field">
                <label>Confirm Password</label>

                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* ================= ADDRESS INFORMATION ================= */}
        <div className="vol-profile-section">
          <h4>
            <i className="fa-solid fa-location-dot"></i>
            Address Information
          </h4>

          {/* City + State + Pincode */}
          <div className="vol-profile-grid three-column">
            <div className="vol-field">
              <label>City</label>
              <input
                type="text"
                value={volunteer.city || ""}
                disabled={!editMode}
                readOnly={!editMode}
                onChange={(e) =>
                  setVolunteer({
                    ...volunteer,
                    city: e.target.value,
                  })
                }
              />
            </div>

            <div className="vol-field">
              <label>State</label>
              <input
                type="text"
                value={volunteer.state || ""}
                disabled={!editMode}
                readOnly={!editMode}
                onChange={(e) =>
                  setVolunteer({
                    ...volunteer,
                    state: e.target.value,
                  })
                }
              />
            </div>

            <div className="vol-field">
              <label>Pincode</label>
              <input
                type="text"
                value={volunteer.pincode || ""}
                disabled={!editMode}
                readOnly={!editMode}
                onChange={(e) =>
                  setVolunteer({
                    ...volunteer,
                    pincode: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Full Address */}
          <div className="vol-field vol-address-field">
            <label>Full Address</label>

            <textarea
              value={volunteer.address || ""}
              disabled={!editMode}
              readOnly={!editMode}
              rows="3"
              onChange={(e) =>
                setVolunteer({
                  ...volunteer,
                  address: e.target.value,
                })
              }
            ></textarea>
          </div>
        </div>

        {/* ================= VOLUNTEER INFORMATION ================= */}
        <div className="vol-profile-section">
          <h4>
            <i className="fa-solid fa-hand-holding-heart"></i>
            Volunteer Information
          </h4>

          {/* Qualification + Service Area */}
          <div className="vol-profile-grid">
            <div className="vol-field">
              <label>Qualification</label>

              <input
                type="text"
                value={volunteer.qualification || ""}
                disabled={!editMode}
                readOnly={!editMode}
                onChange={(e) =>
                  setVolunteer({
                    ...volunteer,
                    qualification: e.target.value,
                  })
                }
              />
            </div>

            <div className="vol-field">
              <label>Service Area</label>

              <input
                type="text"
                value={volunteer.serviceArea || ""}
                disabled={!editMode}
                readOnly={!editMode}
                onChange={(e) =>
                  setVolunteer({
                    ...volunteer,
                    serviceArea: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Reason */}
          <div className="vol-field vol-address-field">
            <label>Reason for Joining</label>

            <textarea
              value={volunteer.reason || ""}
              disabled={!editMode}
              readOnly={!editMode}
              rows="3"
              onChange={(e) =>
                setVolunteer({
                  ...volunteer,
                  reason: e.target.value,
                })
              }
            ></textarea>
          </div>
        </div>

        {/* ================= IDENTITY VERIFICATION ================= */}
        <div className="vol-profile-section last-section">
          <h4>
            <i className="fa-solid fa-shield-halved"></i>
            Identity Verification
          </h4>

          <div className="vol-profile-grid">
            <div className="vol-field">
              <label>ID Proof Type</label>

              <input type="text" value={volunteer.proof_type || ""} disabled />
            </div>

            <div className="vol-field">
              <label>Verification Status</label>

              <div className="vol-verification-status">
                <i className="fa-solid fa-circle-check"></i>
                {volunteer.status === "Approved"
                  ? "Verified"
                  : volunteer.status}
              </div>
            </div>
          </div>

          <div className="vol-field vol-address-field">
            <label>ID Proof</label>

            <div className="vol-proof-box">
              <i className="fa-solid fa-file-image"></i>

              <span>{volunteer.proof || "Identity Proof Document"}</span>

              <button
                type="button"
                onClick={() => {
                  if (volunteer.proof) {
                    window.open(
                      `http://localhost:3000/volunteer/${volunteer.proof}`,
                      "_blank",
                    );
                  } else {
                    Swal.fire({
                      icon: "info",
                      title: "ID Proof Not Available",
                      text: "No identity proof document is available.",
                      confirmButtonColor: "#16a085",
                    });
                  }
                }}
              >
                View
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
