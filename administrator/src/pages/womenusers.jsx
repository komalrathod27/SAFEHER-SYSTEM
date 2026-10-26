import React, { useEffect, useState } from "react";
import Axios from "axios";

function WomenUsers() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUsers, setNewUsers] = useState(0);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    Axios.get("http://localhost:3000/api/getwomanusers")
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.log(error);
      });

    Axios.get("http://localhost:3000/api/getnewwomanusers")
      .then((response) => {
        setNewUsers(response.data.newUsers);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  let filteredUsers = users;

  // Date filter
  if (filter === "7days") {
    const date = new Date();
    date.setDate(date.getDate() - 7);

    filteredUsers = filteredUsers.filter(
      (user) => user.createdAt && new Date(user.createdAt) >= date,
    );
  }

  if (filter === "30days") {
    const date = new Date();
    date.setDate(date.getDate() - 30);

    filteredUsers = filteredUsers.filter(
      (user) => user.createdAt && new Date(user.createdAt) >= date,
    );
  }

  if (filter === "month") {
    const date = new Date();

    filteredUsers = filteredUsers.filter((user) => {
      if (!user.createdAt) return false;

      const userDate = new Date(user.createdAt);

      return (
        userDate.getMonth() === date.getMonth() &&
        userDate.getFullYear() === date.getFullYear()
      );
    });
  }

  // Search filter
  if (search.trim() !== "") {
    const searchText = search.toLowerCase();

    filteredUsers = filteredUsers.filter(
      (user) =>
        user.fullName.toLowerCase().includes(searchText) ||
        user.email.toLowerCase().includes(searchText) ||
        user.phoneNumber.includes(searchText),
    );
  }

  function viewUser(id) {
    Axios.get(`http://localhost:3000/api/getwomanuserdetails/${id}`)
      .then((response) => {
        setSelectedUser(response.data);
        document.getElementById("userDetailsModal").style.display = "flex";
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function closeUserDetails() {
    document.getElementById("userDetailsModal").style.display = "none";
  }

  return (
    <div className="content-wrapper">
      {/* Page Header */}
      <div className="page-header">
        <h3 className="page-title">Women Users</h3>

        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">Admin</li>
            <li className="breadcrumb-item active">Women Users</li>
          </ol>
        </nav>
      </div>

      {/* Summary Cards */}
      <div className="row">
        <div className="col-md-6 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <p className="card-title">Total Users</p>
              <h3 className="mb-0">{users.length}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-6 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <p className="card-title">New Users</p>
              <h3 className="mb-0">{newUsers}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="row">
        <div className="col-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Registered Women Users</h4>

              <p className="card-description">
                View and manage registered women users.
              </p>

              {/* Search and Status */}
              <div className="row mb-4">
                <div className="col-md-8">
                  <div className="input-group">
                    <input
                      type="text"
                      id="userSearch"
                      className="form-control"
                      placeholder="Search by name, email or phone"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />

                    <div className="input-group-append">
                      <button type="button" className="btn btn-primary">
                        Search
                      </button>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <select
                    id="userFilter"
                    className="form-control"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="All">All Users</option>
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map((user, index) => (
                      <tr key={user._id}>
                        <td>{index + 1}</td>

                        <td>{user.fullName}</td>

                        <td>{user.email}</td>

                        <td>{user.phoneNumber}</td>

                        <td>
                          {user.city}, {user.state}
                        </td>

                        <td>
                          {user.status === "Inactive" ? (
                            <label className="badge badge-danger">
                              Inactive
                            </label>
                          ) : (
                            <label className="badge badge-success">
                              Active
                            </label>
                          )}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => viewUser(user._id)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      <div
        id="userDetailsModal"
        style={{
          display: "none",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1050,
        }}
      >
        <div
          style={{
            backgroundColor: "#fff",
            width: "90%",
            maxWidth: "750px",
            borderRadius: "6px",
            boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
          }}
        >
          {/* Modal Header */}
          <div
            className="d-flex justify-content-between align-items-center"
            style={{
              padding: "18px 25px",
              borderBottom: "1px solid #eee",
            }}
          >
            <h4 className="mb-0">Woman User Details</h4>

            <button
              type="button"
              className="btn btn-light btn-sm"
              onClick={closeUserDetails}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Modal Body */}
          <div
            style={{
              padding: "25px",
              maxHeight: "70vh",
              overflowY: "auto",
            }}
          >
            {/* Personal Information */}
            <div className="text-center mb-4">
              <img
                src={`http://localhost:3000/public/${selectedUser?.profile_photo}`}
                alt="Profile"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            </div>
            <h5 className="mb-3">Personal Information</h5>

            <div className="row">
              <div className="col-md-6 mb-3">
                <small className="text-muted">User ID</small>
                <h6 className="mt-1">{selectedUser?._id}</h6>
              </div>

              <div className="col-md-6 mb-3">
                <small className="text-muted">Full Name</small>
                <h6 className="mt-1">{selectedUser?.fullName}</h6>
              </div>

              <div className="col-md-6 mb-3">
                <small className="text-muted">Email</small>
                <h6 className="mt-1">{selectedUser?.email}</h6>
              </div>

              <div className="col-md-6 mb-3">
                <small className="text-muted">Phone Number</small>
                <h6 className="mt-1">{selectedUser?.phoneNumber}</h6>
              </div>

              <div className="col-md-6 mb-3">
                <small className="text-muted">Gender</small>
                <h6 className="mt-1">{selectedUser?.gender}</h6>
              </div>

              <div className="col-md-6 mb-3">
                <small className="text-muted">Date of Birth</small>
                <h6 className="mt-1">{selectedUser?.dob}</h6>
              </div>
            </div>

            <hr />

            {/* Address Information */}
            <h5 className="mb-3">Address Information</h5>

            <div className="row">
              <div className="col-md-4 mb-3">
                <small className="text-muted">City</small>
                <h6 className="mt-1">{selectedUser?.city}</h6>
              </div>

              <div className="col-md-4 mb-3">
                <small className="text-muted">State</small>
                <h6 className="mt-1">{selectedUser?.state}</h6>
              </div>

              <div className="col-md-4 mb-3">
                <small className="text-muted">Pincode</small>
                <h6 className="mt-1">{selectedUser?.pincode}</h6>
              </div>

              <div className="col-md-12 mb-3">
                <small className="text-muted">Address</small>
                <h6 className="mt-1">{selectedUser?.address}</h6>
              </div>
            </div>

            <hr />

            {/* Account Status */}
            <h5 className="mb-3">Account Status</h5>

            <span
              className={
                selectedUser?.status === "Inactive"
                  ? "badge badge-danger"
                  : "badge badge-success"
              }
            >
              {selectedUser?.status}
            </span>
          </div>

          {/* Modal Footer */}
          <div
            className="d-flex justify-content-end"
            style={{
              padding: "15px 25px",
              borderTop: "1px solid #eee",
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={closeUserDetails}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WomenUsers;
