import React, { useEffect } from "react";

const adminSOSRequests = [
  {
    id: "SOS-1024",
    womanName: "Priya Shah",
    phone: "9876543210",
    location: "Vadodara East",
    requestTime: "13 Sep 2026, 10:30 AM",
    status: "Waiting",
    emergencyType: "Immediate Safety Assistance",
    details:
      "The user has triggered an SOS and is requesting immediate assistance.",
    volunteer: "",
  },
  {
    id: "SOS-1025",
    womanName: "Neha Patel",
    phone: "9876543211",
    location: "Ahmedabad City",
    requestTime: "13 Sep 2026, 10:32 AM",
    status: "Accepted",
    emergencyType: "Emergency Assistance",
    details:
      "SOS request has been accepted by a volunteer and assistance is in progress.",
    volunteer: "Rahul Patel",
  },
  {
    id: "SOS-1026",
    womanName: "Riya Mehta",
    phone: "9876543212",
    location: "Surat City",
    requestTime: "13 Sep 2026, 10:35 AM",
    status: "Waiting",
    emergencyType: "Immediate Safety Assistance",
    details:
      "The user has triggered an SOS and is waiting for volunteer response.",
    volunteer: "",
  },
  {
    id: "SOS-1027",
    womanName: "Sneha Patel",
    phone: "9876543213",
    location: "Vadodara City",
    requestTime: "13 Sep 2026, 10:38 AM",
    status: "Waiting",
    emergencyType: "Emergency Assistance",
    details: "No volunteer has responded to this SOS request yet.",
    volunteer: "",
  },
];

const adminAvailableVolunteers = [
  {
    id: "V001",
    name: "Rahul Patel",
    area: "Vadodara City",
  },
  {
    id: "V002",
    name: "Amit Shah",
    area: "Ahmedabad City",
  },
  {
    id: "V004",
    name: "Vishal Desai",
    area: "Vadodara East",
  },
];

function displayAdminSOSRequests(data) {
  const tableBody = document.getElementById("adminSOSRequestsTableBody");

  if (!tableBody) return;

  if (data.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center">
          No SOS requests found.
        </td>
      </tr>
    `;

    return;
  }

  tableBody.innerHTML = data
    .map(
      (sos) => `
        <tr>

          <td>
            <strong>${sos.id}</strong>
          </td>

          <td>
            ${sos.womanName}
          </td>

          <td>
            ${sos.location}
          </td>

          <td>
            ${sos.requestTime}
          </td>

          <td>
            ${
              sos.status === "Waiting"
                ? `
                  <span class="badge badge-warning">
                    Waiting
                  </span>
                `
                : `
                  <span class="badge badge-success">
                    Accepted - ${sos.volunteer}
                  </span>
                `
            }
          </td>

          <td>

            <button
              type="button"
              class="btn btn-sm btn-outline-primary"
              onclick="adminViewSOSRequest('${sos.id}')"
            >
              View
            </button>

            ${
              sos.status === "Waiting"
                ? `
                  <button
                    type="button"
                    class="btn btn-sm btn-primary ml-1"
                    onclick="openAdminAssignVolunteer('${sos.id}')"
                  >
                    Assign
                  </button>
                `
                : ""
            }

          </td>

        </tr>
      `,
    )
    .join("");
}

function searchAdminSOSRequests() {
  const searchInput = document.getElementById("adminSOSSearch");

  const statusFilter = document.getElementById("adminSOSStatusFilter");

  const searchValue = searchInput.value.toLowerCase();

  const selectedStatus = statusFilter.value;

  const filteredData = adminSOSRequests.filter((sos) => {
    const matchesSearch =
      sos.id.toLowerCase().includes(searchValue) ||
      sos.womanName.toLowerCase().includes(searchValue) ||
      sos.location.toLowerCase().includes(searchValue);

    const matchesStatus =
      selectedStatus === "All" || sos.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  displayAdminSOSRequests(filteredData);
}

function adminViewSOSRequest(id) {
  const sos = adminSOSRequests.find((item) => item.id === id);

  if (!sos) return;

  document.getElementById("adminViewSOSId").innerText = sos.id;

  document.getElementById("adminViewSOSWoman").innerText = sos.womanName;

  document.getElementById("adminViewSOSPhone").innerText = sos.phone;

  document.getElementById("adminViewSOSLocation").innerText = sos.location;

  document.getElementById("adminViewSOSRequestTime").innerText =
    sos.requestTime;

  document.getElementById("adminViewSOSEmergencyType").innerText =
    sos.emergencyType;

  document.getElementById("adminViewSOSDetails").innerText = sos.details;

  document.getElementById("adminViewSOSVolunteer").innerText =
    sos.volunteer || "Not Assigned";

  document.getElementById("adminViewSOSStatus").innerHTML =
    sos.status === "Waiting"
      ? `
        <span class="badge badge-warning">
          Waiting for Volunteer
        </span>
      `
      : `
        <span class="badge badge-success">
          Accepted - ${sos.volunteer}
        </span>
      `;

  document.getElementById("adminViewSOSModal").style.display = "block";
}

function closeAdminSOSModal() {
  document.getElementById("adminViewSOSModal").style.display = "none";
}

function openAdminAssignVolunteer(id) {
  const sos = adminSOSRequests.find((item) => item.id === id);

  if (!sos) return;

  /*
    Admin can assign only when no volunteer
    has responded to the SOS.
  */
  if (sos.status !== "Waiting") {
    alert(`This SOS has already been accepted by ${sos.volunteer}.`);

    return;
  }

  document.getElementById("adminAssignSOSId").innerText = sos.id;

  document.getElementById("adminAssignSOSWoman").innerText = sos.womanName;

  document.getElementById("adminAssignSOSLocation").innerText = sos.location;

  const volunteerSelect = document.getElementById("adminAssignVolunteerSelect");

  volunteerSelect.innerHTML = `
    <option value="">
      Select Volunteer
    </option>

    ${adminAvailableVolunteers
      .map(
        (volunteer) => `
          <option value="${volunteer.id}">
            ${volunteer.name} - ${volunteer.area}
          </option>
        `,
      )
      .join("")}
  `;

  document.getElementById("adminAssignVolunteerModal").style.display = "block";
}

function closeAdminAssignVolunteerModal() {
  document.getElementById("adminAssignVolunteerModal").style.display = "none";
}

function adminAssignVolunteer() {
  const sosId = document.getElementById("adminAssignSOSId").innerText;

  const volunteerId = document.getElementById(
    "adminAssignVolunteerSelect",
  ).value;

  if (!volunteerId) {
    alert("Please select a volunteer.");
    return;
  }

  const sos = adminSOSRequests.find((item) => item.id === sosId);

  const volunteer = adminAvailableVolunteers.find(
    (item) => item.id === volunteerId,
  );

  if (!sos || !volunteer) return;

  /*
    Final safety check:
    If a volunteer accepted the SOS while
    Admin modal was open, Admin cannot assign
    another volunteer.
  */
  if (sos.status !== "Waiting") {
    alert(`This SOS has already been accepted by ${sos.volunteer}.`);

    closeAdminAssignVolunteerModal();

    displayAdminSOSRequests(adminSOSRequests);

    return;
  }

  sos.status = "Accepted";

  sos.volunteer = volunteer.name;

  closeAdminAssignVolunteerModal();

  displayAdminSOSRequests(adminSOSRequests);

  alert(`${volunteer.name} has been assigned to ${sos.id}.`);
}

export default function AdminSOSRequests() {
  /*
    IMPORTANT:
    useEffect must be inside the React component.
  */
  useEffect(() => {
    displayAdminSOSRequests(adminSOSRequests);

    window.adminViewSOSRequest = adminViewSOSRequest;

    window.closeAdminSOSModal = closeAdminSOSModal;

    window.openAdminAssignVolunteer = openAdminAssignVolunteer;

    window.closeAdminAssignVolunteerModal = closeAdminAssignVolunteerModal;

    window.adminAssignVolunteer = adminAssignVolunteer;
  }, []);

  return (
    <div className="content-wrapper">
      {/* Page Header */}
      <div className="page-header">
        <h3 className="page-title">SOS Requests</h3>

        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">SOS Management</li>

            <li className="breadcrumb-item active">SOS Requests</li>
          </ol>
        </nav>
      </div>

      {/* Information */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex align-items-center">
            <i className="mdi mdi-alert-circle-outline icon-md text-warning mr-3"></i>

            <div>
              <h6 className="mb-1">Incoming SOS Requests</h6>

              <p className="mb-0 text-muted">
                Volunteers receive SOS requests first. Admin can assign a
                volunteer only when no volunteer has responded.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-7">
              <input
                type="text"
                id="adminSOSSearch"
                className="form-control"
                placeholder="Search SOS ID, woman name or location..."
                onKeyUp={searchAdminSOSRequests}
              />
            </div>

            <div className="col-md-5">
              <select
                id="adminSOSStatusFilter"
                className="form-control"
                onChange={searchAdminSOSRequests}
              >
                <option value="All">All Requests</option>

                <option value="Waiting">Waiting</option>

                <option value="Accepted">Accepted</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* SOS Table */}
      <div className="card">
        <div className="card-body">
          <h4 className="card-title">SOS Request List</h4>

          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>SOS ID</th>

                  <th>Woman User</th>

                  <th>Location</th>

                  <th>Request Time</th>

                  <th>Response Status</th>

                  <th>Action</th>
                </tr>
              </thead>

              <tbody id="adminSOSRequestsTableBody"></tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View SOS Modal */}
      <div
        id="adminViewSOSModal"
        style={{
          display: "none",
          position: "fixed",
          zIndex: 1050,
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          overflow: "auto",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            backgroundColor: "#fff",
            margin: "5% auto",
            padding: "25px",
            width: "60%",
            borderRadius: "8px",
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">SOS Request Details</h4>

            <button
              type="button"
              onClick={closeAdminSOSModal}
              style={{
                border: "none",
                background: "#f1f3f5",
                width: "35px",
                height: "35px",
                borderRadius: "50%",
                fontSize: "22px",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <strong>SOS ID</strong>

              <p id="adminViewSOSId" className="text-muted mb-0"></p>
            </div>

            <div className="col-md-6 mb-3">
              <strong>Status</strong>

              <p id="adminViewSOSStatus" className="mb-0"></p>
            </div>

            <div className="col-md-6 mb-3">
              <strong>Woman User</strong>

              <p id="adminViewSOSWoman" className="text-muted mb-0"></p>
            </div>

            <div className="col-md-6 mb-3">
              <strong>Phone Number</strong>

              <p id="adminViewSOSPhone" className="text-muted mb-0"></p>
            </div>

            <div className="col-md-6 mb-3">
              <strong>Location</strong>

              <p id="adminViewSOSLocation" className="text-muted mb-0"></p>
            </div>

            <div className="col-md-6 mb-3">
              <strong>Request Time</strong>

              <p id="adminViewSOSRequestTime" className="text-muted mb-0"></p>
            </div>

            <div className="col-md-6 mb-3">
              <strong>Emergency Type</strong>

              <p id="adminViewSOSEmergencyType" className="text-muted mb-0"></p>
            </div>

            <div className="col-md-6 mb-3">
              <strong>Assigned Volunteer</strong>

              <p id="adminViewSOSVolunteer" className="text-muted mb-0"></p>
            </div>

            <div className="col-md-12">
              <strong>Emergency Details</strong>

              <p id="adminViewSOSDetails" className="text-muted mb-0"></p>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Volunteer Modal */}
      <div
        id="adminAssignVolunteerModal"
        style={{
          display: "none",
          position: "fixed",
          zIndex: 1060,
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          overflow: "auto",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            backgroundColor: "#fff",
            margin: "8% auto",
            padding: "25px",
            width: "45%",
            borderRadius: "8px",
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">Assign Volunteer</h4>

            <button
              type="button"
              onClick={closeAdminAssignVolunteerModal}
              style={{
                border: "none",
                background: "#f1f3f5",
                width: "35px",
                height: "35px",
                borderRadius: "50%",
                fontSize: "22px",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>

          <div className="mb-3">
            <strong>SOS ID:</strong>

            <span id="adminAssignSOSId" className="ml-2"></span>
          </div>

          <div className="mb-3">
            <strong>Woman User:</strong>

            <span id="adminAssignSOSWoman" className="ml-2"></span>
          </div>

          <div className="mb-4">
            <strong>Location:</strong>

            <span id="adminAssignSOSLocation" className="ml-2"></span>
          </div>

          <div className="form-group">
            <label>Select Available Volunteer</label>

            <select id="adminAssignVolunteerSelect" className="form-control">
              <option value="">Select Volunteer</option>
            </select>
          </div>

          <div className="text-right mt-4">
            <button
              type="button"
              className="btn btn-light mr-2"
              onClick={closeAdminAssignVolunteerModal}
            >
              Cancel
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={adminAssignVolunteer}
            >
              Assign Volunteer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
