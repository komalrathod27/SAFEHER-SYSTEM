import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";

import Header from "./components/header";
import Sidebar from "./components/sidebar";
import Dashboard from "./pages/dashboard";
import AdminProfile from "./components/adminprofile";
import Footer from "./components/footer";
import WomenUsers from "./pages/womenusers";
import AllVolunteers from "./pages/allvolunteers";
import SOSMonitor from "./pages/sosmonitor";
import AdminSOSHistory from "./pages/adminsoshistory";
import AdminReports from "./pages/adminreports";
import SafetyMapManagement from "./pages/safetymapmanage";
import SafetyArticles from "./pages/safetyarticles";
import UserReports from "./pages/userreports.";
import WomenReport from "./pages/womenreport.jsx";
import VolunteerReport from "./pages/volunteerreport.jsx";
import AdminLogin from "./pages/adminlogin";

function Layout() {
  const location = useLocation();

  if (location.pathname === "/") {
    return <AdminLogin />;
  }

  return (
    <div className="container-scroller">
      <Header />

      <div className="container-fluid page-body-wrapper">
        <Sidebar />

        <div className="main-panel">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/adminprofile" element={<AdminProfile />} />
            <Route path="/womenusers" element={<WomenUsers />} />
            <Route path="/allvolunteers" element={<AllVolunteers />} />
            <Route path="/sosmonitor" element={<SOSMonitor />} />
            <Route path="/adminsoshistory" element={<AdminSOSHistory />} />
            <Route path="/adminreports" element={<AdminReports />} />
            <Route path="/safetymapmanage" element={<SafetyMapManagement />} />
            <Route path="/safetyarticles" element={<SafetyArticles />} />
            <Route path="/userreports" element={<UserReports />} />
            <Route path="/womenreport/:id" element={<WomenReport />} />
            <Route path="/volunteerreport/:id" element={<VolunteerReport />} />
          </Routes>

          <Footer />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
