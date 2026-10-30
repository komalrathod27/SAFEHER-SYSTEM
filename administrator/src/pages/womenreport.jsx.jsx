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

function formatDateTime(date) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSOSStatus(sos) {
  if (sos.status === "Resolved" && !sos.volunteerId) {
    return "Self-resolved";
  }

  return sos.status || "—";
}

function WomenReport() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [woman, setWoman] = useState(null);
  const [sosList, setSosList] = useState([]);
  const [incidentCount, setIncidentCount] = useState(0);
  const [selectedSOS, setSelectedSOS] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWomanReport();
  }, [id]);

  const fetchWomanReport = async () => {
    try {
      setLoading(true);
      setError("");

      const [womanRes, sosRes, incidentRes] = await Promise.all([
        axios.get(`${API}/api/getwomanusers`),
        axios.get(`${API}/api/sos/all`),
        axios.get(`${API}/api/getadminincidentreports`),
      ]);

      const women = getList(womanRes.data, ["users", "women", "data"]);

      const selectedWoman = women.find(
        (user) => String(user._id) === String(id),
      );

      if (!selectedWoman) {
        setError("Woman User not found.");
        return;
      }

      setWoman(selectedWoman);

      const allSOS = getList(sosRes.data, ["requests", "data"]);

      const womanSOS = allSOS.filter(
        (sos) => String(sos.womanId) === String(id),
      );

      setSosList(womanSOS);

      const allIncidents = getList(incidentRes.data, ["reports", "data"]);

      const womanIncidents = allIncidents.filter(
        (report) => String(report.womanId) === String(id),
      );

      setIncidentCount(womanIncidents.length);
    } catch (err) {
      console.error("Error fetching Woman User Report:", err);
      setError("Unable to load the report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

  const handleDownloadPDF = () => {
    if (!woman) return;

    const resolvedCount = sosList.filter(
      (sos) => sos.status === "Resolved",
    ).length;

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

    const sosRows = sosList
      .map(
        (sos) => `
      <tr>
        <td>${escapeHTML(sos._id)}</td>
        <td>${escapeHTML(formatDateTime(sos.createdAt))}</td>
        <td>${escapeHTML(formatDateTime(sos.resolvedAt))}</td>
        <td>${escapeHTML(sos.volunteerName || "Not Assigned")}</td>
        <td>${escapeHTML(getSOSStatus(sos))}</td>
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
        <title>Woman User Report - ${escapeHTML(woman.fullName)}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 30px;
            color: #222;
          }
          h1 { color: #172554; }
          h2 {
            color: #172554;
            margin-top: 28px;
          }
          .summary {
            display: flex;
            gap: 25px;
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
            padding: 10px;
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
        <h1>SafeHer - Woman User Report</h1>

        <h2>Basic Profile</h2>
        <p><strong>Name:</strong> ${escapeHTML(woman.fullName)}</p>
        <p><strong>Registration Date:</strong> ${escapeHTML(formatDate(woman.createdAt))}</p>
        <p><strong>Status:</strong> ${escapeHTML(woman.status)}</p>

        <h2>Activity Summary</h2>
        <div class="summary">
          <div><strong>Total SOS</strong><br/>${sosList.length}</div>
          <div><strong>Total Incident Reports</strong><br/>${incidentCount}</div>
          <div><strong>Resolved SOS</strong><br/>${resolvedCount}</div>
        </div>

        <h2>SOS History</h2>
        <table>
          <thead>
            <tr>
              <th>SOS ID</th>
              <th>Triggered At</th>
              <th>Resolved At</th>
              <th>Volunteer</th>
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
          <p className="mt-3">Loading Woman User Report...</p>
        </div>
      </div>
    );
  }

  if (error || !woman) {
    return (
      <div className="content-wrapper">
        <div className="alert alert-danger">
          {error || "Woman User not found."}
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

  const resolvedCount = sosList.filter(
    (sos) => sos.status === "Resolved",
  ).length;

  return (
    <div className="content-wrapper">
      {/* Page Header */}
      <div className="row mb-3">
        <div className="col-md-7">
          <h3 className="font-weight-bold">Woman User Report</h3>
          <p className="text-muted">Detailed profile and activity report</p>
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
                  <h5>{woman.fullName || "—"}</h5>
                </div>

                <div className="col-md-4 mb-3">
                  <p className="text-muted mb-1">Registration Date</p>
                  <h5>{formatDate(woman.createdAt)}</h5>
                </div>

                <div className="col-md-4 mb-3">
                  <p className="text-muted mb-1">Status</p>
                  <span
                    className={`badge ${
                      woman.status === "Active"
                        ? "badge-success"
                        : "badge-secondary"
                    }`}
                  >
                    {woman.status || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="row">
        <div className="col-md-4 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <p className="text-muted mb-2">Total SOS</p>
              <h2 className="font-weight-bold">{sosList.length}</h2>
              <i className="mdi mdi-alarm-light text-danger icon-lg" />
            </div>
          </div>
        </div>

        <div className="col-md-4 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <p className="text-muted mb-2">Total Incident Reports</p>
              <h2 className="font-weight-bold">{incidentCount}</h2>
              <i className="mdi mdi-file-document-outline text-primary icon-lg" />
            </div>
          </div>
        </div>

        <div className="col-md-4 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <p className="text-muted mb-2">Resolved SOS</p>
              <h2 className="font-weight-bold">{resolvedCount}</h2>
              <i className="mdi mdi-check-circle-outline text-success icon-lg" />
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
                      <th>Triggered At</th>
                      <th>Resolved At</th>
                      <th>Volunteer</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {sosList.length > 0 ? (
                      sosList.map((sos) => (
                        <tr key={sos._id}>
                          <td>{String(sos._id).slice(-8).toUpperCase()}</td>

                          <td>{formatDateTime(sos.createdAt)}</td>

                          <td>{formatDateTime(sos.resolvedAt)}</td>

                          <td>{sos.volunteerName || "Not Assigned"}</td>

                          <td>
                            <span
                              className={`badge ${
                                getSOSStatus(sos) === "Resolved" ||
                                getSOSStatus(sos) === "Self-resolved"
                                  ? "badge-success"
                                  : sos.status === "Cancelled"
                                    ? "badge-secondary"
                                    : sos.status === "Pending"
                                      ? "badge-warning"
                                      : "badge-info"
                              }`}
                            >
                              {getSOSStatus(sos)}
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
                      ))
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
            className="modal fade show d-block sos-detail-overlay"
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
              aria-labelledby="sos-detail-title"
            >
              <div className="modal-content sos-detail-modal">
                <div className="modal-header sos-detail-header">
                  <div className="sos-detail-heading">
                    <span className="sos-detail-icon" aria-hidden="true">
                      <i className="mdi mdi-alert-circle-outline"></i>
                    </span>
                    <div>
                      <h5 className="modal-title" id="sos-detail-title">
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
                          <i className="mdi mdi-account-heart-outline"></i>
                          Volunteer
                        </h6>
                        <div className="sos-detail-fields">
                          <div className="sos-detail-field">
                            <span className="sos-detail-label">Name</span>
                            <span className="sos-detail-value">
                              {selectedSOS.volunteerName || "Not assigned"}
                            </span>
                          </div>
                          <div className="sos-detail-field">
                            <span className="sos-detail-label">Email</span>
                            <span className="sos-detail-value">
                              {selectedSOS.volunteerEmail || "—"}
                            </span>
                          </div>
                          <div className="sos-detail-field">
                            <span className="sos-detail-label">Phone</span>
                            <span className="sos-detail-value">
                              {selectedSOS.volunteerPhone || "—"}
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

export default WomenReport;
