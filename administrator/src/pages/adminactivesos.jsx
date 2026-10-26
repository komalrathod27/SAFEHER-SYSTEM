import React, { useEffect } from "react";

const activeSOSCases = [
  {
    id: "SOS-1025",
    womanName: "Neha Patel",
    phone: "9876543211",
    location: "Ahmedabad City",
    startedTime: "13 Sep 2026, 10:32 AM",
    volunteer: "Rahul Patel",
    volunteerId: "V001",
    responseTime: "10:34 AM",
    status: "Volunteer Responding",
    emergencyType: "Emergency Assistance",
    details:
      "The volunteer has accepted the SOS request and is responding to the woman.",
    liveLocation: "Shared",
  },
  {
    id: "SOS-1028",
    womanName: "Anjali Desai",
    phone: "9876543225",
    location: "Vadodara East",
    startedTime: "13 Sep 2026, 10:45 AM",
    volunteer: "Vishal Desai",
    volunteerId: "V004",
    responseTime: "10:47 AM",
    status: "Assistance in Progress",
    emergencyType: "Immediate Safety Assistance",
    details: "The volunteer is currently providing assistance to the woman.",
    liveLocation: "Shared",
  },
  {
    id: "SOS-1029",
    womanName: "Pooja Mehta",
    phone: "9876543226",
    location: "Surat City",
    startedTime: "13 Sep 2026, 10:50 AM",
    volunteer: "Amit Shah",
    volunteerId: "V002",
    responseTime: "10:53 AM",
    status: "Assistance in Progress",
    emergencyType: "Emergency Assistance",
    details:
      "The volunteer has reached the user and assistance is currently in progress.",
    liveLocation: "Shared",
  },
];

function displayActiveSOSCases(data) {
  const tableBody = document.getElementById("activeSOSTableBody");

  if (!tableBody) return;

  tableBody.innerHTML = "";

  if (data.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-4">
          No active SOS cases found.
        </td>
      </tr>
    `;
    return;
  }

  data.forEach((sos) => {
    let statusBadge = "badge-warning";

    if (sos.status === "Assistance in Progress") {
      statusBadge = "badge-primary";
    }

    tableBody.innerHTML += `
      <tr>

        <td>
          <strong>${sos.id}</strong>
        </td>

        <td>
          <strong>${sos.womanName}</strong>
        </td>

        <td>
          ${sos.location}
        </td>

        <td>
          <strong>${sos.volunteer}</strong>
        </td>

        <td>
          <span class="badge ${statusBadge}">
            ${sos.status}
          </span>
        </td>

        <td>
          <button
            class="btn btn-sm btn-outline-primary"
            onclick="adminViewActiveSOS('${sos.id}')"
          >
            View
          </button>
        </td>

      </tr>
    `;
  });
}

function searchActiveSOSCases() {
  const searchValue =
    document.getElementById("activeSOSSearch")?.value.toLowerCase().trim() ||
    "";

  const statusValue =
    document.getElementById("activeSOSStatusFilter")?.value || "";

  const filteredData = activeSOSCases.filter((sos) => {
    const matchesSearch =
      sos.id.toLowerCase().includes(searchValue) ||
      sos.womanName.toLowerCase().includes(searchValue) ||
      sos.location.toLowerCase().includes(searchValue) ||
      sos.volunteer.toLowerCase().includes(searchValue);

    const matchesStatus = statusValue === "" || sos.status === statusValue;

    return matchesSearch && matchesStatus;
  });

  displayActiveSOSCases(filteredData);
}

function adminViewActiveSOS(id) {
  const sos = activeSOSCases.find((item) => item.id === id);

  if (!sos) return;

  document.getElementById("activeSOSId").innerText = sos.id;

  document.getElementById("activeSOSStatus").innerText = sos.status;

  document.getElementById("activeSOSWoman").innerText = sos.womanName;

  document.getElementById("activeSOSPhone").innerText = sos.phone;

  document.getElementById("activeSOSLocation").innerText = sos.location;

  document.getElementById("activeSOSStartedTime").innerText = sos.startedTime;

  document.getElementById("activeSOSEmergencyType").innerText =
    sos.emergencyType;

  document.getElementById("activeSOSVolunteer").innerText =
    `${sos.volunteer} (${sos.volunteerId})`;

  document.getElementById("activeSOSResponseTime").innerText = sos.responseTime;

  document.getElementById("activeSOSLiveLocation").innerText = sos.liveLocation;

  document.getElementById("activeSOSDetails").innerText = sos.details;

  document.getElementById("activeSOSModal").style.display = "flex";
}

function closeActiveSOSModal() {
  document.getElementById("activeSOSModal").style.display = "none";
}

export default function AdminActiveSOS() {
  useEffect(() => {
    displayActiveSOSCases(activeSOSCases);

    window.adminViewActiveSOS = adminViewActiveSOS;

    window.closeActiveSOSModal = closeActiveSOSModal;

    return () => {
      delete window.adminViewActiveSOS;

      delete window.closeActiveSOSModal;
    };
  }, []);

  return (
    <div className="content-wrapper">
      {/* Page Header */}
      <div className="page-header">
        <h3 className="page-title">Active SOS</h3>

        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">SOS Management</li>

            <li className="breadcrumb-item active">Active SOS</li>
          </ol>
        </nav>
      </div>

      {/* Information */}
      <div className="row">
        <div className="col-md-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center flex-wrap">
                <div>
                  <h4 className="card-title mb-1">Active SOS Cases</h4>

                  <p className="text-muted mb-0">
                    Monitor SOS cases currently being handled by volunteers.
                  </p>
                </div>

                <div className="mt-2 mt-md-0">
                  <span className="badge badge-danger p-2">
                    Live Monitoring
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="row">
        <div className="col-md-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-md-7">
                  <div className="form-group mb-0">
                    <label>Search Active SOS</label>

                    <input
                      type="text"
                      id="activeSOSSearch"
                      className="form-control"
                      placeholder="Search by SOS ID, woman, location or volunteer"
                      onKeyUp={searchActiveSOSCases}
                    />
                  </div>
                </div>

                <div className="col-md-5">
                  <div className="form-group mb-0">
                    <label>Current Status</label>

                    <select
                      id="activeSOSStatusFilter"
                      className="form-control"
                      onChange={searchActiveSOSCases}
                    >
                      <option value="">All Active Cases</option>

                      <option value="Volunteer Responding">
                        Volunteer Responding
                      </option>

                      <option value="Assistance in Progress">
                        Assistance in Progress
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active SOS Table */}
      <div className="row">
        <div className="col-md-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h4 className="card-title mb-1">Currently Active</h4>

                  <p className="text-muted mb-0">
                    Ongoing SOS cases under volunteer assistance.
                  </p>
                </div>

                <span className="badge badge-info">Volunteer Managed</span>
              </div>

              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>SOS ID</th>

                      <th>Woman User</th>

                      <th>Location</th>

                      <th>Volunteer</th>

                      <th>Status</th>

                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody id="activeSOSTableBody"></tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Active SOS Modal */}
      <div
        id="activeSOSModal"
        style={{
          display: "none",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 9999,
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div
          className="card"
          style={{
            width: "100%",
            maxWidth: "750px",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <div className="card-body">
            {/* Modal Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4 className="card-title mb-1">Active SOS Details</h4>

                <span id="activeSOSId" className="text-muted"></span>
              </div>

              <button
                type="button"
                className="btn btn-light btn-sm"
                onClick={() => window.closeActiveSOSModal()}
                style={{
                  borderRadius: "10%",
                  width: "33px",
                  height: "33px",
                  padding: 0,
                  fontSize: "29px",
                }}
              >
                ×
              </button>
            </div>

            {/* Status */}
            <div className="mb-4">
              <span className="text-muted">Current Status</span>

              <div className="mt-1">
                <span
                  id="activeSOSStatus"
                  className="badge badge-warning"
                ></span>
              </div>
            </div>

            {/* Woman Information */}
            <h5 className="mb-3">Woman User Information</h5>

            <div className="row">
              <div className="col-md-6">
                <p>
                  <strong>Name:</strong> <span id="activeSOSWoman"></span>
                </p>
              </div>

              <div className="col-md-6">
                <p>
                  <strong>Phone:</strong> <span id="activeSOSPhone"></span>
                </p>
              </div>

              <div className="col-md-6">
                <p>
                  <strong>Location:</strong>{" "}
                  <span id="activeSOSLocation"></span>
                </p>
              </div>

              <div className="col-md-6">
                <p>
                  <strong>SOS Started:</strong>{" "}
                  <span id="activeSOSStartedTime"></span>
                </p>
              </div>
            </div>

            <hr />

            {/* Emergency Information */}
            <h5 className="mb-3">Emergency Information</h5>

            <div className="row">
              <div className="col-md-6">
                <p>
                  <strong>Emergency Type:</strong>{" "}
                  <span id="activeSOSEmergencyType"></span>
                </p>
              </div>

              <div className="col-md-6">
                <p>
                  <strong>Live Location:</strong>{" "}
                  <span
                    id="activeSOSLiveLocation"
                    className="badge badge-success"
                  ></span>
                </p>
              </div>
            </div>

            <hr />

            {/* Volunteer Information */}
            <h5 className="mb-3">Volunteer Response</h5>

            <div className="row">
              <div className="col-md-6">
                <p>
                  <strong>Volunteer:</strong>{" "}
                  <span id="activeSOSVolunteer"></span>
                </p>
              </div>

              <div className="col-md-6">
                <p>
                  <strong>Response Time:</strong>{" "}
                  <span id="activeSOSResponseTime"></span>
                </p>
              </div>
            </div>

            <hr />

            {/* Assistance Details */}
            <h5 className="mb-3">Assistance Details</h5>

            <div
              className="p-3"
              style={{
                backgroundColor: "#f8f9fa",
                borderRadius: "5px",
              }}
            >
              <p id="activeSOSDetails" className="mb-0"></p>
            </div>

            {/* Admin Monitoring Note */}
            <div className="alert alert-info mt-4 mb-0">
              <strong>Admin Monitoring:</strong> This SOS is currently being
              handled by the assigned volunteer. The volunteer is responsible
              for completing the assistance.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
