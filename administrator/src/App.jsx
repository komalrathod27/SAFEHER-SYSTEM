import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import Header from "./components/header";
import Sidebar from "./components/sidebar";
import Dashboard from "./pages/dashboard";
import AdminProfile from "./components/adminprofile";
import Footer from "./components/footer";
import WomenUsers from "./pages/womenusers";
import AllVolunteers from "./pages/allvolunteers";
import AdminSOSRequests from "./pages/adminsosrequests";
import AdminActiveSOS from "./pages/adminactivesos";
import AdminSOSHistory from "./pages/adminsoshistory";
import AdminReports from "./pages/adminreports";
import SafetyMapManagement from "./pages/safetymapmanage";
import SafetyArticles from "./pages/safetyarticles";
import AdminLogin from "./pages/adminlogin";

function Layout() {
  const Location = useLocation();

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
            <Route path="/adminsosrequests" element={<AdminSOSRequests />} />
            <Route path="/adminactivesos" element={<AdminActiveSOS />} />
            <Route path="/adminsoshistory" element={<AdminSOSHistory />} />
            <Route path="/adminreports" element={<AdminReports />} />
            <Route path="/safetymapmanage" element={<SafetyMapManagement />} />
            <Route path="/safetyarticles" element={<SafetyArticles />} />
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
