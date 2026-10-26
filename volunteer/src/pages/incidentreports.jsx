import React, { useEffect, useState } from "react";
import axios from "axios";

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

  // STYLES
  const styles = {
    page: {
      padding: "30px",
      background: "#f8f9fc",
      minHeight: "100vh",
      fontFamily: "Arial, sans-serif",
    },

    header: {
      marginBottom: "25px",
    },

    title: {
      margin: 0,
      fontSize: "28px",
      fontWeight: "700",
      color: "#1f2937",
    },

    subtitle: {
      marginTop: "7px",
      marginBottom: 0,
      color: "#6b7280",
      fontSize: "14px",
    },

    filterBar: {
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "10px",
      padding: "16px",
      marginBottom: "25px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    },

    search: {
      flex: 1,
      padding: "11px 14px",
      border: "1px solid #d1d5db",
      borderRadius: "6px",
      outline: "none",
      fontSize: "13px",
      minWidth: "200px",
    },

    reportGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
      gap: "20px",
    },

    reportCard: {
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "10px",
      overflow: "hidden",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    },

    cardTop: {
      padding: "18px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "1px solid #f1f2f4",
    },

    incidentTypeArea: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },

    incidentIcon: {
      width: "42px",
      height: "42px",
      borderRadius: "9px",
      background: "#f3f4f6",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "19px",
    },

    incidentType: {
      margin: 0,
      fontSize: "15px",
      fontWeight: "700",
      color: "#1f2937",
    },

    incidentId: {
      marginTop: "4px",
      fontSize: "10px",
      color: "#9ca3af",
    },

    verifiedBadge: {
      padding: "5px 10px",
      borderRadius: "20px",
      fontSize: "10px",
      fontWeight: "700",
      background: "#dcfce7",
      color: "#15803d",
      border: "1px solid #bbf7d0",
    },

    cardBody: {
      padding: "18px 20px",
    },

    infoRow: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "10px",
      fontSize: "12px",
      color: "#6b7280",
    },

    description: {
      marginTop: "15px",
      paddingTop: "15px",
      borderTop: "1px solid #f1f2f4",
      fontSize: "12px",
      lineHeight: "1.6",
      color: "#6b7280",
    },

    cardFooter: {
      padding: "13px 20px",
      background: "#fafafa",
      borderTop: "1px solid #f1f2f4",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },

    approved: {
      fontSize: "10px",
      fontWeight: "600",
      color: "#15803d",
    },

    viewButton: {
      border: "none",
      background: "#4f46e5",
      color: "#ffffff",
      padding: "8px 14px",
      borderRadius: "6px",
      fontSize: "11px",
      fontWeight: "600",
      cursor: "pointer",
    },

    empty: {
      gridColumn: "1 / -1",
      textAlign: "center",
      padding: "60px 20px",
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "10px",
      color: "#9ca3af",
    },

    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(17, 24, 39, 0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "25px",
    },

    modal: {
      width: "100%",
      maxWidth: "900px",
      maxHeight: "88vh",
      overflowY: "auto",
      background: "#ffffff",
      borderRadius: "10px",
      boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    },

    reportHeader: {
      padding: "18px 28px",
      borderBottom: "1px solid #e5e7eb",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },

    logoArea: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },

    logoBox: {
      width: "44px",
      height: "44px",
      borderRadius: "8px",
      background: "#eef2ff",
      color: "#4f46e5",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "20px",
      fontWeight: "700",
    },

    logoTitle: {
      margin: 0,
      fontSize: "20px",
      fontWeight: "700",
      color: "#1f2937",
    },

    logoSubtitle: {
      margin: "2px 0 0",
      fontSize: "11px",
      color: "#696e75",
    },

    closeButton: {
      border: "none",
      background: "#f3f4f6",
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      cursor: "pointer",
      color: "#5e626c",
      fontSize: "17px",
    },

    reportTitleArea: {
      textAlign: "center",
      padding: "18px 28px 10px",
    },

    reportTitle: {
      margin: 0,
      fontSize: "24px",
      fontWeight: "700",
      color: "#1f2937",
      letterSpacing: "0.8px",
    },

    reportNumber: {
      marginTop: "5px",
      fontSize: "13px",
      color: "#6b7280",
    },

    reportBody: {
      padding: "5px 28px 20px",
    },

    sectionTitle: {
      fontSize: "13px",
      fontWeight: "700",
      color: "#4f46e5",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginBottom: "8px",
      paddingBottom: "6px",
      borderBottom: "1px solid #e5e7eb",
    },

    infoGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      marginBottom: "16px",
    },

    infoItem: {
      padding: "9px 14px",
      borderBottom: "1px solid #f1f2f4",
    },

    infoLabel: {
      display: "block",
      fontSize: "11px",
      color: "#6b7280",
      marginBottom: "3px",
      textTransform: "uppercase",
    },

    infoValue: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#374151",
    },

    reportDescription: {
      background: "#f9fafb",
      border: "1px solid #e5e7eb",
      borderRadius: "6px",
      padding: "12px 14px",
      fontSize: "14px",
      lineHeight: "1.6",
      color: "#4b5563",
      marginBottom: "16px",
    },

    evidenceBox: {
      background: "#f9fafb",
      border: "1px solid #e5e7eb",
      borderRadius: "6px",
      padding: "10px",
      textAlign: "center",
      marginBottom: "16px",
    },

    evidenceImage: {
      maxWidth: "100%",
      maxHeight: "220px",
      objectFit: "contain",
      borderRadius: "6px",
    },

    moderationBox: {
      background: "#f0fdf4",
      border: "1px solid #bbf7d0",
      borderRadius: "6px",
      padding: "11px 14px",
    },

    moderationTitle: {
      fontSize: "13px",
      fontWeight: "700",
      color: "#15803d",
      marginBottom: "4px",
    },

    moderationText: {
      fontSize: "13px",
      color: "#166534",
      lineHeight: "1.5",
    },

    reportFooter: {
      padding: "13px 28px",
      background: "#f9fafb",
      borderTop: "1px solid #e5e7eb",
      display: "flex",
      justifyContent: "flex-end",
      gap: "10px",
    },

    closeFooterButton: {
      border: "1px solid #d1d5db",
      background: "#ffffff",
      color: "#374151",
      padding: "9px 18px",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "11px",
      fontWeight: "600",
    },

    pdfButton: {
      border: "none",
      background: "#4f46e5",
      color: "#ffffff",
      padding: "9px 18px",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "11px",
      fontWeight: "600",
    },
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>Incident Reports</h1>

        <p style={styles.subtitle}>
          View community incidents verified by SafeHer administration.
        </p>
      </div>

      {/* SEARCH */}
      <div style={styles.filterBar}>
        <input
          type="text"
          placeholder="🔎 Search incidents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.search}
        />
      </div>

      {/* INCIDENT CARDS */}
      <div style={styles.reportGrid}>
        {loading ? (
          <div style={styles.empty}>
            <div style={{ fontWeight: "600", marginBottom: "5px" }}>
              Loading incident reports...
            </div>
          </div>
        ) : filteredReports.length > 0 ? (
          filteredReports.map((report, index) => (
            <div key={report._id} style={styles.reportCard}>
              {/* CARD TOP */}
              <div style={styles.cardTop}>
                <div style={styles.incidentTypeArea}>
                  <div style={styles.incidentIcon}>🚨</div>

                  <div>
                    <h3 style={styles.incidentType}>{report.incidentType}</h3>

                    <div style={styles.incidentId}>Report #{index + 1}</div>
                  </div>
                </div>

                <span style={styles.verifiedBadge}>Verified</span>
              </div>

              {/* CARD BODY */}
              <div style={styles.cardBody}>
                <div style={styles.infoRow}>
                  <span>📍</span>
                  <span>{report.location}</span>
                </div>

                <div style={styles.infoRow}>
                  <span>📅</span>
                  <span>{report.incidentDate}</span>

                  <span style={{ marginLeft: "8px" }}>🕐</span>

                  <span>{report.incidentTime}</span>
                </div>

                <div style={styles.description}>
                  {report.description.length > 120
                    ? report.description.substring(0, 120) + "..."
                    : report.description}
                </div>
              </div>

              {/* CARD FOOTER */}
              <div style={styles.cardFooter}>
                <span style={styles.approved}>✓ Verified by Admin</span>

                <button
                  style={styles.viewButton}
                  onClick={() => setSelectedReport(report)}
                >
                  View Report
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={styles.empty}>
            <div style={{ fontSize: "35px", marginBottom: "10px" }}>📄</div>

            <div style={{ fontWeight: "600", marginBottom: "5px" }}>
              No incidents found
            </div>

            <div style={{ fontSize: "12px" }}>Try changing your search.</div>
          </div>
        )}
      </div>

      {/* REPORT PREVIEW */}
      {selectedReport && (
        <div style={styles.overlay} onClick={() => setSelectedReport(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            {/* HEADER */}
            <div style={styles.reportHeader}>
              <div style={styles.logoArea}>
                <div style={styles.logoBox}>S</div>

                <div>
                  <h2 style={styles.logoTitle}>SafeHer</h2>

                  <p style={styles.logoSubtitle}>
                    Because Every Woman Deserves to Feel Safe.
                  </p>
                </div>
              </div>

              <button
                style={styles.closeButton}
                onClick={() => setSelectedReport(null)}
              >
                ×
              </button>
            </div>

            {/* TITLE */}
            <div style={styles.reportTitleArea}>
              <h2 style={styles.reportTitle}>INCIDENT REPORT</h2>

              <div style={styles.reportNumber}>
                Report ID: {selectedReport._id}
              </div>
            </div>

            {/* BODY */}
            <div style={styles.reportBody}>
              {/* INFORMATION */}
              <div style={styles.sectionTitle}>Incident Information</div>

              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Incident Type</span>

                  <span style={styles.infoValue}>
                    {selectedReport.incidentType}
                  </span>
                </div>

                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Status</span>

                  <span
                    style={{
                      ...styles.infoValue,
                      color: "#15803d",
                    }}
                  >
                    ✓ {selectedReport.status}
                  </span>
                </div>

                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Date</span>

                  <span style={styles.infoValue}>
                    {selectedReport.incidentDate}
                  </span>
                </div>

                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Time</span>

                  <span style={styles.infoValue}>
                    {selectedReport.incidentTime}
                  </span>
                </div>

                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Location</span>

                  <span style={styles.infoValue}>
                    {selectedReport.location}
                  </span>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div style={styles.sectionTitle}>Incident Description</div>

              <div style={styles.reportDescription}>
                {selectedReport.description}
              </div>

              {/* EVIDENCE */}
              <div style={styles.sectionTitle}>Evidence</div>

              <div style={styles.evidenceBox}>
                {selectedReport.photo ? (
                  <img
                    src={`http://localhost:3000/incidentReports/${selectedReport.photo}`}
                    alt="Incident Evidence"
                    style={styles.evidenceImage}
                  />
                ) : (
                  <div style={{ color: "#9ca3af", fontSize: "12px" }}>
                    No evidence attached
                  </div>
                )}
              </div>

              {/* MODERATION */}
              <div style={styles.sectionTitle}>Moderation Information</div>

              <div style={styles.moderationBox}>
                <div style={styles.moderationTitle}>✓ Verified Report</div>

                <div style={styles.moderationText}>
                  This report has been reviewed and verified by SafeHer
                  administration.
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div style={styles.reportFooter}>
              <button
                style={styles.closeFooterButton}
                onClick={() => setSelectedReport(null)}
              >
                Close
              </button>

              <button
                style={styles.pdfButton}
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
