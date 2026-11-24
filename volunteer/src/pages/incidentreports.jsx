import React, { useEffect, useState } from "react";
import axios from "axios";
import "../volunteer-css/incidentreport.css";

function IncidentReports() {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // FETCH VERIFIED INCIDENT REPORTS
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/getverifiedincidentreports",
      );

      setReports(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // SEARCH REPORTS
  const filteredReports = reports.filter((report) => {
    const search = searchTerm.toLowerCase();

    return (
      report.incidentType.toLowerCase().includes(search) ||
      report.location.toLowerCase().includes(search) ||
      report.description.toLowerCase().includes(search)
    );
  });

  return (
    <div className="incident-page">
      {/* HEADER */}
      <div className="incident-header">
        <h1 className="incident-title">Incident Reports</h1>

        <p className="incident-subtitle">
          View community incidents verified by SafeHer administration.
        </p>
      </div>

      {/* SEARCH */}
      <div className="incident-filter-bar">
        <input
          type="text"
          placeholder="🔎 Search incidents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="incident-search"
        />
      </div>

      {/* INCIDENT CARDS */}
      <div className="incident-report-grid">
        {loading ? (
          <div className="incident-empty">
            <div className="incident-loading-text">
              Loading incident reports...
            </div>
          </div>
        ) : filteredReports.length > 0 ? (
          filteredReports.map((report, index) => (
            <div key={report._id} className="incident-report-card">
              {/* CARD TOP */}
              <div className="incident-card-top">
                <div className="incident-type-area">
                  <div className="incident-icon">🚨</div>

                  <div>
                    <h3 className="incident-type">{report.incidentType}</h3>

                    <div className="incident-id">Report #{index + 1}</div>
                  </div>
                </div>

                <span className="incident-verified-badge">Verified</span>
              </div>

              {/* CARD BODY */}
              <div className="incident-card-body">
                <div className="incident-info-row">
                  <span>📍</span>
                  <span>{report.location}</span>
                </div>

                <div className="incident-info-row">
                  <span>📅</span>
                  <span>{report.incidentDate}</span>

                  <span className="incident-time-icon">🕐</span>

                  <span>{report.incidentTime}</span>
                </div>

                <div className="incident-description">
                  {report.description.length > 120
                    ? report.description.substring(0, 120) + "..."
                    : report.description}
                </div>
              </div>

              {/* CARD FOOTER */}
              <div className="incident-card-footer">
                <span className="incident-approved">✓ Verified by Admin</span>

                <button
                  className="incident-view-button"
                  onClick={() => setSelectedReport(report)}
                >
                  View Report
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="incident-empty">
            <div className="incident-empty-icon">📄</div>

            <div className="incident-empty-heading">No incidents found</div>

            <div className="incident-empty-message">
              Try changing your search.
            </div>
          </div>
        )}
      </div>

      {/* REPORT PREVIEW */}
      {selectedReport && (
        <div
          className="incident-overlay"
          onClick={() => setSelectedReport(null)}
        >
          <div className="incident-modal" onClick={(e) => e.stopPropagation()}>
            {/* HEADER */}
            <div className="incident-report-header">
              <div className="incident-logo-area">
                <div className="incident-logo-box">S</div>

                <div>
                  <h2 className="incident-logo-title">SafeHer</h2>

                  <p className="incident-logo-subtitle">
                    Because Every Woman Deserves to Feel Safe.
                  </p>
                </div>
              </div>

              <button
                className="incident-close-button"
                onClick={() => setSelectedReport(null)}
              >
                ×
              </button>
            </div>

            {/* TITLE */}
            <div className="incident-report-title-area">
              <h2 className="incident-report-title">INCIDENT REPORT</h2>

              <div className="incident-report-number">
                Report ID: {selectedReport._id}
              </div>
            </div>

            {/* BODY */}
            <div className="incident-report-body">
              {/* INFORMATION */}
              <div className="incident-section-title">Incident Information</div>

              <div className="incident-info-grid">
                <div className="incident-info-item">
                  <span className="incident-info-label">Incident Type</span>

                  <span className="incident-info-value">
                    {selectedReport.incidentType}
                  </span>
                </div>

                <div className="incident-info-item">
                  <span className="incident-info-label">Status</span>

                  <span className="incident-info-value incident-status-value">
                    ✓ {selectedReport.status}
                  </span>
                </div>

                <div className="incident-info-item">
                  <span className="incident-info-label">Date</span>

                  <span className="incident-info-value">
                    {selectedReport.incidentDate}
                  </span>
                </div>

                <div className="incident-info-item">
                  <span className="incident-info-label">Time</span>

                  <span className="incident-info-value">
                    {selectedReport.incidentTime}
                  </span>
                </div>

                <div className="incident-info-item">
                  <span className="incident-info-label">Location</span>

                  <span className="incident-info-value">
                    {selectedReport.location}
                  </span>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="incident-section-title">Incident Description</div>

              <div className="incident-report-description">
                {selectedReport.description}
              </div>

              {/* EVIDENCE */}
              <div className="incident-section-title">Evidence</div>

              <div className="incident-evidence-box">
                {selectedReport.photo ? (
                  <img
                    src={`http://localhost:3000/incidentReports/${selectedReport.photo}`}
                    alt="Incident Evidence"
                    className="incident-evidence-image"
                  />
                ) : (
                  <div className="incident-no-evidence">
                    No evidence attached
                  </div>
                )}
              </div>

              {/* MODERATION */}
              <div className="incident-section-title">
                Moderation Information
              </div>

              <div className="incident-moderation-box">
                <div className="incident-moderation-title">
                  ✓ Verified Report
                </div>

                <div className="incident-moderation-text">
                  This report has been reviewed and verified by SafeHer
                  administration.
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="incident-report-footer">
              <button
                className="incident-close-footer-button"
                onClick={() => setSelectedReport(null)}
              >
                Close
              </button>

              <button
                className="incident-pdf-button"
                onClick={() =>
                  window.open(
                    `http://localhost:3000/api/getreportspdf/${selectedReport._id}`,
                    "_blank",
                  )
                }
              >
                📄 Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IncidentReports;
