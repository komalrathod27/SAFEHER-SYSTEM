import React, { useEffect, useState } from "react";
import axios from "axios";
import { getVolunteerId } from "../utils/volunteerIdentity";

function Responses() {
  const [responses, setResponses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("All");
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const volunteerId = getVolunteerId();

        if (!volunteerId) {
          setError("Please log in again to view your responses.");
          return;
        }

        const res = await axios.get(
          `http://localhost:3000/api/sos/my-responses/${volunteerId}`,
        );

        setResponses(
          (res.data.responses || []).map((response) => ({
            ...response,
            displayStatus: response.rejectedByVolunteerIds?.includes(
              String(volunteerId),
            )
              ? "Rejected"
              : response.status,
          })),
        );
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load response history.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, []);

  const filteredResponses = responses.filter((response) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch = [
      response._id,
      response.womanName,
      response.womanAddress,
      response.emergencyType,
    ].some((value) =>
      String(value || "")
        .toLowerCase()
        .trim()
        .includes(searchTerm.toLowerCase().trim()),
    );

    const responseDate = new Date(
      response.resolvedAt || response.updatedAt || response.createdAt,
    );

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const matchesDate =
      dateFilter === "All" ||
      (dateFilter === "Recent" &&
        !isNaN(responseDate.getTime()) &&
        responseDate >= sevenDaysAgo);

    return matchesSearch && matchesDate;
  });

  const averageResponseTime = responses.length
    ? responses.reduce((total, response) => {
        if (!response.acceptedAt || !response.createdAt) return total;
        return (
          total +
          Math.max(
            0,
            new Date(response.acceptedAt) - new Date(response.createdAt),
          )
        );
      }, 0) /
      responses.filter((r) => r.acceptedAt && r.createdAt).length /
      60000
    : 0;

  const validTimes = responses.filter(
    (r) => r.acceptedAt && r.createdAt,
  ).length;

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Not available";

  const styles = {
    page: {
      padding: "30px",
      minHeight: "100vh",
      background: "#f8f9fc",
      fontFamily: "Arial, sans-serif",
    },
    title: { margin: 0, color: "#1f2937", fontSize: "28px" },
    subtitle: { color: "#6b7280", fontSize: "14px" },
    stats: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "16px",
      margin: "24px 0",
    },
    stat: {
      padding: "20px",
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: "9px",
    },
    card: {
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: "10px",
      overflow: "hidden",
    },
    toolbar: {
      display: "flex",
      flexWrap: "wrap",
      gap: "12px",
      padding: "18px",
    },
    input: {
      padding: "10px",
      border: "1px solid #d1d5db",
      borderRadius: "6px",
      fontSize: "13px",
    },
    tableWrap: { overflowX: "auto" },
    table: {
      width: "100%",
      minWidth: "750px",
      borderCollapse: "collapse",
    },
    th: {
      padding: "13px",
      textAlign: "left",
      background: "#f3f4f6",
      color: "#6b7280",
      fontSize: "11px",
    },
    td: {
      padding: "14px 13px",
      borderTop: "1px solid #eee",
      fontSize: "12px",
      color: "#374151",
    },
    button: {
      padding: "8px 12px",
      border: 0,
      borderRadius: "5px",
      background: "#eef2ff",
      color: "#4338ca",
      cursor: "pointer",
    },
    overlay: {
      position: "fixed",
      inset: 0,
      background: "#0008",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      zIndex: 1000,
    },
    modal: {
      width: "100%",
      maxWidth: "520px",
      maxHeight: "85vh",
      overflowY: "auto",
      background: "#fff",
      borderRadius: "10px",
      padding: "24px",
    },
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>My Responses</h1>
      <p style={styles.subtitle}>View your completed emergency responses.</p>

      <div style={styles.stats}>
        <div style={styles.stat}>
          <div>Total Responses</div>
          <h2>{responses.length}</h2>
        </div>
        <div style={styles.stat}>
          <div>Avg. Response Time</div>
          <h2>
            {validTimes
              ? `${(averageResponseTime || 0).toFixed(1)} min`
              : "N/A"}
          </h2>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.toolbar}>
          <input
            style={{ ...styles.input, flex: 1, minWidth: "200px" }}
            placeholder="Search ID or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            style={styles.input}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="All">All Dates</option>
            <option value="Recent">Last 7 Days</option>
          </select>
        </div>

        {loading ? (
          <p style={{ padding: "30px" }}>Loading responses...</p>
        ) : error ? (
          <p style={{ padding: "30px", color: "#dc2626" }}>{error}</p>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>SOS ID</th>
                  <th style={styles.th}>Woman User</th>
                  <th style={styles.th}>Location</th>
                  <th style={styles.th}>Response Date</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredResponses.length ? (
                  filteredResponses.map((response) => (
                    <tr key={response._id}>
                      <td style={styles.td}>
                        {response._id.slice(-8).toUpperCase()}
                      </td>
                      <td style={styles.td}>
                        {response.womanName || "Woman User"}
                      </td>
                      <td style={styles.td}>
                        {response.womanAddress || "Location unavailable"}
                      </td>
                      <td style={styles.td}>
                        {formatDate(
                          response.status === "Resolved"
                            ? response.resolvedAt
                            : response.updatedAt || response.createdAt,
                        )}
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            backgroundColor:
                              response.displayStatus === "Resolved"
                                ? "#dcfce7"
                                : "#fee2e2",
                            color:
                              response.displayStatus === "Resolved"
                                ? "#166534"
                                : "#991b1b",
                            fontSize: "12px",
                            fontWeight: 600,
                            fontFamily: "Inter, Arial, sans-serif",
                            letterSpacing: "0.3px",
                            padding: "5px 11px",
                            borderRadius: "20px",
                            display: "inline-block",
                            lineHeight: 1.4,
                          }}
                        >
                          {response.displayStatus}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <button
                          style={styles.button}
                          onClick={() => setSelectedResponse(response)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      style={{ ...styles.td, textAlign: "center" }}
                    >
                      No responses found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedResponse && (
        <div style={styles.overlay} onClick={() => setSelectedResponse(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Response Details</h2>
            <p>
              <strong>SOS ID:</strong> {selectedResponse._id}
            </p>
            <p>
              <strong>Woman User:</strong>{" "}
              {selectedResponse.womanName || "Woman User"}
            </p>
            <p>
              <strong>Emergency:</strong> {selectedResponse.emergencyType}
            </p>
            <p>
              <strong>Location:</strong> {selectedResponse.womanAddress}
            </p>
            <p>
              <strong>Requested:</strong>{" "}
              {formatDate(selectedResponse.createdAt)}
            </p>
            {selectedResponse.displayStatus === "Resolved" && (
              <>
                <p>
                  <strong>Accepted:</strong>{" "}
                  {formatDate(selectedResponse.acceptedAt)}
                </p>
                <p>
                  <strong>Resolved:</strong>{" "}
                  {formatDate(selectedResponse.resolvedAt)}
                </p>
              </>
            )}
            <p>
              <strong>Status:</strong>{" "}
              {selectedResponse.displayStatus}
            </p>
            <button
              style={styles.button}
              onClick={() => setSelectedResponse(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Responses;
