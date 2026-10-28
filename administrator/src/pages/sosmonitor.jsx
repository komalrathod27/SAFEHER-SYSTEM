import { useCallback, useEffect, useMemo, useState } from "react";
import Axios from "axios";

const API_BASE = "http://localhost:3000";
const OPEN_STATUSES = new Set(["Pending", "Approved", "Active"]);

function formatDate(value) {
  if (!value) return "Unavailable";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unavailable";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusLabel(status) {
  if (status === "Pending") return "Waiting for volunteer";
  if (status === "Approved") return "Volunteer assigned";
  if (status === "Active") return "Assistance in progress";
  return status || "Unknown";
}

function getStatusClass(status) {
  if (status === "Pending") return "badge-warning";
  if (status === "Approved") return "badge-info";
  if (status === "Active") return "badge-primary";
  return "badge-secondary";
}

function getElapsedTime(value, referenceTime) {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp) || !referenceTime) return "Time unavailable";

  const elapsedSeconds = Math.max(
    0,
    Math.floor((referenceTime - timestamp) / 1000),
  );
  if (elapsedSeconds < 60) return `${elapsedSeconds}s ago`;
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`;
  return `${Math.floor(elapsedMinutes / 60)}h ${elapsedMinutes % 60}m ago`;
}

function getAssignmentCountdown(value, referenceTime) {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp) || !referenceTime) return null;

  return Math.max(0, Math.ceil((timestamp + 60_000 - referenceTime) / 1000));
}

function getAdminRequestConfig() {
  const session = JSON.parse(sessionStorage.getItem("mydata") || "null");
  return {
    headers: session?.token
      ? { Authorization: `Bearer ${session.token}` }
      : {},
  };
}

export default function SOSMonitor() {
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedSOS, setSelectedSOS] = useState(null);
  const [assignmentSOS, setAssignmentSOS] = useState(null);
  const [eligibleVolunteers, setEligibleVolunteers] = useState([]);
  const [hasAreaMatches, setHasAreaMatches] = useState(false);
  const [loadingVolunteers, setLoadingVolunteers] = useState(false);
  const [assignmentError, setAssignmentError] = useState("");
  const [assigningVolunteerId, setAssigningVolunteerId] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshError, setRefreshError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchRequests = useCallback(async () => {
    try {
      const response = await Axios.get(
        `${API_BASE}/api/admin/sos/all`,
        getAdminRequestConfig(),
      );
      const liveRequests = Array.isArray(response.data?.requests)
        ? response.data.requests
        : [];

      setRequests(liveRequests.filter((sos) => OPEN_STATUSES.has(sos.status)));
      setLastUpdated(new Date());
      setRefreshError("");
    } catch (error) {
      console.error("Admin SOS monitoring fetch error:", error);
      setRefreshError(
        error.response?.data?.message ||
          "Unable to refresh SOS data. Check the server connection.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialRefreshTimer = window.setTimeout(fetchRequests, 0);
    const refreshTimer = window.setInterval(fetchRequests, 5000);

    return () => {
      window.clearTimeout(initialRefreshTimer);
      window.clearInterval(refreshTimer);
    };
  }, [fetchRequests]);

  useEffect(() => {
    if (!selectedSOS && !assignmentSOS) return undefined;

    function closeOnEscape(event) {
      if (event.key === "Escape") {
        setSelectedSOS(null);
        setAssignmentSOS(null);
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedSOS, assignmentSOS]);

  const openAssignment = useCallback(async (sos) => {
    setAssignmentSOS(sos);
    setEligibleVolunteers([]);
    setHasAreaMatches(false);
    setAssignmentError("");
    setLoadingVolunteers(true);

    try {
      const response = await Axios.get(
        `${API_BASE}/api/admin/sos/${sos._id}/eligible-volunteers`,
        getAdminRequestConfig(),
      );
      setEligibleVolunteers(
        Array.isArray(response.data?.volunteers)
          ? response.data.volunteers
          : [],
      );
      setHasAreaMatches(response.data?.hasAreaMatches === true);
    } catch (error) {
      console.error("Admin eligible-volunteer fetch error:", error);
      setAssignmentError(
        error.response?.data?.message ||
          "Unable to load available volunteers. Check the server connection.",
      );
    } finally {
      setLoadingVolunteers(false);
    }
  }, []);

  const assignVolunteer = useCallback(
    async (volunteer) => {
      if (!assignmentSOS) return;

      setAssigningVolunteerId(volunteer._id);
      setAssignmentError("");
      setSuccessMessage("");
      try {
        const response = await Axios.put(
          `${API_BASE}/api/admin/sos/${assignmentSOS._id}/assign`,
          { volunteerId: volunteer._id },
          getAdminRequestConfig(),
        );
        setAssignmentSOS(null);
        setSuccessMessage(
          response.data?.message || "Volunteer assigned successfully.",
        );
        await fetchRequests();
      } catch (error) {
        console.error("Admin SOS assignment error:", error);
        setAssignmentError(
          error.response?.data?.message ||
            "Unable to assign this volunteer. Refresh and try again.",
        );
        await fetchRequests();
      } finally {
        setAssigningVolunteerId("");
      }
    },
    [assignmentSOS, fetchRequests],
  );

  const filteredRequests = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return requests.filter((sos) => {
      const matchesStatus =
        statusFilter === "All" || sos.status === statusFilter;
      const searchableValues = [
        sos._id,
        sos.womanName,
        sos.womanPhone,
        sos.womanAddress,
        sos.emergencyType,
        sos.volunteerName,
      ];
      const matchesSearch = searchableValues.some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(normalizedSearch),
      );

      return matchesStatus && matchesSearch;
    });
  }, [requests, search, statusFilter]);

  const counts = useMemo(
    () => ({
      pending: requests.filter((sos) => sos.status === "Pending").length,
      assigned: requests.filter((sos) => sos.status === "Approved").length,
      active: requests.filter((sos) => sos.status === "Active").length,
    }),
    [requests],
  );

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <div>
          <h3 className="page-title">SOS Monitoring</h3>
          <p className="text-muted mb-0">
            Incoming and volunteer-managed SOS cases. Data refreshes every 5
            seconds.
          </p>
        </div>
        <div className="text-right">
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={fetchRequests}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
          {lastUpdated && (
            <small className="d-block text-muted mt-1">
              Updated {lastUpdated.toLocaleTimeString("en-IN")}
            </small>
          )}
        </div>
      </div>

      <div className="row">
        {[
          {
            label: "Waiting for volunteer",
            count: counts.pending,
            className: "text-warning",
          },
          {
            label: "Volunteer assigned",
            count: counts.assigned,
            className: "text-info",
          },
          {
            label: "Assistance in progress",
            count: counts.active,
            className: "text-primary",
          },
        ].map((item) => (
          <div className="col-md-4 grid-margin stretch-card" key={item.label}>
            <div className="card w-100">
              <div className="card-body">
                <p className="card-title text-muted mb-1">{item.label}</p>
                <h3 className={`mb-0 ${item.className}`}>{item.count}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {refreshError && (
        <div className="alert alert-warning" role="status">
          {refreshError}
          {requests.length > 0 && " Showing the last successfully loaded data."}
        </div>
      )}
      {successMessage && (
        <div className="alert alert-success" role="status">
          <span>{successMessage}</span>
          <button
            type="button"
            className="close"
            aria-label="Dismiss assignment message"
            onClick={() => setSuccessMessage("")}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      )}

      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
            <div>
              <h4 className="card-title mb-1">Open SOS cases</h4>
              <p className="text-muted mb-0">
                Pending, assigned, and active cases from the live SOS records.
              </p>
            </div>
            <span className="badge badge-danger p-2">Admin Monitoring</span>
          </div>

          <div className="row mb-3">
            <div className="col-md-7 mb-2">
              <label className="sr-only" htmlFor="sos-monitor-search">
                Search SOS cases
              </label>
              <input
                id="sos-monitor-search"
                className="form-control"
                type="search"
                placeholder="Search SOS ID, user, location, or volunteer..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="col-md-5 mb-2">
              <label className="sr-only" htmlFor="sos-monitor-status">
                Filter by SOS status
              </label>
              <select
                id="sos-monitor-status"
                className="form-control"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="All">All open SOS cases</option>
                <option value="Pending">Waiting for volunteer</option>
                <option value="Approved">Volunteer assigned</option>
                <option value="Active">Assistance in progress</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>SOS ID</th>
                  <th>Woman User</th>
                  <th>Location</th>
                  <th>Triggered</th>
                  <th>Status</th>
                  <th>Volunteer</th>
                  <th>Action</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {loading && requests.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      Loading live SOS records...
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      {requests.length === 0
                        ? "There are no open SOS cases right now."
                        : "No SOS cases match your search or status filter."}
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((sos) => (
                    <tr key={sos._id}>
                      <td>
                        <strong>{String(sos._id).slice(-8).toUpperCase()}</strong>
                      </td>
                      <td>
                        <strong>{sos.womanName || "Woman User"}</strong>
                        <small className="d-block text-muted">
                          {sos.womanPhone || "Phone unavailable"}
                        </small>
                      </td>
                      <td>{sos.womanAddress || "Location unavailable"}</td>
                      <td>
                        {formatDate(sos.createdAt)}
                        <small className="d-block text-muted">
                          {getElapsedTime(
                            sos.createdAt,
                            lastUpdated?.getTime(),
                          )}
                        </small>
                      </td>
                      <td>
                        <span className={`badge ${getStatusClass(sos.status)}`}>
                          {getStatusLabel(sos.status)}
                        </span>
                      </td>
                      <td>{sos.volunteerName || "Not assigned"}</td>
                      <td>
                        {sos.status === "Pending" ? (
                          (() => {
                            const remainingSeconds = getAssignmentCountdown(
                              sos.createdAt,
                              lastUpdated?.getTime(),
                            );

                            return (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => openAssignment(sos)}
                                disabled={
                                  remainingSeconds === null ||
                                  remainingSeconds > 0
                                }
                                title={
                                  remainingSeconds > 0
                                    ? "Admin assignment is available 60 seconds after the SOS starts."
                                    : "Assign an available volunteer"
                                }
                              >
                                {remainingSeconds === null
                                  ? "Time unavailable"
                                  : remainingSeconds > 0
                                    ? `Available in ${remainingSeconds}s`
                                    : "Assign volunteer"}
                              </button>
                            );
                          })()
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => setSelectedSOS(sos)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedSOS && (
        <div
          role="presentation"
          onClick={() => setSelectedSOS(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1050,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            background: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-sos-detail-title"
            className="card mb-0"
            onClick={(event) => event.stopPropagation()}
            style={{ width: "100%", maxWidth: 680, maxHeight: "90vh", overflowY: "auto" }}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h4 id="admin-sos-detail-title" className="card-title mb-1">
                    SOS Case Details
                  </h4>
                  <span className="text-muted">
                    {String(selectedSOS._id).toUpperCase()}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-light btn-sm"
                  aria-label="Close details"
                  onClick={() => setSelectedSOS(null)}
                >
                  ×
                </button>
              </div>
              <p>
                <strong>Status:</strong> {getStatusLabel(selectedSOS.status)}
              </p>
              <p>
                <strong>Woman user:</strong>{" "}
                {selectedSOS.womanName || "Woman User"}
              </p>
              <p>
                <strong>Phone:</strong>{" "}
                {selectedSOS.womanPhone || "Unavailable"}
              </p>
              <p>
                <strong>Emergency:</strong>{" "}
                {selectedSOS.emergencyType || "Emergency Assistance"}
              </p>
              <p>
                <strong>Location:</strong>{" "}
                {selectedSOS.womanAddress || "Unavailable"}
              </p>
              <p>
                <strong>Triggered:</strong> {formatDate(selectedSOS.createdAt)}
              </p>
              <p>
                <strong>Accepted:</strong>{" "}
                {formatDate(selectedSOS.acceptedAt)}
              </p>
              <p>
                <strong>Assigned:</strong>{" "}
                {formatDate(selectedSOS.assignedAt)}
              </p>
              <p>
                <strong>Resolved:</strong>{" "}
                {formatDate(selectedSOS.resolvedAt)}
              </p>
              <p>
                <strong>Volunteer:</strong>{" "}
                {selectedSOS.volunteerName || "Not assigned"}
              </p>
              <p>
                <strong>Volunteer phone:</strong>{" "}
                {selectedSOS.volunteerPhone || "Unavailable"}
              </p>
              <p>
                <strong>Distance:</strong> {selectedSOS.distance || "Unavailable"}
              </p>
              {selectedSOS.womanLat !== null &&
                selectedSOS.womanLat !== undefined &&
                selectedSOS.womanLng !== null &&
                selectedSOS.womanLng !== undefined &&
                Number.isFinite(Number(selectedSOS.womanLat)) &&
                Number.isFinite(Number(selectedSOS.womanLng)) && (
                  <a
                    className="btn btn-outline-primary btn-sm"
                    href={`https://www.google.com/maps?q=${selectedSOS.womanLat},${selectedSOS.womanLng}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open location in Maps
                  </a>
                )}
            </div>
          </section>
        </div>
      )}

      {assignmentSOS && (
        <div
          role="presentation"
          onClick={() => {
            if (!assigningVolunteerId) setAssignmentSOS(null);
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1060,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            background: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-sos-assignment-title"
            className="card mb-0"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 680,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h4
                    id="admin-sos-assignment-title"
                    className="card-title mb-1"
                  >
                    Assign a Volunteer
                  </h4>
                  <span className="text-muted">
                    SOS {String(assignmentSOS._id).slice(-8).toUpperCase()}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-light btn-sm"
                  aria-label="Close volunteer assignment"
                  disabled={Boolean(assigningVolunteerId)}
                  onClick={() => setAssignmentSOS(null)}
                >
                  &times;
                </button>
              </div>

              {hasAreaMatches ? (
                <div className="alert alert-info" role="status">
                  Showing approved, available volunteers whose service area
                  matches this SOS location.
                </div>
              ) : (
                eligibleVolunteers.length > 0 && (
                  <div className="alert alert-warning" role="status">
                    No available volunteer matches this service area. Showing
                    all other approved, available volunteers.
                  </div>
                )
              )}

              {assignmentError && (
                <div className="alert alert-danger" role="alert">
                  {assignmentError}
                </div>
              )}

              {loadingVolunteers ? (
                <p className="text-center text-muted py-4 mb-0">
                  Loading available volunteers...
                </p>
              ) : eligibleVolunteers.length === 0 && !assignmentError ? (
                <p className="text-center text-muted py-4 mb-0">
                  No approved, available volunteers can be assigned right now.
                </p>
              ) : (
                <div className="list-group">
                  {eligibleVolunteers.map((volunteer) => (
                    <div
                      className="list-group-item d-flex justify-content-between align-items-center flex-wrap"
                      key={volunteer._id}
                    >
                      <div className="mr-3">
                        <strong className="d-block">{volunteer.name}</strong>
                        <small className="text-muted d-block">
                          Service area: {volunteer.serviceArea || "Not provided"}
                        </small>
                        {volunteer.contact_no && (
                          <small className="text-muted d-block">
                            Phone: {volunteer.contact_no}
                          </small>
                        )}
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger mt-2"
                        onClick={() => assignVolunteer(volunteer)}
                        disabled={Boolean(assigningVolunteerId)}
                      >
                        {assigningVolunteerId === volunteer._id
                          ? "Assigning..."
                          : "Assign"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
