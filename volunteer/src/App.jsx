import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Header from "./components/header";
import Sidebar from "./components/sidebar";
import Footer from "./components/footer";
import Profile from "./components/profile";
import Login from "./pages/login";
import Register from "./pages/register";
import SOSRequests from "./pages/sosrequests";
import IncidentReports from "./pages/incidentreports";
import Responses from "./pages/responses";
import History from "./pages/history";
import TrustScore from "./pages/trustscore";
import Badges from "./pages/badges";
import Dashboard from "./pages/dashboard";
import EmergencyAlertBanner from "./components/EmergencyAlertBanner";

function Layout() {
  const Location = useLocation();

  if (location.pathname === "/") {
    return <Login />;
  }

  if (location.pathname === "/register") {
    return <Register />;
  }

  const toggleSidebar = () => {
    const mobile = window.innerWidth < 992;
    const className = mobile ? "sidebar-open" : "sidebar-collapsed";
    const otherClassName = mobile ? "sidebar-collapsed" : "sidebar-open";

    document.body.classList.remove(otherClassName);
    document.body.classList.toggle(className);
  };

  const closeSidebar = () => {
    document.body.classList.remove("sidebar-open", "sidebar-collapsed");
  };

  return (
    <div className="page-wrapper">
      <Sidebar onClose={closeSidebar} />
      <div className="page-container">
        <EmergencyAlertBanner />
        <Header onToggle={toggleSidebar} />
        <main className="main-content" id="main-content">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/sosrequests" element={<SOSRequests />} />
            <Route path="/incidentreports" element={<IncidentReports />} />
            <Route path="/responses" element={<Responses />} />
            <Route path="/history" element={<History />} />
            <Route path="/trustscore" element={<TrustScore />} />
            <Route path="/badges" element={<Badges />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
        <Footer />
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
