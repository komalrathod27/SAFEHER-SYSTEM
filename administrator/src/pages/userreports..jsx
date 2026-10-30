import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const USERS_PER_PAGE = 10;

function UserReports() {
  const navigate = useNavigate();

  const [womenUsers, setWomenUsers] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [sosRequests, setSosRequests] = useState([]);
  const [incidentReports, setIncidentReports] = useState([]);

  const [activeTab, setActiveTab] = useState("women");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReportData();
  }, []);

  const getList = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.requests)) return data.requests;
    if (Array.isArray(data?.users)) return data.users;
    if (Array.isArray(data?.women)) return data.women;
    if (Array.isArray(data?.volunteers)) return data.volunteers;
    if (Array.isArray(data?.reports)) return data.reports;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  const fetchReportData = async () => {
    setLoading(true);
    setError("");

    const results = await Promise.allSettled([
      axios.get("http://localhost:3000/api/getwomanusers"),
      axios.get("http://localhost:3000/api/getvolunteer"),
      axios.get("http://localhost:3000/api/sos/all"),
      axios.get("http://localhost:3000/api/getadminincidentreports"),
    ]);

    if (results.every((result) => result.status === "rejected")) {
      setError("Unable to load report data. Please check your backend.");
    }

    if (results[0].status === "fulfilled") {
      setWomenUsers(getList(results[0].value.data));
    } else {
      console.error("Women Users API:", results[0].reason);
    }

    if (results[1].status === "fulfilled") {
      setVolunteers(getList(results[1].value.data));
    } else {
      console.error("Volunteers API:", results[1].reason);
    }

    if (results[2].status === "fulfilled") {
      setSosRequests(getList(results[2].value.data));
    } else {
      console.error("SOS API:", results[2].reason);
    }

    if (results[3].status === "fulfilled") {
      setIncidentReports(getList(results[3].value.data));
    } else {
      console.error("Incident Reports API:", results[3].reason);
    }

    setLoading(false);
  };

  const currentUsers = activeTab === "women" ? womenUsers : volunteers;

  const getUserId = (user) => user?._id || user?.user_id || user?.id || "";

  const getUserName = (user) =>
    user?.name ||
    user?.womanName ||
    user?.volunteerName ||
    user?.fullName ||
    "Unknown";

  const getUserEmail = (user) =>
    user?.email || user?.womanEmail || user?.volunteerEmail || "—";

  const getUserPhone = (user) =>
    user?.phoneNumber ||
    user?.contact_no ||
    user?.phone ||
    user?.phoneNo ||
    user?.mobile ||
    user?.mobileNo ||
    "—";

  const getUserStatus = (user) =>
    user?.status ||
    user?.accountStatus ||
    user?.approvalStatus ||
    user?.volunteerStatus ||
    "—";

  const getRegistrationDate = (user) => {
    const registrationDate =
      user?.createdAt ||
      user?.registrationDate ||
      user?.registeredAt ||
      user?.date;

    const userId = String(getUserId(user));
    const objectIdDate = /^[a-f\d]{24}$/i.test(userId)
      ? new Date(Number.parseInt(userId.slice(0, 8), 16) * 1000)
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
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredUsers = useMemo(() => {
    const today = new Date();

    return currentUsers.filter((user) => {
      const name = getUserName(user).toLowerCase();
      const email = getUserEmail(user).toLowerCase();
      const phone = getUserPhone(user).toLowerCase();
      const id = String(getUserId(user)).toLowerCase();
      const status = getUserStatus(user).toLowerCase();

      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !search ||
        name.includes(search) ||
        email.includes(search) ||
        phone.includes(search) ||
        id.includes(search);

      const matchesStatus =
        statusFilter === "All" || status === statusFilter.toLowerCase();

      let matchesDate = true;
      const registrationDate = getRegistrationDate(user);

      if (dateFilter !== "All") {
        if (!registrationDate) {
          matchesDate = false;
        } else {
          const registered = new Date(registrationDate);
          const fromDate = new Date();

          const days =
            dateFilter === "Last 7 Days"
              ? 7
              : dateFilter === "Last 30 Days"
                ? 30
                : 180;

          fromDate.setDate(fromDate.getDate() - days);

          matchesDate =
            !Number.isNaN(registered.getTime()) &&
            registered >= fromDate &&
            registered <= today;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [currentUsers, searchTerm, statusFilter, dateFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, statusFilter, dateFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / USERS_PER_PAGE),
  );
  const displayedPage = Math.min(currentPage, totalPages);
  const paginatedUsers = filteredUsers.slice(
    (displayedPage - 1) * USERS_PER_PAGE,
    displayedPage * USERS_PER_PAGE,
  );
  const firstDisplayedUser =
    filteredUsers.length === 0
      ? 0
      : (displayedPage - 1) * USERS_PER_PAGE + 1;
  const lastDisplayedUser = Math.min(
    displayedPage * USERS_PER_PAGE,
    filteredUsers.length,
  );

  const availableStatuses = [
    ...new Set(
      currentUsers
        .map((user) => getUserStatus(user))
        .filter((status) => status !== "—"),
    ),
  ];

  const openUserReport = (user) => {
    const id = getUserId(user);

    if (!id) {
      alert("User ID is not available.");
      return;
    }

    if (activeTab === "women") {
      navigate(`/womenreport/${id}`);
    } else {
      navigate(`/volunteerreport/${id}`);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setDateFilter("All");
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    const normalized = String(status).toLowerCase();

    if (
      normalized === "active" ||
      normalized === "approved" ||
      normalized === "verified"
    ) {
      return "badge badge-success";
    }

    if (normalized === "pending" || normalized === "under review") {
      return "badge badge-warning";
    }

    if (normalized === "rejected" || normalized === "inactive") {
      return "badge badge-danger";
    }

    return "badge badge-secondary";
  };

  return (
    <div className="content-wrapper">
      {/* Page Header */}
      <div className="row">
        <div className="col-md-12 grid-margin">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="font-weight-bold mb-0">User Reports</h4>

              <p className="text-muted mb-0">
                View user information and their activity reports.
              </p>
            </div>

            <button
              className="btn btn-primary"
              onClick={fetchReportData}
              disabled={loading}
            >
              <i className="mdi mdi-refresh mr-1"></i>
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row">
        <div className="col-md-3 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <p className="card-title text-muted">Total Women Users</p>

              <h3>{loading ? "—" : womenUsers.length}</h3>

              <p className="text-primary mb-0">Registered women users</p>
            </div>
          </div>
        </div>

        <div className="col-md-3 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <p className="card-title text-muted">Total Volunteers</p>

              <h3>{loading ? "—" : volunteers.length}</h3>

              <p className="text-success mb-0">Registered volunteers</p>
            </div>
          </div>
        </div>

        <div className="col-md-3 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <p className="card-title text-muted">Total SOS Requests</p>

              <h3>{loading ? "—" : sosRequests.length}</h3>

              <p className="text-warning mb-0">Total emergency requests</p>
            </div>
          </div>
        </div>

        <div className="col-md-3 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <p className="card-title text-muted">Total Incident Reports</p>

              <h3>{loading ? "—" : incidentReports.length}</h3>

              <p className="text-danger mb-0">Submitted incident reports</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Directory */}
      <div className="row">
        <div className="col-md-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h4 className="card-title mb-1">Users Directory</h4>

                  <p className="text-muted mb-0">
                    Select a user to view their individual report.
                  </p>
                </div>
              </div>

              {/* Category Tabs */}
              <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link ${
                      activeTab === "women" ? "active" : ""
                    }`}
                    onClick={() => {
                      setActiveTab("women");
                      setStatusFilter("All");
                    }}
                  >
                    <i className="mdi mdi-account-female mr-1"></i>
                    Woman Users ({womenUsers.length})
                  </button>
                </li>

                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link ${
                      activeTab === "volunteers" ? "active" : ""
                    }`}
                    onClick={() => {
                      setActiveTab("volunteers");
                      setStatusFilter("All");
                    }}
                  >
                    <i className="mdi mdi-account-group mr-1"></i>
                    Volunteers ({volunteers.length})
                  </button>
                </li>
              </ul>

              {/* Search and Filters */}
              <div className="mb-4 user-reports-filters">
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Search Users</label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by name, email, phone or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <label>Status</label>

                    <select
                      className="form-control"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="All">All Status</option>

                      {availableStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <label>Registration Date</label>

                    <select
                      className="form-control"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    >
                      <option value="All">All Dates</option>
                      <option value="Last 7 Days">Last 7 Days</option>
                      <option value="Last 30 Days">Last 30 Days</option>
                      <option value="Last 6 Months">Last 6 Months</option>
                    </select>
                  </div>
                </div>

                <div className="col-auto d-flex align-items-center">
                  <button
                    type="button"
                    className="btn btn-sm user-reports-reset"
                    onClick={resetFilters}
                  >
                    <i className="mdi mdi-refresh mr-1"></i>
                    Reset
                  </button>
                </div>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {/* Users Table */}
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Phone No.</th>
                      <th>Registration Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="text-center text-muted">
                          Loading users...
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center text-muted">
                          No users found.
                        </td>
                      </tr>
                    ) : (
                      paginatedUsers.map((user) => {
                        const status = getUserStatus(user);

                        return (
                          <tr key={getUserId(user)}>
                            <td>
                              <strong>{getUserName(user)}</strong>

                              <br />

                              <small className="text-muted">
                                ID: {getUserId(user) || "—"}
                              </small>
                            </td>

                            <td>{getUserEmail(user)}</td>

                            <td>{getUserPhone(user)}</td>

                            <td>{formatDate(getRegistrationDate(user))}</td>

                            <td>
                              <span className={getStatusBadge(status)}>
                                {status}
                              </span>
                            </td>

                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => openUserReport(user)}
                              >
                                <i className="mdi mdi-eye mr-1"></i>
                                View Report
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <p className="text-muted mb-0">
                  Showing {firstDisplayedUser}-{lastDisplayedUser} of{" "}
                  {filteredUsers.length} users
                </p>

                <p className="text-muted mb-0">
                  {activeTab === "women" ? "Woman Users" : "Volunteers"}
                </p>
              </div>

              {filteredUsers.length > USERS_PER_PAGE && (
                <nav aria-label="User report pages" className="mt-3">
                  <ul className="pagination justify-content-center mb-0">
                    <li
                      className={`page-item ${
                        displayedPage === 1 ? "disabled" : ""
                      }`}
                    >
                      <button
                        type="button"
                        className="page-link"
                        onClick={() =>
                          setCurrentPage((page) => Math.max(1, page - 1))
                        }
                        disabled={displayedPage === 1}
                        aria-label="Previous page"
                      >
                        Previous
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, index) => {
                      const page = index + 1;

                      return (
                        <li
                          key={page}
                          className={`page-item ${
                            page === displayedPage ? "active" : ""
                          }`}
                        >
                          <button
                            type="button"
                            className="page-link"
                            onClick={() => setCurrentPage(page)}
                            aria-current={
                              page === displayedPage ? "page" : undefined
                            }
                          >
                            {page}
                          </button>
                        </li>
                      );
                    })}
                    <li
                      className={`page-item ${
                        displayedPage === totalPages ? "disabled" : ""
                      }`}
                    >
                      <button
                        type="button"
                        className="page-link"
                        onClick={() =>
                          setCurrentPage((page) =>
                            Math.min(totalPages, page + 1),
                          )
                        }
                        disabled={displayedPage === totalPages}
                        aria-label="Next page"
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserReports;
