import { useEffect, useState } from "react";
import Axios from "axios";
import Swal from "sweetalert2";
import AdminInitials from "./AdminInitials";

function AdminProfile() {
  const [adminData, setAdminData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const data = JSON.parse(sessionStorage.getItem("mydata"));
    console.log("Session Data:", data);
    if (data && data._id) {
      Axios.get(`http://localhost:3000/api/getadminprofile/${data._id}`)
        .then((res) => {
          if (res.data.status === "Success") {
            setAdminData(res.data.data);
            setEditName(res.data.data.name);
            setEditEmail(res.data.data.email);
          }
        })
        .catch((err) => {
          console.log("Profile API Error:", err);
        });
    }
  }, []);

  const handleSave = () => {
    if (!editName.trim() || !editEmail.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Required Fields",
        text: "Name and email are required.",
        confirmButtonColor: "#2f80ed",
      });
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(editEmail.trim())) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Email",
        text: "Please enter a valid email address.",
        confirmButtonColor: "#2f80ed",
      });
      return;
    }

    if (newPassword && newPassword.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Password",
        text: "Password must be at least 6 characters long.",
        confirmButtonColor: "#2f80ed",
      });
      return;
    }

    if (newPassword && !confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Confirm Password",
        text: "Please confirm your new password.",
        confirmButtonColor: "#2f80ed",
      });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Password Mismatch",
        text: "New password and confirm password must match.",
        confirmButtonColor: "#2f80ed",
      });
      return;
    }

    const data = JSON.parse(sessionStorage.getItem("mydata"));

    if (!data || !data._id) {
      Swal.fire({
        icon: "error",
        title: "Session Expired",
        text: "Please login again.",
        confirmButtonColor: "#2f80ed",
      });
      return;
    }

    Axios.put(`http://localhost:3000/api/editadminprofile/${data._id}`, {
      name: editName,
      email: editEmail,
    }).then((res) => {
      if (res.data.status === "Success") {
        // Update name and email first
        setAdminData(res.data.data);

        setEditName(res.data.data.name);
        setEditEmail(res.data.data.email);

        // Update Sidebar and Header
        window.dispatchEvent(new Event("adminProfileUpdated"));

        // If new password is entered, update password
        if (newPassword) {
          Axios.put(`http://localhost:3000/api/editadminpassword/${data._id}`, {
            password: newPassword,
          })
            .then((passwordRes) => {
              if (passwordRes.data.status === "Success") {
                setNewPassword("");
                setConfirmPassword("");

                setIsEditing(false);

                Swal.fire({
                  icon: "success",
                  title: "Profile Updated",
                  text: "Your profile and password have been updated successfully.",
                  confirmButtonColor: "#2f80ed",
                });
              }
            })
            .catch((error) => {
              Swal.fire({
                icon: "error",
                title: "Password Update Failed",
                text:
                  error.response?.data?.message || "Unable to update password.",
                confirmButtonColor: "#2f80ed",
              });
            });
        } else {
          // Only name/email updated
          setIsEditing(false);

          Swal.fire({
            icon: "success",
            title: "Profile Updated",
            text: "Your profile has been updated successfully.",
            confirmButtonColor: "#2f80ed",
          });
        }
      }
    });
  };

  return (
    <div className="content-wrapper">
      {/* Page Header */}
      <div className="page-header">
        <h3 className="page-title">Admin Profile</h3>
      </div>

      {/* Profile Card */}
      <div className="row justify-content-center">
        <div className="col-md-9 col-lg-8">
          <div className="card">
            {/* Profile Header */}
            <div className="card-body text-center pb-3">
              <AdminInitials
                name={adminData?.name}
                className="admin-initials-profile"
              />

              <h3 className="mt-3 mb-1 font-weight-bold">{adminData?.name}</h3>

              <p className="text-muted mb-0">
                <i className="fas fa-shield-alt text-primary mr-2"></i>
                Administrator
              </p>
            </div>

            <div className="card-body pt-2">
              {/* Name + Email */}
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="font-weight-bold">
                      <i className="fas fa-user text-primary mr-2"></i>
                      Full Name
                    </label>

                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    ) : (
                      <div className="p-3 bg-light rounded">
                        {adminData?.name}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-group">
                    <label className="font-weight-bold">
                      <i className="fas fa-envelope text-primary mr-2"></i>
                      Email
                    </label>

                    {isEditing ? (
                      <input
                        type="email"
                        className="form-control"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                      />
                    ) : (
                      <div className="p-3 bg-light rounded">
                        {adminData?.email}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Password */}
              {/* Password */}
              <div className="form-group mt-2">
                <label className="font-weight-bold">
                  <i className="fas fa-lock text-primary mr-2"></i>
                  Password
                </label>

                {isEditing ? (
                  <div className="row">
                    {/* New Password */}
                    <div className="col-md-6">
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>

                    {/* Confirm Password */}
                    <div className="col-md-6">
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-light rounded">••••••••••</div>
                )}
              </div>

              {/* Buttons */}
              <div className="text-center mt-4">
                {!isEditing ? (
                  <button
                    type="button"
                    className="btn btn-primary px-4"
                    onClick={() => setIsEditing(true)}
                  >
                    <i className="fas fa-edit mr-2"></i>
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn btn-light px-4 mr-2"
                      onClick={() => {
                        setEditName(adminData?.name || "");
                        setEditEmail(adminData?.email || "");
                        setNewPassword("");
                        setConfirmPassword("");
                        setIsEditing(false);
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="btn btn-primary px-4"
                      onClick={handleSave}
                    >
                      <i className="fas fa-save mr-2"></i>
                      Save Changes
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;
