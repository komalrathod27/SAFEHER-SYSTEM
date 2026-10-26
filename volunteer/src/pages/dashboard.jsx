import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import { io } from "socket.io-client";

function Dashboard() {
  const navigate = useNavigate();
  const [activeSOSList, setActiveSOSList] = useState([]);
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    const fetchSOS = () => {
      Axios.get("http://localhost:3000/api/sos/all")
        .then((res) => {
          if (res.data && res.data.requests) {
            const list = res.data.requests.slice(0, 5).map((r) => {
              const dt = new Date(r.createdAt);
              return {
                id: `SOS-${r._id.slice(-4).toUpperCase()}`,
                location: r.womanAddress || "GPS Coordinates",
                time: dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                status: r.status,
              };
            });
            setActiveSOSList(list);
            setActiveCount(res.data.pendingCount + res.data.activeCount);
          }
        })
        .catch(() => {});
    };

    fetchSOS();

    // Socket.IO real-time listener (Replaced Polling)
    const socket = io("http://localhost:3000", {
      transports: ["polling", "websocket"],
    });

    socket.on("connect", () => {
      socket.emit("join_volunteers");
    });

    socket.on("new_sos_alert", fetchSOS);
    socket.on("sos_updated", fetchSOS);
    socket.on("sos_approved", fetchSOS);
    socket.on("sos_resolved", fetchSOS);
    socket.on("sos_cancelled", fetchSOS);

    return () => {
      socket.disconnect();
    };
  }, []);

  const stats = [
    {
      icon: "🚨",
      title: "Active SOS",
      value: activeCount > 0 ? `${activeCount}` : "0",
      description: "Requests needing attention",
      type: "danger",
    },
    {
      icon: "✓",
      title: "Resolved",
      value: "14",
      description: "Emergencies successfully resolved",
      type: "success",
    },
    {
      icon: "⚡",
      title: "Avg. Response",
      value: "3.4 min",
      description: "Your average response time",
      type: "warning",
    },
    {
      icon: "🛡️",
      title: "Trust Score",
      value: "92/100",
      description: "Excellent volunteer rating",
      type: "primary",
    },
  ];

  const activeSOS = activeSOSList.length > 0 ? activeSOSList : [
    {
      id: "SOS-024",
      location: "Karelibaug, Vadodara",
      time: "2 min ago",
      status: "Pending",
    },
    {
      id: "SOS-023",
      location: "Alkapuri, Vadodara",
      time: "5 min ago",
      status: "Accepted",
    },
  ];

  const recentActivities = [
    {
      icon: "🚨",
      title: "Responded to SOS Request",
      description: "SOS-024 • Emergency assistance",
      time: "10:42 AM",
    },
    {
      icon: "✓",
      title: "SOS Request Resolved",
      description: "SOS-021 • Assistance completed",
      time: "09:55 AM",
    },
    {
      icon: "🤝",
      title: "Joined Volunteer Coordination",
      description: "Community safety activity",
      time: "Yesterday",
    },
    {
      icon: "🏅",
      title: 'Earned "Fast Responder" badge',
      description: "Achievement unlocked",
      time: "28 Aug",
    },
  ];

  const badges = [
    {
      icon: "⚡",
      name: "Fast Responder",
    },
    {
      icon: "🛡️",
      name: "Trusted Helper",
    },
    {
      icon: "⭐",
      name: "Community Star",
    },
  ];

  // =========================================
  // STYLES
  // =========================================

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f6f8f7",
      padding: "30px",
      fontFamily: "Arial, sans-serif",
      boxSizing: "border-box",
    },

    // =========================================
    // HEADER
    // =========================================

    header: {
      marginBottom: "25px",
    },

    title: {
      margin: 0,
      fontSize: "32px",
      fontWeight: "700",
      color: "#123c45",
      lineHeight: "1.3",
    },

    subtitle: {
      margin: "8px 0 0",
      fontSize: "15px",
      color: "#718096",
      lineHeight: "1.6",
    },

    // ============STAT CARDS===============

    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "18px",
      marginBottom: "25px",
    },

    statCard: {
      background: "#ffffff",
      borderRadius: "10px",
      border: "1px solid #e4ebe8",
      padding: "20px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
    },

    statTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "15px",
    },

    statIcon: {
      width: "42px",
      height: "42px",
      borderRadius: "9px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "19px",
      background: "#eef7f3",
    },

    statLabel: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#7b8794",
      marginBottom: "5px",
    },

    statValue: {
      fontSize: "29px",
      fontWeight: "700",
      color: "#173f48",
      marginBottom: "5px",
    },

    statDescription: {
      margin: 0,
      fontSize: "12px",
      color: "#9aa5ad",
    },

    // =========================================
    // MAIN GRID
    // =========================================

    mainGrid: {
      display: "grid",
      gridTemplateColumns: "1.5fr 1fr",
      gap: "20px",
      marginBottom: "20px",
    },

    card: {
      background: "#ffffff",
      border: "1px solid #e4ebe8",
      borderRadius: "10px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
      overflow: "hidden",
    },

    cardHeader: {
      padding: "20px",
      borderBottom: "1px solid #edf1ef",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },

    cardTitle: {
      margin: 0,
      fontSize: "18px",
      fontWeight: "700",
      color: "#173f48",
    },

    viewAll: {
      border: "none",
      background: "transparent",
      color: "#159b72",
      fontSize: "13px",
      fontWeight: "600",
      cursor: "pointer",
      padding: "3px 0",
    },

    // =========================================
    // SOS REQUESTS
    // =========================================

    sosItem: {
      padding: "17px 20px",
      borderBottom: "1px solid #f0f2f1",
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },

    sosIcon: {
      width: "39px",
      height: "39px",
      borderRadius: "8px",
      background: "#fff1f1",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "18px",
      flexShrink: 0,
    },

    sosInfo: {
      flex: 1,
    },

    sosId: {
      margin: 0,
      fontSize: "13px",
      fontWeight: "700",
      color: "#273f46",
    },

    sosLocation: {
      margin: "5x 0 0",
      fontSize: "11px",
      color: "#8b969d",
    },

    sosTime: {
      fontSize: "10px",
      color: "#9aa5ad",
      marginBottom: "6px",
      textAlign: "right",
    },

    status: {
      padding: "5px 9px",
      borderRadius: "15px",
      fontSize: "10px",
      fontWeight: "600",
      display: "inline-block",
    },

    pending: {
      background: "#fff7e6",
      color: "#c98200",
    },

    accepted: {
      background: "#e8f7f0",
      color: "#16845f",
    },

    // =========================================
    // PERFORMANCE
    // =========================================

    performanceBody: {
      padding: "22px",
    },

    trustRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "9px",
    },

    trustLabel: {
      fontSize: "12px",
      color: "#718096",
      fontWeight: "600",
    },

    trustValue: {
      fontSize: "15px",
      fontWeight: "700",
      color: "#159b72",
    },

    progressBackground: {
      height: "8px",
      background: "#e9efed",
      borderRadius: "20px",
      overflow: "hidden",
      marginBottom: "25px",
    },

    progress: {
      height: "100%",
      width: "92%",
      background: "#159b72",
      borderRadius: "20px",
    },

    performanceItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "13px 0",
      borderTop: "1px solid #edf1ef",
    },

    performanceLabel: {
      fontSize: "12px",
      color: "#718096",
      fontWeight: "550",
    },

    performanceValue: {
      fontSize: "13px",
      fontWeight: "700",
      color: "#263f46",
    },

    // =========================================
    // RECENT ACTIVITY
    // =========================================

    activityBody: {
      padding: "5px 20px",
    },

    activityItem: {
      display: "flex",
      gap: "14px",
      padding: "15px 0",
      borderBottom: "1px solid #f0f2f1",
    },

    activityIcon: {
      width: "39px",
      height: "39px",
      borderRadius: "50%",
      background: "#eef7f3",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "18px",
      flexShrink: 0,
    },

    activityInfo: {
      flex: 1,
    },

    activityTitle: {
      margin: 0,
      fontSize: "12px",
      fontWeight: "700",
      color: "#344b52",
    },

    activityDescription: {
      margin: "5px 0 0",
      fontSize: "11px",
      color: "#8b969d",
    },

    activityTime: {
      fontSize: "10px",
      color: "#a0a9ae",
      whiteSpace: "nowrap",
    },

    // =========================================
    // BOTTOM GRID
    // =========================================

    bottomGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "20px",
    },

    // =========================================
    // BADGES
    // =========================================

    badgeBody: {
      padding: "20px",
      display: "flex",
      gap: "15px",
    },

    badge: {
      flex: 1,
      textAlign: "center",
      padding: "15px 8px",
      borderRadius: "8px",
      background: "#f8faf9",
      border: "1px solid #edf1ef",
    },

    badgeIcon: {
      fontSize: "33px",
      marginBottom: "6px",
    },

    badgeName: {
      fontSize: "12.5px",
      fontWeight: "600",
      color: "#53666d",
      lineHeight: "1.3",
    },

    // =========================================
    // QUICK ACTIONS
    // =========================================

    actionsBody: {
      padding: "20px",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "12px",
    },

    actionButton: {
      border: "1px solid #dce8e3",
      background: "#ffffff",
      borderRadius: "7px",
      padding: "13px",
      textAlign: "left",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "9px",
      color: "#304c54",
      fontSize: "12px",
      fontWeight: "550",
    },

    actionIcon: {
      fontSize: "20px",
    },
  };

  return (
    <div style={styles.page}>
      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <div style={styles.header}>
        <h1 style={styles.title}>Welcome back, Volunteer! 👋</h1>

        <p style={styles.subtitle}>
          Here's an overview of your SafeHer volunteer activity and community
          contribution.
        </p>
      </div>

      {/* =========================================
          STAT CARDS
      ========================================= */}

      <div style={styles.statsGrid}>
        {stats.map((item, index) => (
          <div key={index} style={styles.statCard}>
            <div style={styles.statTop}>
              <div style={styles.statIcon}>{item.icon}</div>
            </div>

            <div style={styles.statLabel}>{item.title}</div>

            <div style={styles.statValue}>{item.value}</div>

            <p style={styles.statDescription}>{item.description}</p>
          </div>
        ))}
      </div>

      {/* =========================================
          SOS + PERFORMANCE
      ========================================= */}

      <div style={styles.mainGrid}>
        {/* ACTIVE SOS */}

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Active SOS Requests</h2>

            <button
              style={styles.viewAll}
              onClick={() => navigate("/sosrequests")}
            >
              View All →
            </button>
          </div>

          {activeSOS.map((sos) => (
            <div
              key={sos.id}
              style={styles.sosItem}
              onClick={() => navigate("/sosrequests")}
            >
              <div style={styles.sosIcon}>🚨</div>

              <div style={styles.sosInfo}>
                <p style={styles.sosId}>{sos.id}</p>

                <p style={styles.sosLocation}>📍 {sos.location}</p>
              </div>

              <div>
                <div style={styles.sosTime}>{sos.time}</div>

                <span
                  style={{
                    ...styles.status,
                    ...(sos.status === "Pending"
                      ? styles.pending
                      : styles.accepted),
                  }}
                >
                  {sos.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* PERFORMANCE */}

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>My Performance</h2>

            <button
              style={styles.viewAll}
              onClick={() => navigate("/trustscore")}
            >
              View Details →
            </button>
          </div>

          <div style={styles.performanceBody}>
            <div style={styles.trustRow}>
              <span style={styles.trustLabel}>Trust Score</span>

              <span style={styles.trustValue}>92 / 100</span>
            </div>

            <div style={styles.progressBackground}>
              <div style={styles.progress} />
            </div>

            <div style={styles.performanceItem}>
              <span style={styles.performanceLabel}>SOS Responses</span>

              <span style={styles.performanceValue}>18</span>
            </div>

            <div style={styles.performanceItem}>
              <span style={styles.performanceLabel}>
                Successful Resolutions
              </span>

              <span style={styles.performanceValue}>14</span>
            </div>

            <div style={styles.performanceItem}>
              <span style={styles.performanceLabel}>Average Response Time</span>

              <span style={styles.performanceValue}>3.4 min</span>
            </div>

            <div style={styles.performanceItem}>
              <span style={styles.performanceLabel}>User Rating</span>

              <span style={styles.performanceValue}>⭐ 4.7 / 5</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          RECENT ACTIVITY
      ========================================= */}

      <div
        style={{
          ...styles.card,
          marginBottom: "20px",
        }}
      >
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Recent Activity</h2>

          <button style={styles.viewAll} onClick={() => navigate("/history")}>
            Activity History →
          </button>
        </div>

        <div style={styles.activityBody}>
          {recentActivities.map((activity, index) => (
            <div key={index} style={styles.activityItem}>
              <div style={styles.activityIcon}>{activity.icon}</div>

              <div style={styles.activityInfo}>
                <p style={styles.activityTitle}>{activity.title}</p>

                <p style={styles.activityDescription}>{activity.description}</p>
              </div>

              <span style={styles.activityTime}>{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================
          BADGES + QUICK ACTIONS
      ========================================= */}

      <div style={styles.bottomGrid}>
        {/* BADGES */}

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>My Badges</h2>

            <button style={styles.viewAll} onClick={() => navigate("/badges")}>
              View All →
            </button>
          </div>

          <div style={styles.badgeBody}>
            {badges.map((badge, index) => (
              <div key={index} style={styles.badge}>
                <div style={styles.badgeIcon}>{badge.icon}</div>

                <div style={styles.badgeName}>{badge.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* QUICK ACTIONS */}

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Quick Actions</h2>
          </div>

          <div style={styles.actionsBody}>
            <button
              style={styles.actionButton}
              onClick={() => navigate("/sosrequests")}
            >
              <span style={styles.actionIcon}>🚨</span>
              SOS Requests
            </button>

            <button
              style={styles.actionButton}
              onClick={() => navigate("/coordination")}
            >
              <span style={styles.actionIcon}>🤝</span>
              Volunteer Coordination
            </button>

            <button
              style={styles.actionButton}
              onClick={() => navigate("/responses")}
            >
              <span style={styles.actionIcon}>📋</span>
              My Responses
            </button>

            <button
              style={styles.actionButton}
              onClick={() => navigate("/trustscore")}
            >
              <span style={styles.actionIcon}>🛡️</span>
              Trust Score
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
