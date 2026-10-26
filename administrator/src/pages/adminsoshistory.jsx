import React, { useEffect } from "react";

const sosHistory = [
  {
    id: "SOS-1018",
    womanName: "Priya Shah",
    phone: "9876543210",
    location: "Vadodara City",
    volunteer: "Rahul Patel",
    volunteerId: "V001",
    emergencyType: "Immediate Safety Assistance",
    startedTime: "11 Sep 2026, 08:20 PM",
    acceptedTime: "08:24 PM",
    respondingTime: "08:25 PM",
    locationSharedTime: "08:29 PM",
    completedTime: "08:38 PM",
    responseTime: "4 min",
    outcome:
      "The volunteer responded to the SOS request and successfully assisted the woman.",
    feedback: "Volunteer responded quickly and helped me reach a safe place.",
    rating: 5,
    status: "Completed",
  },

  {
    id: "SOS-1019",
    womanName: "Neha Patel",
    phone: "9876543211",
    location: "Ahmedabad City",
    volunteer: "Amit Shah",
    volunteerId: "V002",
    emergencyType: "Emergency Assistance",
    startedTime: "10 Sep 2026, 06:15 PM",
    acceptedTime: "06:18 PM",
    respondingTime: "06:19 PM",
    locationSharedTime: "06:21 PM",
    completedTime: "06:30 PM",
    responseTime: "3 min",
    outcome:
      "The volunteer reached the user and provided the required emergency assistance.",
    feedback:
      "The volunteer was helpful and stayed connected until I was safe.",
    rating: 4,
    status: "Completed",
  },

  {
    id: "SOS-1020",
    womanName: "Riya Mehta",
    phone: "9876543212",
    location: "Surat City",
    volunteer: "Vishal Desai",
    volunteerId: "V004",
    emergencyType: "Immediate Safety Assistance",
    startedTime: "09 Sep 2026, 09:10 PM",
    acceptedTime: "09:13 PM",
    respondingTime: "09:14 PM",
    locationSharedTime: "09:17 PM",
    completedTime: "09:27 PM",
    responseTime: "3 min",
    outcome:
      "The volunteer assisted the woman and completed the SOS case successfully.",
    feedback: "",
    rating: 0,
    status: "Completed",
  },

  {
    id: "SOS-1017",
    womanName: "Sneha Patel",
    phone: "9876543213",
    location: "Vadodara East",
    volunteer: "Rahul Patel",
    volunteerId: "V001",
    emergencyType: "Emergency Assistance",
    startedTime: "08 Sep 2026, 07:40 PM",
    acceptedTime: "07:44 PM",
    respondingTime: "07:45 PM",
    locationSharedTime: "07:48 PM",
    completedTime: "08:02 PM",
    responseTime: "4 min",
    outcome:
      "Emergency assistance was completed after the volunteer remained connected with the user.",
    feedback: "Thank you for responding and helping during the emergency.",
    rating: 5,
    status: "Completed",
  },
];

function getStars(rating) {
  if (!rating) {
    return `<span class="text-muted">No rating</span>`;
  }

  return `
    <span class="text-warning">
      ${"★".repeat(rating)}
    </span>
    <span class="text-muted ml-1">(${rating}/5)</span>
  `;
}

function displaySOSHistory(data) {
  const container = document.getElementById("sosHistoryContainer");

  if (!container) return;

  if (data.length === 0) {
    container.innerHTML = `
      <div class="col-12">
        <div class="card">
          <div class="card-body text-center py-5">
            <i class="mdi mdi-history mdi-36px text-muted"></i>

            <h5 class="mt-3">
              No SOS Cases Found
            </h5>

            <p class="text-muted mb-0">
              No completed SOS cases match your search.
            </p>
          </div>
        </div>
      </div>
    `;

    return;
  }

  container.innerHTML = data
    .map(
      (item) => `
        <div class="col-md-6 mb-4">

          <div class="card h-100">

            <div class="card-body">

              <div class="d-flex justify-content-between align-items-start mb-3">

                <div>
                  <h5 class="mb-1">
                    ${item.id}
                  </h5>

                  <small class="text-muted">
                    ${item.emergencyType}
                  </small>
                </div>

                <span class="badge badge-success">
                  ${item.status}
                </span>

              </div>


              <div class="row mb-3">

                <div class="col-6 mb-3">

                  <small class="text-muted d-block">
                    Woman User
                  </small>

                  <strong>
                    ${item.womanName}
                  </strong>

                </div>


                <div class="col-6 mb-3">

                  <small class="text-muted d-block">
                    Location
                  </small>

                  <strong>
                    ${item.location}
                  </strong>

                </div>


                <div class="col-6">

                  <small class="text-muted d-block">
                    Response Time
                  </small>

                  <strong>
                    ${item.responseTime}
                  </strong>

                </div>


                <div class="col-6">

                  <small class="text-muted d-block">
                    Volunteer
                  </small>

                  <strong>
                    ${item.volunteer}
                  </strong>

                </div>

              </div>


              <hr />

              <button
                class="btn btn-sm btn-outline-primary"
                onclick="viewSOSHistory('${item.id}')"
              >
                View Case
              </button>

            </div>

          </div>

        </div>
      `,
    )
    .join("");
}

function searchSOSHistory() {
  const input = document.getElementById("sosHistorySearch");

  if (!input) return;

  const searchValue = input.value.toLowerCase().trim();

  const filteredData = sosHistory.filter((item) => {
    return (
      item.id.toLowerCase().includes(searchValue) ||
      item.womanName.toLowerCase().includes(searchValue) ||
      item.location.toLowerCase().includes(searchValue) ||
      item.volunteer.toLowerCase().includes(searchValue) ||
      item.emergencyType.toLowerCase().includes(searchValue)
    );
  });

  displaySOSHistory(filteredData);
}

function viewSOSHistory(id) {
  const item = sosHistory.find((caseItem) => caseItem.id === id);

  if (!item) return;

  document.getElementById("historySOSId").innerText = item.id;

  document.getElementById("historyWomanName").innerText = item.womanName;

  document.getElementById("historyWomanPhone").innerText = item.phone;

  document.getElementById("historyLocation").innerText = item.location;

  document.getElementById("historyEmergencyType").innerText =
    item.emergencyType;

  document.getElementById("historyVolunteer").innerText = item.volunteer;

  document.getElementById("historyVolunteerId").innerText = item.volunteerId;

  document.getElementById("historyStarted").innerText = item.startedTime;

  document.getElementById("historyAccepted").innerText = item.acceptedTime;

  document.getElementById("historyResponding").innerText = item.respondingTime;

  document.getElementById("historyLocationShared").innerText =
    item.locationSharedTime;

  document.getElementById("historyCompleted").innerText = item.completedTime;

  document.getElementById("historyResponseTime").innerText = item.responseTime;

  document.getElementById("historyOutcome").innerText = item.outcome;

  document.getElementById("historyFeedback").innerText =
    item.feedback || "No feedback submitted.";

  document.getElementById("historyRating").innerHTML = getStars(item.rating);

  document.getElementById("sosHistoryModal").style.display = "block";
}

function closeSOSHistoryModal() {
  const modal = document.getElementById("sosHistoryModal");

  if (modal) {
    modal.style.display = "none";
  }
}

function AdminSOSHistory() {
  useEffect(() => {
    displaySOSHistory(sosHistory);

    window.viewSOSHistory = viewSOSHistory;
    window.closeSOSHistoryModal = closeSOSHistoryModal;

    return () => {
      delete window.viewSOSHistory;
      delete window.closeSOSHistoryModal;
    };
  }, []);

  return (
    <div className="content-wrapper">
      {/* Page Header */}

      <div className="row">
        <div className="col-12 grid-margin">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="card-title mb-1">SOS History</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}

      <div className="row">
        <div className="col-12 grid-margin">
          <div className="card">
            <div className="card-body">
              <div className="form-group mb-0">
                <label>Search Cases</label>

                <input
                  type="text"
                  id="sosHistorySearch"
                  className="form-control"
                  placeholder="Search by SOS ID, woman, volunteer, location..."
                  onKeyUp={searchSOSHistory}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History Cards */}

      <div className="row" id="sosHistoryContainer"></div>

      {/* View Case Modal */}

      <div
        id="sosHistoryModal"
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
          className="modal-dialog modal-lg"
          style={{
            margin: "60px auto",
            maxWidth: "850px",
          }}
        >
          <div className="modal-content">
            {/* Modal Header */}

            <div className="modal-header">
              <div>
                <h5 className="modal-title mb-1">SOS Case Details</h5>

                <small className="text-muted" id="historySOSId"></small>
              </div>

              <button
                type="button"
                onClick={closeSOSHistoryModal}
                style={{
                  border: "none",
                  background: "#e92e2e",
                  color: "#ffffff",
                  width: "33px",
                  height: "33px",
                  borderRadius: "10%",
                  fontSize: "30px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span>&times;</span>
              </button>
            </div>

            <div className="modal-body">
              {/* Case Information */}

              <h5 className="mb-3">Case Information</h5>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <small className="text-muted d-block">Woman User</small>

                  <strong id="historyWomanName"></strong>
                </div>

                <div className="col-md-6 mb-3">
                  <small className="text-muted d-block">Phone Number</small>

                  <strong id="historyWomanPhone"></strong>
                </div>

                <div className="col-md-6 mb-3">
                  <small className="text-muted d-block">Location</small>

                  <strong id="historyLocation"></strong>
                </div>

                <div className="col-md-6 mb-3">
                  <small className="text-muted d-block">Emergency Type</small>

                  <strong id="historyEmergencyType"></strong>
                </div>
              </div>

              <hr />

              {/* Volunteer Response */}

              <h5 className="mb-3">Volunteer Response</h5>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <small className="text-muted d-block">Volunteer</small>

                  <strong id="historyVolunteer"></strong>
                </div>

                <div className="col-md-6 mb-3">
                  <small className="text-muted d-block">Volunteer ID</small>

                  <strong id="historyVolunteerId"></strong>
                </div>

                <div className="col-md-6 mb-3">
                  <small className="text-muted d-block">Response Time</small>

                  <strong id="historyResponseTime"></strong>
                </div>
              </div>

              <hr />

              {/* Emergency Timeline */}

              <h5 className="mb-3">Emergency Timeline</h5>

              <div className="border rounded p-3">
                <div className="d-flex justify-content-between align-items-center py-2">
                  <div>
                    <span className="text-success mr-2">✓</span>

                    <strong>SOS Triggered</strong>
                  </div>

                  <small className="text-muted" id="historyStarted"></small>
                </div>

                <div className="d-flex justify-content-between align-items-center py-2">
                  <div>
                    <span className="text-success mr-2">✓</span>
                    Volunteer Accepted
                  </div>

                  <small className="text-muted" id="historyAccepted"></small>
                </div>

                <div className="d-flex justify-content-between align-items-center py-2">
                  <div>
                    <span className="text-success mr-2">✓</span>
                    Volunteer Responding
                  </div>

                  <small className="text-muted" id="historyResponding"></small>
                </div>

                <div className="d-flex justify-content-between align-items-center py-2">
                  <div>
                    <span className="text-success mr-2">✓</span>
                    Live Location Shared
                  </div>

                  <small
                    className="text-muted"
                    id="historyLocationShared"
                  ></small>
                </div>

                <div className="d-flex justify-content-between align-items-center py-2">
                  <div>
                    <span className="text-success mr-2">✓</span>

                    <strong>Assistance Completed</strong>
                  </div>

                  <small className="text-muted" id="historyCompleted"></small>
                </div>
              </div>

              <hr />

              {/* Case Outcome */}

              <h5 className="mb-3">Case Outcome</h5>

              <div className="p-3 border rounded mb-4">
                <p className="mb-0" id="historyOutcome"></p>
              </div>

              {/* Feedback */}

              <h5 className="mb-3">Woman Feedback</h5>

              <div className="p-3 border rounded">
                <p className="mb-2" id="historyFeedback"></p>

                <div id="historyRating"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSOSHistory;
