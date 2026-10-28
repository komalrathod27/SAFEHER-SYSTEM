import { useCallback, useEffect, useMemo, useState } from "react";
import Axios from "axios";

const API_BASE = "http://localhost:3000";

function formatDate(value) {
  if (!value) return "Not recorded";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not recorded";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusClass(status) {
  return status === "Resolved" ? "badge-success" : "badge-secondary";
}

function getAdminRequestConfig() {
  const session = JSON.parse(sessionStorage.getItem("mydata") || "null");
  return {
    headers: session?.token
      ? { Authorization: `Bearer ${session.token}` }
      : {},
  };
}

function HistoryField({ label, value }) {
  return (
    <div className="col-md-6 mb-3">
      <small className="text-muted d-block">{label}</small>
      <strong>{value || "Not recorded"}</strong>
    </div>
  );
}

export default function AdminSOSHistory() {
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedSOS, setSelectedSOS] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshError, setRefreshError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await Axios.get(
        `${API_BASE}/api/admin/sos/all`,
        getAdminRequestConfig(),
      );
      const allRequests = Array.isArray(response.data?.requests)
        ? response.data.requests
        : [];

      setRequests(allRequests.filter((sos) => sos.status === "Resolved"));
      setLastUpdated(new Date());
      setRefreshError("");
    } catch (error) {
      console.error("Admin SOS history fetch error:", error);
      setRefreshError(
        error.response?.data?.message ||
          "Unable to load SOS history. Check the server connection.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialRefreshTimer = window.setTimeout(fetchHistory, 0);
    const refreshTimer = window.setInterval(fetchHistory, 5000);

    return () => {
      window.clearTimeout(initialRefreshTimer);
      window.clearInterval(refreshTimer);
    };
  }, [fetchHistory]);

  useEffect(() => {
    if (!selectedSOS) return undefined;

    function closeOnEscape(event) {
      if (event.key === "Escape") setSelectedSOS(null);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedSOS]);

  const filteredRequests = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return requests.filter((sos) => {
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

      return matchesSearch;
    });
  }, [requests, search]);

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <div>
          <h3 className="page-title">SOS History</h3>
          <p className="text-muted mb-0">
            Resolved SOS cases from saved records.
          </p>
        </div>
        <div className="text-right">
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={fetchHistory}
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

      {refreshError && (
        <div className="alert alert-warning" role="status">
          {refreshError}
          {requests.length > 0 && " Showing the last successfully loaded data."}
        </div>
      )}

      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-12 mb-2">
              <label className="sr-only" htmlFor="sos-history-search">
                Search SOS history
              </label>
              <input
                id="sos-history-search"
                className="form-control"
                type="search"
                placeholder="Search SOS ID, user, location, or volunteer..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {loading && requests.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <p className="text-muted mb-0">Loading SOS history...</p>
          </div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="mdi mdi-history mdi-36px text-muted"></i>
            <h5 className="mt-3">No SOS Cases Found</h5>
            <p className="text-muted mb-0">
              {requests.length === 0
                ? "No resolved SOS cases have been recorded."
                : "No historical SOS cases match your search."}
            </p>
          </div>
        </div>
      ) : (
        <div className="row">
          {filteredRequests.map((sos) => (
            <div className="col-md-6 mb-4" key={sos._id}>
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="mr-2">
                      <h5 className="mb-1">SOS {sos._id}</h5>
                      <small className="text-muted">
                        {sos.emergencyType || "Emergency Assistance"}
                      </small>
                    </div>
                    <span className={`badge ${getStatusClass(sos.status)}`}>
                      {sos.status}
                    </span>
                  </div>

                  <div className="row mb-2">
                    <HistoryField label="Woman User" value={sos.womanName} />
                    <HistoryField
                      label="Location"
                      value={sos.womanAddress}
                    />
                    <HistoryField
                      label="Volunteer"
                      value={sos.volunteerName}
                    />
                    <HistoryField
                      label="Request Created"
                      value={formatDate(sos.createdAt)}
                    />
                  </div>

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setSelectedSOS(sos)}
                  >
                    View Case
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSOS && (
        <div
          className="sos-history-backdrop"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedSOS(null);
          }}
          style={{
            position: "fixed",
            zIndex: 1050,
            inset: 0,
            overflowY: "auto",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <div
            className="modal-dialog modal-lg"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sos-history-modal-title"
            style={{ margin: "60px auto", maxWidth: "850px" }}
          >
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h5
                    className="modal-title mb-1"
                    id="sos-history-modal-title"
                  >
                    SOS Case Details
                  </h5>
                  <small className="text-muted">
                    SOS {selectedSOS._id}
                  </small>
                </div>
                <button
                  type="button"
                  className="close"
                  aria-label="Close case details"
                  onClick={() => setSelectedSOS(null)}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>

              <div className="modal-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Case Information</h5>
                  <span
                    className={`badge ${getStatusClass(selectedSOS.status)}`}
                  >
                    {selectedSOS.status}
                  </span>
                </div>
                <div className="row">
                  <HistoryField
                    label="Woman User"
                    value={selectedSOS.womanName}
                  />
                  <HistoryField
                    label="Phone Number"
                    value={selectedSOS.womanPhone}
                  />
                  <HistoryField
                    label="Location"
                    value={selectedSOS.womanAddress}
                  />
                  <HistoryField
                    label="Emergency Type"
                    value={selectedSOS.emergencyType}
                  />
                  <HistoryField
                    label="Request Created"
                    value={formatDate(selectedSOS.createdAt)}
                  />
                  <HistoryField
                    label="Volunteer Assigned"
                    value={formatDate(selectedSOS.assignedAt)}
                  />
                  <HistoryField
                    label="Volunteer Accepted"
                    value={formatDate(selectedSOS.acceptedAt)}
                  />
                  <HistoryField
                    label="Resolved"
                    value={formatDate(selectedSOS.resolvedAt)}
                  />
                  <HistoryField
                    label="Volunteer"
                    value={selectedSOS.volunteerName}
                  />
                  <HistoryField
                    label="Volunteer ID"
                    value={selectedSOS.volunteerId}
                  />
                  <HistoryField
                    label="Volunteer Phone"
                    value={selectedSOS.volunteerPhone}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
