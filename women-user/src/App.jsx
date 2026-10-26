import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/header.jsx";
import Footer from "./components/footer.jsx";
import Profile from "./components/profile.jsx";
import Home from "./pages/home.jsx";
import About from "./pages/about.jsx";
import SafetyMap from "./pages/safetymap.jsx";
import SafetyResources from "./pages/safetyresources.jsx";
import HowItWorks from "./pages/howitworks.jsx";
import Register from "./pages/register.jsx";
import Login from "./pages/login.jsx";
import TrustedContacts from "./pages/trustedcontacts.jsx";
import ReportIncident from "./pages/reportincident.jsx";
import MyReports from "./pages/myreports.jsx";
import SOSTracking from "./pages/sostracking.jsx";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/safetymap" element={<SafetyMap />} />
        <Route path="/safetyresources" element={<SafetyResources />} />
        <Route path="/howitworks" element={<HowItWorks />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/trustedcontacts" element={<TrustedContacts />} />
        <Route path="/reportincident" element={<ReportIncident />} />
        <Route path="/myreports" element={<MyReports />} />
        <Route path="/sostracking" element={<SOSTracking />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
