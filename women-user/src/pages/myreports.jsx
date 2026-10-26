import React from "react";
import swal from "sweetalert2";
import "../safeher-css/myreports.css";
import axios from "axios";

function MyReports() {
  const [reports, setReports] = React.useState([]);

  React.useEffect(() => {
    const mydata = JSON.parse(localStorage.getItem("mydata"));

    if (!mydata || !mydata.user_id) {
      return;
    }

    axios
      .get(`http://localhost:3000/api/getmyincidentreports/${mydata.user_id}`)
      .then((response) => {
        setReports(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const viewReport = (report) => {
    swal.fire({
      title: "Incident Report Details",
      width: "700px",
      html: `
      <div style="text-align:left;">

        <div style="
          background:#f8f9fc;
          padding:15px;
          border-radius:12px;
          margin-bottom:20px;
          text-align:center;
        ">
          <img
            src="http://localhost:3000/incidentReports/${report.photo}"
            alt="Incident Evidence"
            style="
              width:100%;
              max-height:300px;
              object-fit:contain;
              border-radius:10px;
            "
          />
        </div>

        <div style="
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:15px;
          margin-bottom:18px;
        ">

          <div style="
            background:#f8f9fc;
            padding:12px;
            border-radius:8px;
          ">
            <small>Incident Type</small>
            <div style="font-weight:600;">
              ${report.incidentType}
            </div>
          </div>

          <div style="
            background:#f8f9fc;
            padding:12px;
            border-radius:8px;
          ">
            <small>Status</small>
            <div style="font-weight:600;">
              ${report.status}
            </div>
          </div>

          <div style="
            background:#f8f9fc;
            padding:12px;
            border-radius:8px;
          ">
            <small>Incident Date</small>
            <div style="font-weight:600;">
              ${report.incidentDate}
            </div>
          </div>

          <div style="
            background:#f8f9fc;
            padding:12px;
            border-radius:8px;
          ">
            <small>Incident Time</small>
            <div style="font-weight:600;">
              ${report.incidentTime}
            </div>
          </div>

        </div>

        <div style="
          background:#f8f9fc;
          padding:15px;
          border-radius:8px;
          margin-bottom:15px;
        ">
          <small>Location</small>
          <div style="font-weight:600;">
            ${report.location}
          </div>
        </div>

        <div style="
          background:#f8f9fc;
          padding:15px;
          border-radius:8px;
        ">
          <small>Incident Description</small>
          <p style="
            margin:8px 0 0;
            line-height:1.6;
          ">
            ${report.description}
          </p>
        </div>

        ${
          report.status === "Rejected"
            ? `
          <div style="
            background:#fff5f5;
            border:1px solid #f5c2c7;
            padding:15px;
            border-radius:8px;">
            <small style="color:#dc3545;">Rejection Reason</small>
            <p style="
              margin:8px 0 0;
              line-height:1.6;
              color:#842029;">
              ${report.adminRemarks || "No reason provided."}
              </p>
              </div>
              `
            : ""
        }
      </div>
    `,
      confirmButtonText: "Close",
      confirmButtonColor: "#2f80ed",
    });
  };

  const downloadReport = (report) => {
    window.open(
      `http://localhost:3000/api/getreportspdf/${report._id}`,
      "_blank",
    );
  };

  return (
    <div className="mr-body">
      {/* PAGE HEADING */}
      <div className="mr-page-head">
        <div>
          <span className="mr-tag">🛡 Community Safety</span>

          <h1>My Reports</h1>

          <p>View and track the safety incidents you have reported.</p>
        </div>

        <div className="mr-total">
          <span>MY REPORTS</span>
          <strong>{reports.length}</strong>
        </div>
      </div>

      {/* REPORTS */}
      <div className="mr-reports">
        {reports.length === 0 ? (
          <div className="mr-report-card">
            <h2>No Reports Found</h2>
            <p>You have not submitted any incident reports yet.</p>
          </div>
        ) : (
          reports.map((report) => (
            <div className="mr-report-card" key={report._id}>
              <div className="mr-report-top">
                <div className="mr-report-title">
                  <div className="mr-report-icon mr-icon-pink">!</div>

                  <div>
                    <span className="mr-report-label">INCIDENT REPORT</span>
                    <h2>{report.incidentType}</h2>
                  </div>
                </div>

                <span
                  className={`mr-status ${
                    report.status === "Verified"
                      ? "mr-status-verified"
                      : report.status === "Rejected"
                        ? "mr-status-rejected"
                        : "mr-status-review"
                  }`}
                >
                  {report.status}
                </span>
              </div>

              <div className="mr-details">
                <div className="mr-detail">
                  <span>Incident Date</span>
                  <strong>{report.incidentDate}</strong>
                </div>

                <div className="mr-detail">
                  <span>Incident Time</span>
                  <strong>{report.incidentTime}</strong>
                </div>

                <div className="mr-detail">
                  <span>Location</span>
                  <strong>{report.location}</strong>
                </div>
              </div>

              <div className="mr-description">
                <span>Incident Description</span>

                <p>
                  {report.description.length > 120
                    ? report.description.substring(0, 120) + "..."
                    : report.description}
                </p>
              </div>

              <div className="mr-report-bottom">
                <div className="mr-evidence">
                  <span className="mr-photo-icon">📷</span>

                  <div>
                    <strong>Evidence Photo</strong>
                    <small>1 photo attached</small>
                  </div>
                </div>

                <div className="mr-actions">
                  <button
                    className="mr-view-btn"
                    type="button"
                    onClick={() => viewReport(report)}
                  >
                    View Details
                  </button>

                  <button
                    className="mr-pdf-btn"
                    type="button"
                    onClick={() => downloadReport(report)}
                  >
                    <i className="fa-solid fa-download"></i>
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* INFORMATION NOTE */}
      <div className="mr-footnote">
        <div className="mr-footnote-icon">🛡</div>

        <div>
          <strong>About your reports</strong>

          <p>
            Your submitted reports are reviewed by the SafeHer safety team.
            Report status may change as the incident is reviewed, verified, or
            resolved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default MyReports;
