import { useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Link } from "react-router-dom";

const userGrowthData = [
  { month: "Apr", users: 62 },
  { month: "May", users: 74 },
  { month: "Jun", users: 86 },
  { month: "Jul", users: 97 },
  { month: "Aug", users: 112 },
  { month: "Sep", users: 128 },
];

const sosData = [
  { month: "Apr", requests: 18 },
  { month: "May", requests: 24 },
  { month: "Jun", requests: 21 },
  { month: "Jul", requests: 29 },
  { month: "Aug", requests: 35 },
  { month: "Sep", requests: 31 },
];

const incidentData = [
  { name: "Approved", value: 65 },
  { name: "Pending", value: 20 },
  { name: "Rejected", value: 15 },
];

const volunteerAreaData = [
  { area: "Vadodara", volunteers: 12 },
  { area: "Ahmedabad", volunteers: 10 },
  { area: "Surat", volunteers: 8 },
  { area: "Other", volunteers: 5 },
];

function Dashboard() {
  const usersession = sessionStorage.getItem("mydata");
  const user = JSON.parse(usersession);

  if (!usersession) {
    alert("Please Login first...");
    window.location.href = "/adminlogin";
  }

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/js/dashboard.js";
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

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
                <div className="d-flex flex-column flex-md-row align-items-center justify-content-between">
                  {/* WOMEN USERS */}
                  <div className="statistics-item">
                    <p>
                      <i className="icon-sm fa fa-users mr-2"></i>
                      Women Users
                    </p>

                    <h2>128</h2>

                    <label className="badge badge-outline-success badge-pill">
                      12% increase
                    </label>
                  </div>

                  {/* VOLUNTEERS */}
                  <div className="statistics-item">
                    <p>
                      <i className="icon-sm fas fa-user-shield mr-2"></i>
                      Volunteers
                    </p>

                    <h2>42</h2>

                    <label className="badge badge-outline-success badge-pill">
                      8% increase
                    </label>
                  </div>

                  {/* ACTIVE SOS */}
                  <div className="statistics-item">
                    <p>
                      <i className="icon-sm fas fa-exclamation-triangle mr-2"></i>
                      Active SOS
                    </p>

                    <h2>03</h2>

                    <label className="badge badge-outline-danger badge-pill">
                      3 active cases
                    </label>
                  </div>

                  {/* INCIDENT REPORTS */}
                  <div className="statistics-item">
                    <p>
                      <i className="icon-sm fas fa-file-alt mr-2"></i>
                      Incident Reports
                    </p>

                    <h2>56</h2>

                    <label className="badge badge-outline-success badge-pill">
                      15% increase
                    </label>
                  </div>

                  {/* SAFETY ARTICLES */}
                  <div className="statistics-item">
                    <p>
                      <i className="icon-sm fas fa-book-open mr-2"></i>
                      Articles
                    </p>

                    <h2>24</h2>

                    <label className="badge badge-outline-success badge-pill">
                      20 published
                    </label>
                  </div>

                  {/* PENDING ACTIONS */}
                  <div className="statistics-item">
                    <p>
                      <i className="icon-sm fas fa-clock mr-2"></i>
                      Pending
                    </p>

                    <h2>12</h2>

                    <label className="badge badge-outline-danger badge-pill">
                      Needs attention
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* USER GROWTH + SOS REQUESTS */}
        {/* ========================================= */}

        <div className="row">
          {/* WOMEN USER GROWTH */}
          <div className="col-md-6 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">
                  <i className="fas fa-chart-line mr-2"></i>
                  Women User Growth
                </h4>

                <p className="card-description">Monthly registration growth</p>

                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer>
                    <LineChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis dataKey="month" />

                      <YAxis />

                      <Tooltip />

                      <Line
                        type="monotone"
                        dataKey="users"
                        stroke="#2f80ed"
                        strokeWidth={3}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* SOS REQUESTS */}
          <div className="col-md-6 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">
                  <i className="fas fa-exclamation-circle mr-2"></i>
                  SOS Requests
                </h4>

                <p className="card-description">
                  Monthly emergency request statistics
                </p>

                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={sosData}>
                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis dataKey="month" />

                      <YAxis />

                      <Tooltip />

                      <Bar
                        dataKey="requests"
                        fill="#e83e8c"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* INCIDENT + VOLUNTEER STATISTICS */}
        {/* ========================================= */}

        <div className="row">
          {/* INCIDENT REPORT STATUS */}
          <div className="col-md-4 grid-margin stretch-card">
            <div className="card">
              <div className="card-body d-flex flex-column">
                <h4 className="card-title">
                  <i className="fas fa-chart-pie mr-2"></i>
                  Incident Reports
                </h4>

                <p className="card-description">Report moderation status</p>

                <div
                  className="flex-grow-1"
                  style={{ width: "100%", height: 280 }}
                >
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={incidentData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={85}
                        label
                      >
                        {incidentData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              index === 0
                                ? "#28a745"
                                : index === 1
                                  ? "#ffc107"
                                  : "#dc3545"
                            }
                          />
                        ))}
                      </Pie>

                      <Tooltip />

                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* VOLUNTEER OVERVIEW */}
          <div className="col-md-4 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">
                  <i className="fas fa-user-shield mr-2"></i>
                  Volunteer Overview
                </h4>

                <p className="card-description">
                  Current volunteer availability
                </p>

                <div className="row text-center mt-4">
                  <div className="col-6 mb-4">
                    <h3 className="text-success">24</h3>

                    <p className="text-muted">Available</p>
                  </div>

                  <div className="col-6 mb-4">
                    <h3 className="text-warning">05</h3>

                    <p className="text-muted">On SOS Duty</p>
                  </div>

                  <div className="col-6">
                    <h3 className="text-secondary">08</h3>

                    <p className="text-muted">Offline</p>
                  </div>

                  <div className="col-6">
                    <h3 className="text-danger">05</h3>

                    <p className="text-muted">Pending</p>
                  </div>
                </div>

                <div className="text-center mt-4">
                  <Link
                    to="/allvolunteers"
                    className="btn btn-outline-primary btn-sm"
                  >
                    View Volunteers
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* VOLUNTEER AREA */}
          <div className="col-md-4 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">
                  <i className="fas fa-map-marker-alt mr-2"></i>
                  Volunteer Coverage
                </h4>

                <p className="card-description">Volunteers by service area</p>

                <div style={{ width: "100%", height: 250 }}>
                  <ResponsiveContainer>
                    <BarChart data={volunteerAreaData}>
                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis dataKey="area" />

                      <YAxis />

                      <Tooltip />

                      <Bar
                        dataKey="volunteers"
                        fill="#172554"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
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
                      <tr>
                        <td className="font-weight-bold">SOS-1029</td>

                        <td>Pooja Mehta</td>

                        <td>Amit Shah</td>

                        <td>
                          <label className="badge badge-warning badge-pill">
                            Assistance in Progress
                          </label>
                        </td>

                        <td>10:53 AM</td>
                      </tr>

                      <tr>
                        <td className="font-weight-bold">SOS-1028</td>

                        <td>Anjali Desai</td>

                        <td>Vishal Desai</td>

                        <td>
                          <label className="badge badge-warning badge-pill">
                            Assistance in Progress
                          </label>
                        </td>

                        <td>10:47 AM</td>
                      </tr>

                      <tr>
                        <td className="font-weight-bold">SOS-1025</td>

                        <td>Neha Patel</td>

                        <td>Rahul Patel</td>

                        <td>
                          <label className="badge badge-info badge-pill">
                            Volunteer Responding
                          </label>
                        </td>

                        <td>10:34 AM</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* NEEDS ATTENTION */}

          <div className="col-md-4 grid-margin stretch-card">
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
                    to="/pendingapplications"
                    className="btn btn-sm btn-outline-primary"
                  >
                    05
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
                    to="/incidentreports"
                    className="btn btn-sm btn-outline-primary"
                  >
                    03
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
                  >
                    04
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* SAFETY ARTICLES STATISTICS */}
        {/* ========================================= */}

        <div className="row">
          <div className="col-12 grid-margin">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">
                  <i className="fas fa-book-open mr-2"></i>
                  Safety Articles
                </h4>

                <p className="card-description">
                  Current article publishing overview
                </p>

                <div className="row text-center">
                  <div className="col-md-4">
                    <h2>24</h2>

                    <p className="text-muted mb-0">Total Articles</p>
                  </div>

                  <div className="col-md-4">
                    <h2 className="text-success">20</h2>

                    <p className="text-muted mb-0">Published</p>
                  </div>

                  <div className="col-md-4">
                    <h2 className="text-warning">04</h2>

                    <p className="text-muted mb-0">Draft Articles</p>
                  </div>
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
