import { useEffect, useState } from "react";
import Axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Link } from "react-router-dom";

const API_BASE = "http://localhost:3000";

function getAdminRequestConfig() {
  const session = JSON.parse(sessionStorage.getItem("mydata") || "null");
  return {
    headers: session?.token
      ? { Authorization: `Bearer ${session.token}` }
      : {},
  };
}

function formatSOSDate(value) {
  if (!value) return "Not recorded";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not recorded";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSOSStatusBadge(status) {
  if (["Pending", "Approved"].includes(status)) return "badge-warning";
  if (status === "Active") return "badge-info";
  if (status === "Resolved") return "badge-success";
  if (status === "Cancelled") return "badge-secondary";
  return "badge-light";
}

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");
  const [growthPeriod, setGrowthPeriod] = useState("monthly");
  const [growthData, setGrowthData] = useState([]);
  const [growthTotal, setGrowthTotal] = useState(0);
  const [growthLoading, setGrowthLoading] = useState(true);
  const [growthError, setGrowthError] = useState("");
  const [sosOverview, setSosOverview] = useState([]);
  const [resolvedSOSTotal, setResolvedSOSTotal] = useState(0);
  const [sosOverviewLoading, setSosOverviewLoading] = useState(true);
  const [sosOverviewError, setSosOverviewError] = useState("");
  const usersession = sessionStorage.getItem("mydata");

  useEffect(() => {
    if (!usersession) {
      alert("Please Login first...");
      window.location.href = "/adminlogin";
    }
  }, [usersession]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/js/dashboard.js";
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchSummary() {
      if (!usersession) {
        setSummaryLoading(false);
        return;
      }

      try {
        const response = await Axios.get(
          `${API_BASE}/api/admin/dashboard/summary`,
          getAdminRequestConfig(),
        );

        if (isMounted) {
          setSummary(response.data);
          setSummaryError("");
        }
      } catch (error) {
        console.error("Admin dashboard summary fetch error:", error);
        if (isMounted) {
          setSummaryError(
            "Unable to load dashboard summary. Please refresh the page.",
          );
        }
      } finally {
        if (isMounted) {
          setSummaryLoading(false);
        }
      }
    }

    fetchSummary();

    return () => {
      isMounted = false;
    };
  }, [usersession]);

  useEffect(() => {
    let isMounted = true;

    async function fetchWomenGrowth() {
      if (!usersession) {
        setGrowthLoading(false);
        return;
      }

      setGrowthLoading(true);
      setGrowthError("");

      try {
        const response = await Axios.get(
          `${API_BASE}/api/admin/dashboard/women-growth`,
          {
            ...getAdminRequestConfig(),
            params: { period: growthPeriod },
          },
        );

        if (isMounted) {
          setGrowthData(response.data.data);
          setGrowthTotal(response.data.totalRegistrations);
        }
      } catch (error) {
        console.error("Women registration growth fetch error:", error);
        if (isMounted) {
          setGrowthData([]);
          setGrowthError(
            "Unable to load women registration growth. Please try again.",
          );
        }
      } finally {
        if (isMounted) {
          setGrowthLoading(false);
        }
      }
    }

    fetchWomenGrowth();

    return () => {
      isMounted = false;
    };
  }, [growthPeriod, usersession]);

  useEffect(() => {
    let isMounted = true;

    async function fetchSOSOverview() {
      if (!usersession) {
        setSosOverviewLoading(false);
        return;
      }

      try {
        const response = await Axios.get(
          `${API_BASE}/api/admin/dashboard/sos-overview`,
          getAdminRequestConfig(),
        );

        if (isMounted) {
          setSosOverview(response.data.data);
          setResolvedSOSTotal(response.data.totalResolved);
          setSosOverviewError("");
        }
      } catch (error) {
        console.error("Admin SOS overview fetch error:", error);
        if (isMounted) {
          setSosOverview([]);
          setSosOverviewError(
            "Unable to load SOS overview. Please refresh the page.",
          );
        }
      } finally {
        if (isMounted) {
          setSosOverviewLoading(false);
        }
      }
    }

    fetchSOSOverview();

    return () => {
      isMounted = false;
    };
  }, [usersession]);

  const displayedValue = (value) => {
    if (summaryLoading) return "...";
    return typeof value === "number" ? value : "—";
  };

  const pendingActions = summary
    ? summary.pendingVolunteers +
      summary.pendingIncidentReports +
      summary.articles.drafts +
      summary.unassignedSOS
    : null;

  const getSummaryBadgeClass = (isAttention = false) =>
    `badge badge-outline-${summaryError ? "secondary" : isAttention ? "danger" : "success"} badge-pill`;

  return (
    <>
      <div className="content-wrapper">
        {/* PAGE HEADER */}
        <div className="page-header">
          <h3 className="page-title">SafeHer Dashboard</h3>
        </div>

        {/* ========================================= */}
        {/* MAIN STATISTICS */}
        {/* ========================================= */}

        <div className="row grid-margin">
          <div className="col-12">
            <div className="card card-statistics">
              <div className="card-body">
                {summaryError && (
                  <div className="alert alert-danger" role="alert">
                    {summaryError}
                  </div>
                )}
                <div className="d-flex flex-column flex-md-row align-items-center justify-content-between">
                  {/* WOMEN USERS */}
                  <Link
                    to="/womenusers"
                    className="statistics-item dashboard-statistics-link"
                  >
                    <p>
                      <i className="icon-sm fa fa-users mr-2"></i>
                      Women Users
                    </p>

                    <h2>{displayedValue(summary?.womenUsers)}</h2>

                    <label className={getSummaryBadgeClass()}>
                      Registered users
                    </label>
                  </Link>

                  {/* VOLUNTEERS */}
                  <Link
                    to="/allvolunteers"
                    className="statistics-item dashboard-statistics-link"
                  >
                    <p>
                      <i className="icon-sm fas fa-user-shield mr-2"></i>
                      Volunteers
                    </p>

                    <h2>{displayedValue(summary?.totalVolunteers)}</h2>

                    <label className={getSummaryBadgeClass()}>
                      {summaryLoading
                        ? "Loading..."
                        : summaryError
                          ? "Unavailable"
                          : `${summary?.approvedVolunteers ?? 0} approved · ${summary?.pendingVolunteers ?? 0} pending`}
                    </label>
                  </Link>

                  {/* ACTIVE SOS */}
                  <Link
                    to="/sosmonitor"
                    className="statistics-item dashboard-statistics-link"
                  >
                    <p>
                      <i className="icon-sm fas fa-exclamation-triangle mr-2"></i>
                      Active SOS
                    </p>

                    <h2>{displayedValue(summary?.openSOS)}</h2>

                    <label
                      className={getSummaryBadgeClass(
                        summary?.unassignedSOS > 0,
                      )}
                    >
                      {summaryLoading
                        ? "Loading..."
                        : summaryError
                          ? "Unavailable"
                          : `${summary?.unassignedSOS ?? 0} awaiting assignment`}
                    </label>
                  </Link>

                  {/* INCIDENT REPORTS */}
                  <Link
                    to="/adminreports"
                    className="statistics-item dashboard-statistics-link"
                  >
                    <p>
                      <i className="icon-sm fas fa-file-alt mr-2"></i>
                      Incident Reports
                    </p>

                    <h2>{displayedValue(summary?.totalIncidentReports)}</h2>

                    <label className={getSummaryBadgeClass()}>
                      {summaryLoading
                        ? "Loading..."
                        : summaryError
                          ? "Unavailable"
                          : `${summary?.pendingIncidentReports ?? 0} awaiting review`}
                    </label>
                  </Link>

                  {/* SAFETY ARTICLES */}
                  <Link
                    to="/safetyarticles"
                    className="statistics-item dashboard-statistics-link"
                  >
                    <p>
                      <i className="icon-sm fas fa-book-open mr-2"></i>
                      Articles
                    </p>

                    <h2>{displayedValue(summary?.articles?.total)}</h2>

                    <label className={getSummaryBadgeClass()}>
                      {summaryLoading
                        ? "Loading..."
                        : summaryError
                          ? "Unavailable"
                          : `${summary?.articles?.published ?? 0} published · ${summary?.articles?.drafts ?? 0} drafts`}
                    </label>
                  </Link>

                  {/* PENDING ACTIONS */}
                  <Link
                    to="/dashboard#needs-attention"
                    className="statistics-item dashboard-statistics-link"
                    onClick={() => {
                      document
                        .getElementById("needs-attention")
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  >
                    <p>
                      <i className="icon-sm fas fa-clock mr-2"></i>
                      Pending Actions
                    </p>

                    <h2>{displayedValue(pendingActions)}</h2>

                    <label
                      className={getSummaryBadgeClass(pendingActions > 0)}
                    >
                      {summaryLoading
                        ? "Loading..."
                        : summaryError
                          ? "Unavailable"
                          : pendingActions > 0
                            ? "Needs attention"
                            : "All caught up"}
                    </label>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* USER GROWTH + SOS REQUESTS */}
        {/* ========================================= */}

        <div className="dashboard-chart-grid">
          {/* WOMEN USER GROWTH */}
          <div className="dashboard-chart-column">
            <div className="card">
              <div className="card-body">
                <div className="d-flex flex-wrap justify-content-between align-items-start">
                  <div>
                    <h4 className="card-title">
                      <i className="fas fa-chart-line mr-2"></i>
                      Women User Growth
                    </h4>

                    <p className="card-description">
                      New registrations over time
                    </p>
                  </div>

                  <div
                    className="btn-group btn-group-sm mb-3"
                    role="group"
                    aria-label="Women registration graph period"
                  >
                    {[
                      ["daily", "Daily"],
                      ["weekly", "Weekly"],
                      ["monthly", "Monthly"],
                      ["yearly", "Yearly"],
                    ].map(([period, label]) => (
                      <button
                        key={period}
                        type="button"
                        className={`btn ${growthPeriod === period ? "btn-primary" : "btn-outline-primary"}`}
                        aria-pressed={growthPeriod === period}
                        onClick={() => setGrowthPeriod(period)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-2">
                  <small className="text-muted">
                    {growthPeriod === "daily" && "Last 30 days"}
                    {growthPeriod === "weekly" && "Last 12 weeks"}
                    {growthPeriod === "monthly" && "Last 12 months"}
                    {growthPeriod === "yearly" && "All available years"}
                  </small>
                  <span className="badge badge-light">
                    {growthLoading
                      ? "Loading total..."
                      : growthError
                        ? "Total unavailable"
                        : `${growthTotal.toLocaleString("en-IN")} registrations`}
                  </span>
                </div>

                {growthLoading ? (
                  <div
                    className="d-flex align-items-center justify-content-center text-muted"
                    style={{ width: "100%", height: 300 }}
                    role="status"
                  >
                    Loading registration data...
                  </div>
                ) : growthError ? (
                  <div className="alert alert-danger" role="alert">
                    {growthError}
                  </div>
                ) : (
                  <div
                    style={{ width: "100%", height: 300 }}
                    aria-label={`${growthPeriod} women registrations chart`}
                  >
                    <ResponsiveContainer>
                      <LineChart
                        data={growthData}
                        margin={{ top: 12, right: 12, bottom: 4, left: 0 }}
                      >
                        <CartesianGrid
                          vertical={false}
                          stroke="#e8edf5"
                          strokeDasharray="4 4"
                        />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          tickLine={false}
                          axisLine={{ stroke: "#cbd5e1" }}
                          minTickGap={18}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          allowDecimals={false}
                          domain={[0, (dataMax) => Math.max(1, dataMax)]}
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          tickLine={false}
                          axisLine={false}
                          width={36}
                        />
                        <Tooltip
                          labelStyle={{ color: "#172554", fontWeight: 700 }}
                          formatter={(value) => [
                            `${Number(value).toLocaleString("en-IN")} registrations`,
                            "New women users",
                          ]}
                        />
                        <Line
                          type="monotone"
                          dataKey="registrations"
                          name="New women users"
                          stroke="#2f80ed"
                          strokeWidth={3}
                          dot={{
                            r: 3,
                            fill: "#ffffff",
                            stroke: "#2f80ed",
                            strokeWidth: 2,
                          }}
                          activeDot={{
                            r: 6,
                            fill: "#e83e8c",
                            strokeWidth: 0,
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SOS REQUESTS */}
          <div className="dashboard-chart-column">
            <div className="card">
              <div className="card-body">
                <div className="d-flex flex-wrap justify-content-between align-items-start">
                  <div>
                    <h4 className="card-title">
                      <i className="fas fa-exclamation-circle mr-2"></i>
                      SOS Overview
                    </h4>

                    <p className="card-description">
                      SOS requests created and resolved each month
                    </p>
                  </div>
                  <span className="badge badge-light mb-3">
                    {sosOverviewLoading
                      ? "Loading resolved total..."
                      : sosOverviewError
                        ? "Resolved total unavailable"
                        : `${resolvedSOSTotal.toLocaleString("en-IN")} resolved total`}
                  </span>
                </div>

                {sosOverviewLoading ? (
                  <div
                    className="d-flex align-items-center justify-content-center text-muted"
                    style={{ width: "100%", height: 300 }}
                    role="status"
                  >
                    Loading SOS data...
                  </div>
                ) : sosOverviewError ? (
                  <div className="alert alert-danger" role="alert">
                    {sosOverviewError}
                  </div>
                ) : (
                  <div style={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart
                        data={sosOverview}
                        margin={{ top: 12, right: 12, bottom: 4, left: 0 }}
                      >
                        <CartesianGrid
                          vertical={false}
                          stroke="#e8edf5"
                          strokeDasharray="4 4"
                        />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          tickLine={false}
                          axisLine={{ stroke: "#cbd5e1" }}
                          minTickGap={18}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          allowDecimals={false}
                          domain={[0, (dataMax) => Math.max(1, dataMax)]}
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          tickLine={false}
                          axisLine={false}
                          width={36}
                        />
                        <Tooltip
                          labelStyle={{ color: "#172554", fontWeight: 700 }}
                          formatter={(value, name) => [
                            `${Number(value).toLocaleString("en-IN")}`,
                            name,
                          ]}
                        />
                        <Legend />
                        <Bar
                          dataKey="requests"
                          name="SOS Requests"
                          fill="#e83e8c"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="resolved"
                          name="Resolved"
                          fill="#2f80ed"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* RECENT SOS ACTIVITY */}
        {/* ========================================= */}

        <div className="row">
          <div className="col-md-8 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <h4 className="card-title">
                    <i className="fas fa-history mr-2"></i>
                    Recent SOS Activity
                  </h4>

                  <Link
                    to="/adminsoshistory"
                    className="btn btn-sm btn-outline-primary"
                  >
                    View All
                  </Link>
                </div>

                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>SOS ID</th>
                        <th>Woman User</th>
                        <th>Volunteer</th>
                        <th>Status</th>
                        <th>Time</th>
                      </tr>
                    </thead>

                    <tbody>
                      {summaryLoading ? (
                        <tr>
                          <td colSpan="5" className="text-center py-4">
                            Loading recent SOS activity...
                          </td>
                        </tr>
                      ) : summaryError ? (
                        <tr>
                          <td colSpan="5" className="text-center py-4">
                            Recent SOS activity is unavailable.
                          </td>
                        </tr>
                      ) : summary?.recentSOS?.length ? (
                        summary.recentSOS.map((sos) => (
                          <tr key={sos._id}>
                            <td className="font-weight-bold">
                              SOS-{String(sos._id).slice(-6).toUpperCase()}
                            </td>
                            <td>{sos.womanName || "Anonymous User"}</td>
                            <td>{sos.volunteerName || "Unassigned"}</td>
                            <td>
                              <label
                                className={`badge ${getSOSStatusBadge(sos.status)} badge-pill`}
                              >
                                {sos.status || "Unknown"}
                              </label>
                            </td>
                            <td>{formatSOSDate(sos.createdAt)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center py-4">
                            No SOS activity yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* NEEDS ATTENTION */}

          <div
            className="col-md-4 grid-margin stretch-card"
            id="needs-attention"
          >
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">
                  <i className="fas fa-bell mr-2"></i>
                  Needs Attention
                </h4>

                <p className="card-description">Pending admin actions</p>

                {/* PENDING VOLUNTEERS */}

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h5 className="mb-1">Pending Volunteers</h5>

                    <small className="text-muted">
                      Applications waiting for review
                    </small>
                  </div>

                  <Link
                    to="/allvolunteers"
                    className="btn btn-sm btn-outline-primary"
                    aria-label="View pending volunteers"
                  >
                    {displayedValue(summary?.pendingVolunteers)}
                  </Link>
                </div>

                {/* INCIDENT REPORTS */}

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h5 className="mb-1">Incident Reports</h5>

                    <small className="text-muted">
                      Reports waiting for review
                    </small>
                  </div>

                  <Link
                    to="/adminreports"
                    className="btn btn-sm btn-outline-primary"
                    aria-label="Review incident reports"
                  >
                    {displayedValue(summary?.pendingIncidentReports)}
                  </Link>
                </div>

                {/* DRAFT ARTICLES */}

                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1">Draft Articles</h5>

                    <small className="text-muted">
                      Articles waiting to be published
                    </small>
                  </div>

                  <Link
                    to="/safetyarticles"
                    className="btn btn-sm btn-outline-primary"
                    aria-label="View draft safety articles"
                  >
                    {displayedValue(summary?.articles?.drafts)}
                  </Link>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div>
                    <h5 className="mb-1">Unassigned SOS</h5>

                    <small className="text-muted">
                      Requests waiting for volunteer assignment
                    </small>
                  </div>

                  <Link
                    to="/sosmonitor"
                    className="btn btn-sm btn-outline-primary"
                    aria-label="View unassigned SOS requests"
                  >
                    {displayedValue(summary?.unassignedSOS)}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
