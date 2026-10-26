import React, { useState, useEffect } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

function Header({ onToggle }) {
  const navigate = useNavigate();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [pendingList, setPendingList] = useState([]);

  const storedData =
    sessionStorage.getItem("mydata") || localStorage.getItem("mydata");

  const volunteerData = storedData ? JSON.parse(storedData) : null;
  const volunteerId = volunteerData?.user_id;

  // Fetch pending emergencies
  useEffect(() => {
    const fetchAlerts = () => {
      Axios.get("http://localhost:3000/api/sos/all")
        .then((res) => {
          if (res.data && res.data.requests) {
            const list = res.data.requests.filter(
              (r) =>
                r.status === "Pending" &&
                !r.rejectedByVolunteerIds?.includes(String(volunteerId)),
            );
            setPendingList(list);
          }
        })
        .catch(() => {});
    };

    fetchAlerts();

    // Socket.IO real-time listener (Replaced Polling)
    const socket = io("http://localhost:3000", {
      transports: ["polling", "websocket"],
    });

    socket.on("connect", () => {
      socket.emit("join_volunteers");
    });

    socket.on("new_sos_alert", fetchAlerts);
    socket.on("sos_updated", fetchAlerts);
    socket.on("sos_approved", fetchAlerts);
    socket.on("sos_resolved", fetchAlerts);
    socket.on("sos_cancelled", fetchAlerts);
    socket.on("sos_rejected", fetchAlerts);

    return () => {
      socket.disconnect();
    };
  }, []);

  // Get logged-in volunteer data
  const volunteerName = volunteerData?.name || "Volunteer";
  const volunteerEmail = volunteerData?.email || "";

  const closeOtherMenus = (menu) => {
    if (menu !== "notification") setNotificationOpen(false);
    if (menu !== "account") setAccountOpen(false);
  };

  const handleOpenSos = (sosId) => {
    localStorage.setItem("targetSosId", sosId);
    setNotificationOpen(false);
    navigate("/sosrequests");
  };

  return (
    <div className="page-wrapper">
      <header className="header-desktop">
        <div className="section__content section__content--p30">
          <div className="container-fluid">
            <div className="header-wrap">
              {/* ================= SIDEBAR TOGGLE ================= */}
              <button
                className="sidebar-toggle js-sidebar-toggle"
                type="button"
                onClick={onToggle}
                aria-label="Toggle navigation"
                aria-expanded="false"
                aria-controls="main-sidebar"
              >
                <i className="fa-solid fa-bars" aria-hidden="true"></i>
              </button>

              {/* ================= SEARCH ================= */}
              <form
                className="form-header"
                role="search"
                onSubmit={(event) => event.preventDefault()}
              >
                <i
                  className="fa-solid fa-magnifying-glass form-header__icon"
                  aria-hidden="true"
                ></i>

                <input
                  className="au-input au-input--xl"
                  type="search"
                  name="search"
                  placeholder="Search anything..."
                  aria-label="Search"
                />

                <kbd className="form-header__hint" aria-hidden="true">
                  Ctrl K
                </kbd>
              </form>

              {/* ================= HEADER RIGHT SIDE ================= */}
              <div className="header-button">
                <div className="noti-wrap">
                  {/* ================= NOTIFICATIONS ================= */}
                  <div
                    className={`noti__item js-item-menu ${
                      notificationOpen ? "show-dropdown" : ""
                    }`}
                    style={{ position: "relative" }}
                    onClick={() => {
                      closeOtherMenus("notification");
                      setNotificationOpen(!notificationOpen);
                    }}
                    role="button"
                    tabIndex="0"
                    aria-haspopup="true"
                    aria-expanded={notificationOpen}
                  >
                    <i className="fa-solid fa-bell"></i>
                    {pendingList.length > 0 && (
                      <span
                        style={{
                          background: "#dc2626",
                          color: "#ffffff",
                          borderRadius: "50%",
                          padding: "1px 6px",
                          fontSize: "11px",
                          fontWeight: "800",
                          position: "absolute",
                          top: "2px",
                          right: "2px",
                          boxShadow: "0 2px 6px rgba(220,38,38,0.5)",
                        }}
                      >
                        {pendingList.length}
                      </span>
                    )}

                    {/* NOTIFICATION DROPDOWN */}
                    {notificationOpen && (
                      <div
                        className="notifi-dropdown js-dropdown"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: "absolute",
                          right: "0",
                          top: "45px",
                          width: "320px",
                          background: "#ffffff",
                          borderRadius: "12px",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                          zIndex: 9999,
                          border: "1px solid #e2e8f0",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            padding: "12px 16px",
                            background:
                              pendingList.length > 0 ? "#fee2e2" : "#f8fafc",
                            borderBottom: "1px solid #e2e8f0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: "700",
                              fontSize: "13px",
                              color:
                                pendingList.length > 0 ? "#dc2626" : "#334155",
                            }}
                          >
                            🚨 Emergency Distress Alerts ({pendingList.length})
                          </span>
                        </div>

                        <div style={{ maxHeight: "280px", overflowY: "auto" }}>
                          {pendingList.length === 0 ? (
                            <div
                              style={{
                                padding: "20px",
                                textAlign: "center",
                                color: "#64748b",
                                fontSize: "13px",
                              }}
                            >
                              ✓ No pending SOS emergencies right now.
                            </div>
                          ) : (
                            pendingList.map((sos) => (
                              <div
                                key={sos._id}
                                style={{
                                  padding: "12px 16px",
                                  borderBottom: "1px solid #f1f5f9",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "4px",
                                  background: "#fff",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <strong
                                    style={{
                                      color: "#0f172a",
                                      fontSize: "13px",
                                    }}
                                  >
                                    {sos.womanName || "Woman in Need"}
                                  </strong>
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      color: "#dc2626",
                                      fontWeight: "700",
                                    }}
                                  >
                                    High Priority
                                  </span>
                                </div>
                                <div
                                  style={{ fontSize: "12px", color: "#64748b" }}
                                >
                                  📍 {sos.womanAddress || "GPS Coordinates"}
                                </div>
                                <button
                                  onClick={() => handleOpenSos(sos._id)}
                                  style={{
                                    marginTop: "6px",
                                    background: "#15803d",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "6px",
                                    padding: "6px 12px",
                                    fontSize: "12px",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                  }}
                                >
                                  ✓ Accept & View On Map →
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ================= VOLUNTEER PROFILE ================= */}
                <div className="account-wrap">
                  <div
                    className={`account-item clearfix js-item-menu ${
                      accountOpen ? "show-dropdown" : ""
                    }`}
                    onClick={() => {
                      closeOtherMenus("account");
                      setAccountOpen(!accountOpen);
                    }}
                    role="button"
                    tabIndex="0"
                    aria-haspopup="true"
                    aria-expanded={accountOpen}
                  >
                    {/* Profile Image */}
                    <div className="image">
                      <img
                        src="/images/icon/avatar-01.jpg"
                        alt={volunteerName}
                      />
                    </div>

                    {/* Profile Name */}
                    <div className="content">
                      <a
                        className="js-acc-btn"
                        href="#"
                        onClick={(e) => e.preventDefault()}
                      >
                        {volunteerName}
                      </a>
                    </div>

                    {/* ================= ACCOUNT DROPDOWN ================= */}
                    {accountOpen && (
                      <div
                        className="account-dropdown js-dropdown"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Profile Information */}
                        <div className="info clearfix">
                          <div className="image">
                            <a href="/profile">
                              <img
                                src="/images/icon/avatar-01.jpg"
                                alt={volunteerName}
                              />
                            </a>
                          </div>

                          <div className="content">
                            <h5 className="name">
                              <a href="/profile">{volunteerName}</a>
                            </h5>

                            <span className="email">{volunteerEmail}</span>
                          </div>
                        </div>

                        {/* ================= DROPDOWN BODY ================= */}
                        <div className="account-dropdown__body">
                          <div className="account-dropdown__item">
                            <a href="/profile">
                              <i className="fa-solid fa-user"></i>
                              Account
                            </a>
                          </div>
                        </div>

                        {/* ================= LOGOUT ================= */}
                        <div className="account-dropdown__footer">
                          <a href="/logout">
                            <i className="fa-solid fa-power-off"></i>
                            Logout
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default Header;
