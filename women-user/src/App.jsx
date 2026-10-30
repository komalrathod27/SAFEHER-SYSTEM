import { useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
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
import ForgotPassword from "./pages/forgotpassword.jsx";

function WomanActivityTracker() {
  const location = useLocation();
  const lastActivitySentAt = useRef(0);

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("mydata") || "null");
    const womanId = session?.user_id;

    if (!womanId) return undefined;

    const recordActivity = () => {
      const now = Date.now();

      if (now - lastActivitySentAt.current < 5 * 60 * 1000) return;

      lastActivitySentAt.current = now;
      fetch(
        `http://localhost:3000/api/womanactivity/${encodeURIComponent(womanId)}`,
        { method: "PUT" },
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `Activity update failed with status ${response.status}.`,
            );
          }
        })
        .catch((error) => {
          console.error("Unable to update woman user activity:", error);
        });
    };

    const recordVisibleActivity = () => {
      if (document.visibilityState === "visible") recordActivity();
    };

    recordActivity();
    window.addEventListener("pointerdown", recordActivity, { passive: true });
    window.addEventListener("keydown", recordActivity);
    document.addEventListener("visibilitychange", recordVisibleActivity);

    return () => {
      window.removeEventListener("pointerdown", recordActivity);
      window.removeEventListener("keydown", recordActivity);
      document.removeEventListener("visibilitychange", recordVisibleActivity);
    };
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <Router>
      <WomanActivityTracker />
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
        <Route path="/forgotpassword" element={<ForgotPassword />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
