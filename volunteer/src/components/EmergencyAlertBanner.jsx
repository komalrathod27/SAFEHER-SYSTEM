import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import { io } from "socket.io-client";

function EmergencyAlertBanner() {
  const navigate = useNavigate();
  const [pendingAlert, setPendingAlert] = useState(null);
  const [dismissedId, setDismissedId] = useState(null);

  const storedData =
    sessionStorage.getItem("mydata") || localStorage.getItem("mydata");

  const volunteerData = storedData ? JSON.parse(storedData) : null;
  const volunteerId = volunteerData?.user_id;

  useEffect(() => {
    const checkAlerts = () => {
      Axios.get("http://localhost:3000/api/sos/all")
        .then((res) => {
          if (res.data && res.data.requests) {
            const pendingList = res.data.requests.filter(
              (r) =>
                r.status === "Pending" &&
                !r.rejectedByVolunteerIds?.includes(String(volunteerId)),
            );
            if (pendingList.length > 0) {
              const latest = pendingList[0];
              if (latest._id !== dismissedId) {
                setPendingAlert(latest);
              }
            } else {
              setPendingAlert(null);
            }
          }
        })
        .catch(() => {});
    };

    checkAlerts();

    // Socket.IO real-time listener (Replaced Polling)
    const socket = io("http://localhost:3000", {
      transports: ["polling", "websocket"],
    });

    socket.on("connect", () => {
      socket.emit("join_volunteers");
    });

    socket.on("new_sos_alert", (newAlert) => {
      if (newAlert && newAlert._id !== dismissedId) {
        setPendingAlert(newAlert);
      }
    });

    socket.on("sos_updated", checkAlerts);
    socket.on("sos_approved", checkAlerts);
    socket.on("sos_resolved", checkAlerts);
    socket.on("sos_cancelled", checkAlerts);
    socket.on("sos_rejected", checkAlerts);

    return () => {
      socket.disconnect();
    };
  }, [dismissedId]);

  if (!pendingAlert) return null;

  const handleRespond = () => {
    localStorage.setItem("targetSosId", pendingAlert._id);
    navigate("/sosrequests");
  };

  const handleDismiss = () => {
    setDismissedId(pendingAlert._id);
    setPendingAlert(null);
  };

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 99999,
        background: "linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)",
        color: "#ffffff",
        padding: "12px 24px",
        boxShadow: "0 6px 20px rgba(220,38,38,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        borderBottom: "2px solid #ef4444",
        animation: "emergencyPulseBanner 2s infinite ease-in-out",
      }}
    >
      <style>
        {`
          @keyframes emergencyPulseBanner {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.92; }
          }
        `}
      </style>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span
          style={{
            background: "#ffffff",
            color: "#dc2626",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            fontWeight: "900",
          }}
        >
          🚨
        </span>
        <div>
          <div
            style={{
              fontWeight: "800",
              fontSize: "14px",
              letterSpacing: "0.5px",
            }}
          >
            NEW EMERGENCY SOS ALERT RECEIVED!
          </div>
          <div style={{ fontSize: "12.5px", opacity: 0.95 }}>
            <strong>{pendingAlert.womanName || "Woman in Need"}</strong>{" "}
            requested immediate assistance at{" "}
            <strong>
              {pendingAlert.womanAddress || "Current GPS Location"}
            </strong>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button
          onClick={handleRespond}
          style={{
            background: "#ffffff",
            color: "#dc2626",
            border: "none",
            borderRadius: "20px",
            padding: "8px 20px",
            fontWeight: "800",
            fontSize: "13px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "transform 0.2s ease",
          }}
        >
          <span>Accept SOS & Open Map →</span>
        </button>

        <button
          onClick={handleDismiss}
          style={{
            background: "rgba(255,255,255,0.2)",
            color: "#ffffff",
            border: "none",
            borderRadius: "50%",
            width: "30px",
            height: "30px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            fontWeight: "700",
          }}
          title="Dismiss banner"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default EmergencyAlertBanner;
