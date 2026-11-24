import React, { useEffect, useState } from "react";
import axios from "axios";
import { getVolunteerId } from "../utils/volunteerIdentity";
import "../volunteer-css/responses.css";

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

  return (
    <div className="responses-page">
      <h1 className="responses-title">My Responses</h1>
      <p className="responses-subtitle">
        View your completed emergency responses.
      </p>

      <div className="responses-stats">
        <div className="responses-stat">
          <div>Total Responses</div>
          <h2>{responses.length}</h2>
        </div>

        <div className="responses-stat">
          <div>Avg. Response Time</div>
          <h2>
            {validTimes
              ? `${(averageResponseTime || 0).toFixed(1)} min`
              : "N/A"}
          </h2>
        </div>
      </div>

      <div className="responses-card">
        <div className="responses-toolbar">
          <input
            className="responses-input"
            style={{ flex: 1, minWidth: "200px" }}
            placeholder="Search ID or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="responses-input"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="All">All Dates</option>
            <option value="Recent">Last 7 Days</option>
          </select>
        </div>

        {loading ? (
          <p className="responses-message">Loading responses...</p>
        ) : error ? (
          <p className="responses-error">{error}</p>
        ) : (
          <div className="responses-table-wrap">
            <table className="responses-table">
              <thead>
                <tr>
                  <th>SOS ID</th>
                  <th>Woman User</th>
                  <th>Location</th>
                  <th>Response Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredResponses.length ? (
                  filteredResponses.map((response) => (
                    <tr key={response._id}>
                      <td>{response._id.slice(-8).toUpperCase()}</td>
                      <td>{response.womanName || "Woman User"}</td>
                      <td>{response.womanAddress || "Location unavailable"}</td>
                      <td>
                        {formatDate(
                          response.status === "Resolved"
                            ? response.resolvedAt
                            : response.updatedAt || response.createdAt,
                        )}
                      </td>
                      <td>
                        <span
                          className={`responses-status-badge ${
                            response.displayStatus === "Resolved"
                              ? "responses-status-resolved"
                              : "responses-status-rejected"
                          }`}
                        >
                          {response.displayStatus}
                        </span>
                      </td>
                      <td>
                        <button
                          className="responses-button"
                          onClick={() => setSelectedResponse(response)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
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
        <div
          className="responses-overlay"
          onClick={() => setSelectedResponse(null)}
        >
          <div className="responses-modal" onClick={(e) => e.stopPropagation()}>
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
              <strong>Status:</strong> {selectedResponse.displayStatus}
            </p>

            <button
              className="responses-button"
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
