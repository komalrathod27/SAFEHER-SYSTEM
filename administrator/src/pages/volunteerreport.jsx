import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:3000";

function getList(data, keys = []) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  return [];
}

function formatDate(date) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getVolunteerRegistrationDate(volunteer) {
  const registrationDate =
    volunteer?.createdAt ||
    volunteer?.registrationDate ||
    volunteer?.registeredAt;

  const volunteerId = String(volunteer?._id || "");
  const objectIdDate = /^[a-f\d]{24}$/i.test(volunteerId)
    ? new Date(Number.parseInt(volunteerId.slice(0, 8), 16) * 1000)
    : null;

  if (registrationDate) {
    const parsedRegistrationDate = new Date(registrationDate);

    if (
      objectIdDate &&
      !Number.isNaN(parsedRegistrationDate.getTime()) &&
      parsedRegistrationDate.getTime() > objectIdDate.getTime() + 60_000
    ) {
      return objectIdDate;
    }

    return registrationDate;
  }

  return objectIdDate;
}

function getResponseTime(sos) {
  const responseAt = sos.acceptedAt || sos.assignedAt;
  if (!sos.createdAt || !responseAt) return "—";

  const createdAt = new Date(sos.createdAt);
  const respondedAt = new Date(responseAt);
  const minutes = (respondedAt.getTime() - createdAt.getTime()) / 60000;

  if (!Number.isFinite(minutes) || minutes < 0) return "—";

  if (minutes < 1) {
    return `${Math.round(minutes * 60)} sec`;
  }

  return `${minutes.toFixed(1)} min`;
}

function VolunteerReport() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [volunteer, setVolunteer] = useState(null);
  const [sosHistory, setSosHistory] = useState([]);
  const [trustData, setTrustData] = useState(null);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);

  const [selectedSOS, setSelectedSOS] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchVolunteerReport();
  }, [id]);

  const fetchVolunteerReport = async () => {
    try {
      setLoading(true);
      setError("");

      const [volunteerRes, sosRes, trustRes, responsesRes] = await Promise.all([
        axios.get(`${API}/api/getvolunteer`),
        axios.get(`${API}/api/sos/all`),
        axios.get(`${API}/api/sos/trust-score/${id}`),
        axios.get(`${API}/api/sos/my-responses/${id}`),
      ]);

      // Volunteer Profile
      const volunteers = getList(volunteerRes.data, [
        "volunteers",
        "users",
        "data",
      ]);

      const selectedVolunteer = volunteers.find(
        (item) => String(item._id) === String(id),
      );

      if (!selectedVolunteer) {
        setError("Volunteer not found.");
        return;
      }

      setVolunteer(selectedVolunteer);

      // All SOS Records
      const allSOS = getList(sosRes.data, ["requests", "data"]);

      // Responses API
      const responses = getList(responsesRes.data, ["responses", "data"]);

      // Rejected SOS IDs for this volunteer
      const rejectedIds = new Set(
        responses
          .filter((sos) =>
            (sos.rejectedByVolunteerIds || []).some(
              (volunteerId) => String(volunteerId) === String(id),
            ),
          )
          .map((sos) => String(sos._id)),
      );

      // Assigned SOS records
      const assignedSOS = allSOS.filter(
        (sos) => String(sos.volunteerId) === String(id),
      );

      // Rejected SOS records
      const rejectedSOS = allSOS.filter((sos) =>
        (sos.rejectedByVolunteerIds || []).some(
          (volunteerId) => String(volunteerId) === String(id),
        ),
      );

      setResolvedCount(
        assignedSOS.filter((sos) => sos.status === "Resolved").length,
      );

      setRejectedCount(rejectedIds.size);

      // Combine assigned and rejected SOS without duplicates
      const combinedSOS = [
        ...new Map(
          [...assignedSOS, ...rejectedSOS].map((sos) => [String(sos._id), sos]),
        ).values(),
      ];

      combinedSOS.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      );

      setSosHistory(
        combinedSOS.map((sos) => ({
          ...sos,
          rejectedByThisVolunteer: rejectedIds.has(String(sos._id)),
        })),
      );

      // Trust Score
      setTrustData(trustRes.data);
    } catch (err) {
      console.error("Error fetching Volunteer Report:", err);
      setError("Unable to load the report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // View SOS Details
  const handleViewSOS = async (sosId) => {
    try {
      setLoadingDetails(true);

      const response = await axios.get(`${API}/api/sos/details/${sosId}`);

      setSelectedSOS(response.data.sos || response.data);
    } catch (err) {
      console.error("Error fetching SOS details:", err);
      alert("Unable to load SOS details.");
    } finally {
      setLoadingDetails(false);
    }
  };

  // PDF Download
  const handleDownloadPDF = () => {
    if (!volunteer) return;

    const escapeHTML = (value) =>
      String(value ?? "—").replace(
        /[&<>"']/g,
        (char) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[char],
      );

    const averageResponseTime = trustData?.performance?.averageResponseTime;

    const sosRows = sosHistory
      .map(
        (sos) => `
      <tr>
        <td>${escapeHTML(String(sos._id).slice(-8).toUpperCase())}</td>
        <td>${escapeHTML(sos.womanName || "—")}</td>
        <td>${escapeHTML(formatDate(sos.createdAt))}</td>
        <td>${escapeHTML(
          sos.rejectedByThisVolunteer
            ? "Rejected by You"
            : getResponseTime(sos),
        )}</td>
        <td>${escapeHTML(
          sos.rejectedByThisVolunteer ? "Rejected by You" : sos.status,
        )}</td>
      </tr>
    `,
      )
      .join("");

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("Please allow pop-ups to download the PDF.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Volunteer Report - ${escapeHTML(volunteer.name)}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 30px;
            color: #222;
          }
          h1, h2 { color: #172554; }
          h2 { margin-top: 28px; }
          .summary {
            display: flex;
            gap: 15px;
            margin: 20px 0;
          }
          .summary div {
            border: 1px solid #ddd;
            padding: 15px;
            flex: 1;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 9px;
            text-align: left;
            word-break: break-word;
          }
          th {
            background: #172554;
            color: white;
          }
          @media print {
            body { padding: 10px; }
          }
        </style>
      </head>
      <body>
        <h1>SafeHer - Volunteer Report</h1>

        <h2>Basic Profile</h2>
        <p><strong>Name:</strong> ${escapeHTML(volunteer.name)}</p>
        <p><strong>Registration Date:</strong> ${escapeHTML(formatDate(getVolunteerRegistrationDate(volunteer)))}</p>
        <p><strong>Status:</strong> ${escapeHTML(volunteer.status)}</p>

        <h2>Activity Summary</h2>
        <div class="summary">
          <div><strong>Resolved SOS</strong><br/>${resolvedCount}</div>
          <div><strong>Rejected SOS</strong><br/>${rejectedCount}</div>
          <div><strong>Average Response Time</strong><br/>${averageResponseTime == null ? "—" : `${averageResponseTime} min`}</div>
          <div><strong>Trust Score</strong><br/>${trustData?.trustScore ?? "—"}/100</div>
        </div>

        <h2>SOS History</h2>
        <table>
          <thead>
            <tr>
              <th>SOS ID</th>
              <th>Woman User</th>
              <th>Date</th>
              <th>Response Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${sosRows || '<tr><td colspan="5">No SOS history found.</td></tr>'}
          </tbody>
        </table>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className="content-wrapper">
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3">Loading Volunteer Report...</p>
        </div>
      </div>
    );
  }

  if (error || !volunteer) {
    return (
      <div className="content-wrapper">
        <div className="alert alert-danger">
          {error || "Volunteer not found."}
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate("/userreports")}
        >
          Back to User Reports
        </button>
      </div>
    );
  }

  const averageResponseTime = trustData?.performance?.averageResponseTime;

  return (
    <div className="content-wrapper">
      {/* Page Header */}
      <div className="row mb-3">
        <div className="col-md-7">
          <h3 className="font-weight-bold">Volunteer Report</h3>
          <p className="text-muted">
            Detailed volunteer profile and activity report
          </p>
        </div>

        <div className="col-md-5 text-md-right">
          <button
            className="btn btn-light mr-2"
            onClick={() => navigate("/userreports")}
          >
            <i className="mdi mdi-arrow-left mr-1" />
            Back
          </button>

          <button className="btn btn-primary" onClick={handleDownloadPDF}>
            <i className="mdi mdi-download mr-1" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Basic Profile */}
      <div className="row">
        <div className="col-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Basic Profile</h4>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <p className="text-muted mb-1">Name</p>
                  <h5>{volunteer.name || "—"}</h5>
                </div>

                <div className="col-md-4 mb-3">
                  <p className="text-muted mb-1">Registration Date</p>
                  <h5>{formatDate(getVolunteerRegistrationDate(volunteer))}</h5>
                </div>

                <div className="col-md-4 mb-3">
                  <p className="text-muted mb-1">Status</p>
                  <span
                    className={`volunteer-profile-status ${
                      ["active", "approved", "verified"].includes(
                        String(volunteer.status).toLowerCase(),
                      )
                        ? "volunteer-profile-status-active"
                        : String(volunteer.status).toLowerCase() === "pending"
                          ? "volunteer-profile-status-pending"
                          : ["rejected", "inactive"].includes(
                                String(volunteer.status).toLowerCase(),
                              )
                            ? "volunteer-profile-status-inactive"
                            : "volunteer-profile-status-other"
                    }`}
                  >
                    {volunteer.status || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="row">
        <div className="col-md-3 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <p className="text-muted mb-2">Resolved SOS</p>
              <h2 className="font-weight-bold">{resolvedCount}</h2>
              <i className="mdi mdi-check-circle-outline text-success icon-lg" />
            </div>
          </div>
        </div>

        <div className="col-md-3 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <p className="text-muted mb-2">Rejected SOS</p>
              <h2 className="font-weight-bold">{rejectedCount}</h2>
              <i className="mdi mdi-close-circle-outline text-danger icon-lg" />
            </div>
          </div>
        </div>

        <div className="col-md-3 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <p className="text-muted mb-2">Average Response Time</p>
              <h2 className="font-weight-bold">
                {averageResponseTime == null
                  ? "—"
                  : `${averageResponseTime} min`}
              </h2>
              <i className="mdi mdi-clock-outline text-primary icon-lg" />
            </div>
          </div>
        </div>

        <div className="col-md-3 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <p className="text-muted mb-2">Trust Score</p>
              <h2 className="font-weight-bold">
                {trustData?.trustScore ?? "—"}
                <small className="text-muted"> / 100</small>
              </h2>
              <span className="text-muted">{trustData?.trustLevel || "—"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SOS History */}
      <div className="row">
        <div className="col-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">SOS History</h4>

              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>SOS ID</th>
                      <th>Woman User</th>
                      <th>Date</th>
                      <th>Response Time</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {sosHistory.length > 0 ? (
                      sosHistory.map((sos) => {
                        const isRejected = sos.rejectedByThisVolunteer;

                        return (
                          <tr key={sos._id}>
                            <td>{String(sos._id).slice(-8).toUpperCase()}</td>

                            <td>{sos.womanName || "—"}</td>

                            <td>{formatDate(sos.createdAt)}</td>

                            <td>{isRejected ? "—" : getResponseTime(sos)}</td>

                            <td>
                              <span
                                className={`badge ${
                                  isRejected
                                    ? "badge-danger"
                                    : sos.status === "Resolved"
                                      ? "badge-success"
                                      : sos.status === "Cancelled"
                                        ? "badge-secondary"
                                        : sos.status === "Pending"
                                          ? "badge-warning"
                                          : "badge-info"
                                }`}
                              >
                                {isRejected ? "Rejected by You" : sos.status}
                              </span>
                            </td>

                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleViewSOS(sos._id)}
                              >
                                <i className="mdi mdi-eye mr-1" />
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No SOS history found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SOS Details Modal */}
      {selectedSOS && (
        <>
          <div
            className="modal fade show d-block sos-detail-overlay volunteer-sos-detail-overlay"
            tabIndex="-1"
            role="presentation"
            onClick={(event) => {
              if (event.target === event.currentTarget) setSelectedSOS(null);
            }}
          >
            <div
              className="modal-dialog modal-dialog-centered modal-lg"
              role="dialog"
              aria-modal="true"
              aria-labelledby="volunteer-sos-detail-title"
            >
              <div               className="modal-content sos-detail-modal volunteer-sos-detail-modal">
                <div className="modal-header sos-detail-header">
                  <div className="sos-detail-heading">
                    <span className="sos-detail-icon" aria-hidden="true">
                      <i className="mdi mdi-alert-circle-outline"></i>
                    </span>
                    <div>
                      <h5
                        className="modal-title"
                        id="volunteer-sos-detail-title"
                      >
                        SOS Details
                      </h5>
                      <span className="sos-detail-id">
                        ID: {selectedSOS._id || "—"}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="sos-detail-close"
                    aria-label="Close SOS details"
                    onClick={() => setSelectedSOS(null)}
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>

                <div className="modal-body sos-detail-body">
                  {loadingDetails ? (
                    <div className="sos-detail-loading">
                      <span className="spinner-border spinner-border-sm mr-2" />
                      Loading details...
                    </div>
                  ) : (
                    <>
                      <section className="sos-detail-summary">
                        <div>
                          <span className="sos-detail-label">
                            Emergency type
                          </span>
                          <h6 className="sos-detail-emergency">
                            {selectedSOS.emergencyType || "Emergency Assistance"}
                          </h6>
                          <span className="sos-detail-date">
                            <i className="mdi mdi-calendar-clock mr-1"></i>
                            {formatDate(selectedSOS.createdAt)}
                          </span>
                        </div>
                        <div className="sos-detail-badges">
                          <span className="sos-detail-status">
                            {selectedSOS.status || "Unknown"}
                          </span>
                          <span className="sos-detail-priority">
                            <i className="mdi mdi-alert mr-1"></i>
                            {selectedSOS.priority || "Standard"} priority
                          </span>
                        </div>
                      </section>

                      <section className="sos-detail-section">
                        <h6 className="sos-detail-section-title">
                          <i className="mdi mdi-account-outline"></i>
                          Woman User
                        </h6>
                        <div className="sos-detail-fields">
                          <div className="sos-detail-field">
                            <span className="sos-detail-label">Name</span>
                            <span className="sos-detail-value">
                              {selectedSOS.womanName || "—"}
                            </span>
                          </div>
                          <div className="sos-detail-field">
                            <span className="sos-detail-label">Email</span>
                            <span className="sos-detail-value">
                              {selectedSOS.womanEmail || "—"}
                            </span>
                          </div>
                          <div className="sos-detail-field">
                            <span className="sos-detail-label">Phone</span>
                            <span className="sos-detail-value">
                              {selectedSOS.womanPhone || "—"}
                            </span>
                          </div>
                        </div>
                      </section>

                      <section className="sos-detail-section">
                        <h6 className="sos-detail-section-title">
                          <i className="mdi mdi-account-heart-outline"></i>
                          Volunteer Response
                        </h6>
                        <div className="sos-detail-fields">
                          <div className="sos-detail-field">
                            <span className="sos-detail-label">
                              Volunteer
                            </span>
                            <span className="sos-detail-value">
                              {selectedSOS.volunteerName || "Not assigned"}
                            </span>
                          </div>
                          <div className="sos-detail-field">
                            <span className="sos-detail-label">
                              Phone
                            </span>
                            <span className="sos-detail-value">
                              {selectedSOS.volunteerPhone || "—"}
                            </span>
                          </div>
                          <div className="sos-detail-field">
                            <span className="sos-detail-label">
                              Response time
                            </span>
                            <span className="sos-detail-value">
                              {getResponseTime(selectedSOS)}
                            </span>
                          </div>
                        </div>
                      </section>

                      <section className="sos-detail-section sos-detail-location">
                        <h6 className="sos-detail-section-title">
                          <i className="mdi mdi-map-marker-outline"></i>
                          Location
                        </h6>
                        <p className="sos-detail-location-value">
                          {selectedSOS.womanAddress || "Location unavailable"}
                        </p>
                      </section>
                    </>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => setSelectedSOS(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className="modal-backdrop fade show sos-detail-backdrop"
            aria-hidden="true"
          />
        </>
      )}
    </div>
  );
}

export default VolunteerReport;
