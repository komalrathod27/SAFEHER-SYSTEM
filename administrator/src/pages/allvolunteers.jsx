import React, { useEffect, useState } from "react";
import Axios from "axios";

function AllVolunteers() {
  const [list, setList] = useState([]);
  const [status, setStatus] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    Axios.get("http://localhost:3000/api/getvolunteer")
      .then((response) => {
        setList(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  // Filter volunteers by status
  const filteredList = list.filter((item) => {
    if (filter === "All") {
      return true;
    }
    return item.status === filter;
  });

  function viewApplication(_id) {
    setSelectedId(_id);
    $("#viewApplicationModal").modal("show");

    Axios.get(`http://localhost:3000/api/getvolunteerdetails/${_id}`)
      .then((response) => {
        const data = response.data;
        setStatus(data.status);

        document.getElementById("name").innerText = data.name;
        document.getElementById("email").innerText = data.email;
        document.getElementById("profile_photo").src =
          "http://localhost:3000/volunteer/" + data.profile_photo;
        document.getElementById("gender").innerText = data.gender;
        document.getElementById("dob").innerText = data.dob;
        document.getElementById("city").innerText = data.city;
        document.getElementById("state").innerText = data.state;
        document.getElementById("pincode").innerText = data.pincode;
        document.getElementById("address").innerText = data.address;
        document.getElementById("qualification").innerText = data.qualification;
        document.getElementById("serviceArea").innerText = data.serviceArea;
        document.getElementById("proof_type").innerText = data.proof_type;
        document.getElementById("proof").src =
          "http://localhost:3000/volunteer/" + data.proof;
        document.getElementById("reason").innerText = data.reason;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function approveVolunteer(_id) {
    console.log("Approved ID:", _id);

    Axios.put(`http://localhost:3000/api/approvestatus/${_id}`)
      .then((response) => {
        console.log(response.data);

        alert("Volunteer approved successfully");

        // Update status in table
        setList((oldList) =>
          oldList.map((item) =>
            item._id === _id ? { ...item, status: "Approved" } : item,
          ),
        );

        setStatus("Approved");
        // Close modal
        $("#viewApplicationModal").modal("hide");
      })
      .catch((error) => {
        console.log("APPROVE ERROR:", error);
        console.log("RESPONSE:", error.response);
        alert("Error while approving volunteer");
      });
  }

  function rejectVolunteer(_id) {
    console.log("Rejected ID:", _id);

    Axios.put(`http://localhost:3000/api/rejectstatus/${_id}`)
      .then((response) => {
        console.log(response.data);

        alert("Volunteer rejected successfully");

        // Update status in table
        setList((oldList) =>
          oldList.map((item) =>
            item._id === _id ? { ...item, status: "Rejected" } : item,
          ),
        );

        // Update modal status
        setStatus("Rejected");
        // Close modal
        $("#viewApplicationModal").modal("hide");
      })
      .catch((error) => {
        console.log("REJECT ERROR:", error);
        console.log("RESPONSE:", error.response);

        alert("Error while rejecting volunteer");
      });
  }

  return (
    <div className="content-wrapper">
      {/* Page Header */}
      <div className="row">
        <div className="col-md-12 grid-margin">
          <h3 className="font-weight-bold">All Volunteers</h3>
        </div>
      </div>

      {/* Table */}
      <div className="row">
        <div className="col-md-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Volunteer Applications</h4>

              <p className="card-description">
                Review volunteer applications before granting dashboard access.
              </p>

              {/* Status Filter */}
              <div className="row mb-4">
                <div className="col-md-4">
                  <select
                    className="form-control"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="All">All Volunteers</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Volunteer Name</th>
                      <th>Email</th>
                      <th>City</th>
                      <th>Contact no</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredList.map((Val, index) => (
                      <tr key={Val._id}>
                        <td>{index + 1}</td>
                        <td>{Val.name}</td>
                        <td>{Val.email}</td>
                        <td>{Val.city}</td>
                        <td>{Val.contact_no}</td>
                        <td>
                          <span
                            className={
                              Val.status === "Approved"
                                ? "badge badge-success"
                                : Val.status === "Rejected"
                                  ? "badge badge-danger"
                                  : "badge badge-warning"
                            }
                          >
                            {Val.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-primary"
                            onClick={() => viewApplication(Val._id)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div
                  className="modal fade"
                  id="viewApplicationModal"
                  tabIndex="-1"
                  role="dialog"
                >
                  <div
                    className="modal-dialog"
                    role="document"
                    style={{ maxWidth: "800px" }}
                  >
                    <div className="modal-content">
                      {/* Header */}
                      <div className="modal-header py-3">
                        <div>
                          <h5 className="mb-1">Volunteer Details</h5>
                          <small className="text-muted">
                            Volunteer Registration Details
                          </small>
                        </div>

                        <button
                          type="button"
                          className="close"
                          data-dismiss="modal"
                        >
                          <span>&times;</span>
                        </button>
                      </div>

                      {/* Body */}
                      <div className="modal-body">
                        {/* Profile Photo */}
                        <div className="text-center mb-4">
                          <img
                            id="profile_photo"
                            src=""
                            alt="Volunteer"
                            style={{
                              width: "150px",
                              height: "150px",
                              objectFit: "cover",
                            }}
                          />
                        </div>

                        {/* Personal Information */}
                        <h6 className="font-weight-bold mb-3">
                          Personal Information
                        </h6>

                        <div className="row">
                          <div className="col-md-6 mb-2">
                            <small className="text-muted">Name</small>
                            <p id="name" className="mb-0"></p>
                          </div>

                          <div className="col-md-6 mb-2">
                            <small className="text-muted">Email</small>
                            <p id="email" className="mb-0"></p>
                          </div>

                          <div className="col-md-6 mb-2">
                            <small className="text-muted">Gender</small>
                            <p id="gender" className="mb-0"></p>
                          </div>

                          <div className="col-md-6 mb-2">
                            <small className="text-muted">Date of Birth</small>
                            <p id="dob" className="mb-0"></p>
                          </div>
                        </div>

                        <hr />

                        {/* Address Information */}
                        <h6 className="font-weight-bold mb-3">
                          Address Information
                        </h6>

                        <div className="row">
                          <div className="col-md-4 mb-2">
                            <small className="text-muted">City</small>
                            <p id="city" className="mb-0"></p>
                          </div>

                          <div className="col-md-4 mb-2">
                            <small className="text-muted">State</small>
                            <p id="state" className="mb-0"></p>
                          </div>

                          <div className="col-md-4 mb-2">
                            <small className="text-muted">Pincode</small>
                            <p id="pincode" className="mb-0"></p>
                          </div>

                          <div className="col-md-12 mb-2">
                            <small className="text-muted">Address</small>
                            <p id="address" className="mb-0"></p>
                          </div>
                        </div>

                        <hr />

                        {/* Volunteer Information */}
                        <h6 className="font-weight-bold mb-3">
                          Volunteer Information
                        </h6>

                        <div className="row">
                          <div className="col-md-6 mb-2">
                            <small className="text-muted">Qualification</small>
                            <p id="qualification" className="mb-0"></p>
                          </div>

                          <div className="col-md-6 mb-2">
                            <small className="text-muted">
                              Preferred Service Area
                            </small>
                            <p id="serviceArea" className="mb-0"></p>
                          </div>

                          <div className="col-md-12 mb-2">
                            <small className="text-muted">
                              Reason for Joining
                            </small>
                            <p id="reason" className="mb-0"></p>
                          </div>
                        </div>

                        <hr />

                        {/* Identity Verification */}
                        <h6 className="font-weight-bold mb-3">
                          Identity Verification
                        </h6>

                        <div className="row">
                          <div className="col-md-6 mb-2">
                            <small className="text-muted">ID Proof Type</small>
                            <p id="proof_type" className="mb-0"></p>
                          </div>

                          <div className="col-md-6 mb-2">
                            <small className="text-muted">ID Proof</small>

                            <div className="mt-2">
                              <img
                                id="proof"
                                src=""
                                alt="ID Proof"
                                style={{
                                  width: "100%",
                                  maxWidth: "190px",
                                  height: "110px",
                                  objectFit: "cover",
                                  border: "1px solid #ddd",
                                  borderRadius: "5px",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="modal-footer py-2">
                        {status === "Pending" && (
                          <>
                            <button
                              type="button"
                              className="btn btn-success btn-sm"
                              onClick={() => approveVolunteer(selectedId)}
                            >
                              Approve
                            </button>

                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => rejectVolunteer(selectedId)}
                            >
                              Reject
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          className="btn btn-light btn-sm"
                          data-dismiss="modal"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllVolunteers;
