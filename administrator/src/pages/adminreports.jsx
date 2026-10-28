import { useCallback, useEffect, useState } from "react";
import axios from "axios";

function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportsError, setReportsError] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionBox, setShowRejectionBox] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchReports = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/getadminincidentreports",
      );

      setReports(response.data);
      setReportsError("");
    } catch (error) {
      console.error("Incident reports fetch error:", error);
      setReportsError("Unable to load incident report counts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadReports() {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/getadminincidentreports",
        );
        if (isMounted) {
          setReports(response.data);
          setReportsError("");
        }
      } catch (error) {
        console.error("Incident reports fetch error:", error);
        if (isMounted) {
          setReportsError("Unable to load incident report counts.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadReports();

    return () => {
      isMounted = false;
    };
  }, []);

  const reportStatusCounts = {
    underReview: reports.filter((report) => report.status === "Under Review")
      .length,
    verified: reports.filter((report) => report.status === "Verified").length,
    rejected: reports.filter((report) => report.status === "Rejected").length,
  };

  const filteredReports = reports.filter((report) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      report.incidentType.toLowerCase().includes(search) ||
      report.womanName.toLowerCase().includes(search) ||
      report.location.toLowerCase().includes(search);

    const matchesStatus = statusFilter === "" || report.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="content-wrapper">
      {/* Page Header */}

      <div className="row">
        <div className="col-12 grid-margin">
          <div>
            <h4 className="card-title mb-1">Incident Reports</h4>

            <p className="text-muted mb-0">
              Review and manage incident reports submitted by women users.
            </p>
          </div>
        </div>
      </div>

      {reportsError && (
        <div className="alert alert-danger" role="alert">
          {reportsError}
        </div>
      )}

      <div className="row">
        <div className="col-md-4 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <p className="card-title text-muted mb-2">Under Review</p>
              <h2 className="text-warning mb-0">
                {loading || reportsError
                  ? "—"
                  : reportStatusCounts.underReview.toLocaleString("en-IN")}
              </h2>
              <small className="text-muted">Reports awaiting review</small>
            </div>
          </div>
        </div>

        <div className="col-md-4 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <p className="card-title text-muted mb-2">Verified</p>
              <h2 className="text-success mb-0">
                {loading || reportsError
                  ? "—"
                  : reportStatusCounts.verified.toLocaleString("en-IN")}
              </h2>
              <small className="text-muted">Reports verified by admin</small>
            </div>
          </div>
        </div>

        <div className="col-md-4 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <p className="card-title text-muted mb-2">Rejected</p>
              <h2 className="text-danger mb-0">
                {loading || reportsError
                  ? "—"
                  : reportStatusCounts.rejected.toLocaleString("en-IN")}
              </h2>
              <small className="text-muted">Reports rejected by admin</small>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}

      <div className="row">
        <div className="col-12 grid-margin">
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-md-8">
                  <div className="form-group mb-0">
                    <label>Search Reports</label>

                    <input
                      type="text"
                      id="incidentSearch"
                      className="form-control"
                      placeholder="Search by report ID, incident type, woman or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-group mb-0">
                    <label>Status</label>

                    <select
                      id="incidentStatusFilter"
                      className="form-control"
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                      }}
                    >
                      <option value="All">All Reports</option>

                      <option value="Under Review">Under Review</option>

                      <option value="Verified">Verified</option>

                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Table */}

      <div className="row">
        <div className="col-12 grid-margin">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Submitted Incident Reports</h4>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Report ID</th>

                      <th>Incident Type</th>

                      <th>Woman User</th>

                      <th>Location</th>

                      <th>Date</th>

                      <th>Status</th>

                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          Loading incident reports...
                        </td>
                      </tr>
                    ) : reports.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          <i className="mdi mdi-file-search-outline mdi-36px text-muted"></i>

                          <h5 className="mt-2">No Incident Reports Found</h5>

                          <p className="text-muted mb-0">
                            No incident reports have been submitted yet.
                          </p>
                        </td>
                      </tr>
                    ) : filteredReports.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          <i className="mdi mdi-file-search-outline mdi-36px text-muted"></i>

                          <h5 className="mt-2">No Matching Reports Found</h5>

                          <p className="text-muted mb-0">
                            No incident reports match your search or status
                            filter.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredReports.map((report) => (
                        <tr key={report._id}>
                          <td>
                            <strong>{report.reportNumber}</strong>
                          </td>

                          <td>{report.incidentType}</td>

                          <td>{report.womanName}</td>

                          <td>{report.location}</td>

                          <td>{report.incidentDate}</td>

                          <td>
                            <span
                              className={
                                report.status === "Verified"
                                  ? "badge badge-success"
                                  : report.status === "Rejected"
                                    ? "badge badge-danger"
                                    : "badge badge-warning"
                              }
                            >
                              {report.status}
                            </span>
                          </td>

                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => setSelectedReport(report)}
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
        </div>
      </div>

      {/* View Incident Modal */}

      <div
        id="adminReportModal"
        style={{
          display: selectedReport ? "block" : "none",
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
                <h5 className="modal-title mb-1">Incident Report Details</h5>

                <small className="text-muted">
                  Report #{selectedReport?.reportNumber}
                </small>
              </div>
              <button
                type="button"
                className="close"
                onClick={() => setSelectedReport(null)}
              >
                <span>&times;</span>
              </button>
            </div>

            <div className="modal-body">
              {/* Incident Information */}

              <h5 className="mb-3">Incident Information</h5>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <small className="text-muted d-block">Incident Type</small>

                  <strong>{selectedReport?.incidentType}</strong>
                </div>

                <div className="col-md-6 mb-3">
                  <small className="text-muted d-block">Incident Date</small>

                  <strong>{selectedReport?.incidentDate}</strong>
                </div>

                <div className="col-md-6 mb-3">
                  <small className="text-muted d-block">Incident Time</small>

                  <strong>{selectedReport?.incidentTime}</strong>
                </div>

                <div className="col-md-6 mb-3">
                  <small className="text-muted d-block">Location</small>

                  <strong>{selectedReport?.location}</strong>
                </div>
              </div>

              {/* Description */}

              <div className="mb-4">
                <small className="text-muted d-block">Description</small>

                <p className="mb-0">{selectedReport?.description}</p>
              </div>

              {/* Incident Photo */}

              <div className="mb-4">
                <h5 className="mb-3">Incident Photo</h5>
                {selectedReport?.photo && (
                  <img
                    src={`http://localhost:3000/incidentReports/${selectedReport.photo}`}
                    alt="Incident"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "300px",
                      objectFit: "contain",
                      borderRadius: "5px",
                    }}
                  />
                )}
              </div>

              <hr />

              {/* Reporter Information */}

              <h5 className="mb-3">Reporter Information</h5>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <small className="text-muted d-block">Woman User</small>

                  <strong>{selectedReport?.womanName}</strong>
                </div>

                <div className="col-md-6 mb-3">
                  <small className="text-muted d-block">Phone Number</small>

                  <strong>{selectedReport?.phone}</strong>
                </div>
              </div>

              <hr />

              {/* Admin Review */}

              <h5 className="mb-3">Admin Review</h5>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <small className="text-muted d-block">Current Status</small>

                  <div id="incidentCurrentStatus">{selectedReport?.status}</div>
                </div>
              </div>

              <div className="mb-4">
                <small className="text-muted d-block">Admin Remarks</small>

                <p className="mb-0" id="incidentAdminRemarks">
                  {selectedReport?.adminRemarks}
                </p>
              </div>

              {/* Download PDF */}

              <div className="mb-3">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => {
                    window.open(
                      `http://localhost:3000/api/getreportspdf/${selectedReport?._id}`,
                      "_blank",
                    );
                  }}
                >
                  <i className="mdi mdi-file-pdf-box mr-1"></i>
                  Download PDF
                </button>
              </div>

              {/* Admin Actions */}

              <div className="border-top pt-4 mt-4">
                <div className="d-flex justify-content-end">
                  {selectedReport?.status === "Under Review" && (
                    <>
                      <button
                        type="button"
                        className="btn btn-danger mr-2"
                        onClick={() => {
                          setRejectionReason("");
                          setShowRejectionBox(true);
                        }}
                      >
                        Reject
                      </button>

                      <button
                        type="button"
                        className="btn btn-success"
                        onClick={async () => {
                          try {
                            await axios.put(
                              `http://localhost:3000/api/verifyincidentreport/${selectedReport._id}`,
                            );

                            alert("Incident report verified successfully.");

                            setSelectedReport(null);
                            fetchReports();
                          } catch (error) {
                            console.log(error);
                            alert("Error while verifying incident report.");
                          }
                        }}
                      >
                        Verify
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Reason Modal */}
      {showRejectionBox && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title pt-1">Rejection Reason</h5>

                <button
                  type="button"
                  className="close"
                  onClick={() => {
                    setShowRejectionBox(false);
                    setRejectionReason("");
                  }}
                >
                  <span>&times;</span>
                </button>
              </div>

              <div className="modal-body pt-3">
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Enter the reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                ></textarea>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowRejectionBox(false);
                    setRejectionReason("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={async () => {
                    if (!rejectionReason.trim()) {
                      alert("Please enter a rejection reason.");
                      return;
                    }

                    try {
                      await axios.put(
                        `http://localhost:3000/api/rejectincidentreport/${selectedReport._id}`,
                        {
                          adminRemarks: rejectionReason,
                        },
                      );

                      alert("Incident report rejected successfully.");

                      setShowRejectionBox(false);
                      setRejectionReason("");
                      setSelectedReport(null);
                      fetchReports();
                    } catch (error) {
                      console.log(error);
                      alert("Error while rejecting incident report.");
                    }
                  }}
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminReports;
