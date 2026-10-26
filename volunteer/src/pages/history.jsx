import React, { useState } from "react";

function History() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [selectedActivity, setSelectedActivity] = useState(null);

  // =========================================
  // DUMMY ACTIVITY DATA
  // =========================================
  const activities = [
    {
      id: 1,
      dateGroup: "Today",
      type: "SOS Response",
      icon: "🚨",
      title: "Responded to SOS Request",
      description:
        "You responded to an emergency SOS request and started assisting the user.",
      reference: "SOS-001",
      location: "Alkapuri, Vadodara",
      time: "08:37 PM",
      status: "Completed",
      details:
        "You accepted the SOS request and started the emergency response. The user's live location was shared during the response.",
    },

    {
      id: 2,
      dateGroup: "Today",
      type: "Live Location",
      icon: "📍",
      title: "Live Location Sharing Started",
      description:
        "Live location sharing was started for an active SOS response.",
      reference: "SOS-001",
      location: "Alkapuri, Vadodara",
      time: "08:36 PM",
      status: "Completed",
      details:
        "Your location was shared with the woman user during the active emergency response.",
    },

    {
      id: 3,
      dateGroup: "Today",
      type: "SOS Response",
      icon: "🤝",
      title: "Accepted SOS Request",
      description: "You accepted an emergency request from a nearby user.",
      reference: "SOS-001",
      location: "Alkapuri, Vadodara",
      time: "08:35 PM",
      status: "Completed",
      details:
        "The SOS request was accepted successfully and added to your active emergency responses.",
    },

    {
      id: 4,
      dateGroup: "Yesterday",
      type: "Incident Report",
      icon: "📄",
      title: "Viewed Incident Report",
      description:
        "You viewed an incident report approved by SafeHer administration.",
      reference: "INC-002",
      location: "Gotri, Vadodara",
      time: "06:20 PM",
      status: "Viewed",
      details:
        "You opened the approved incident report to review the incident information and community safety details.",
    },

    {
      id: 5,
      dateGroup: "Yesterday",
      type: "Coordination",
      icon: "👥",
      title: "Volunteer Coordination Activity",
      description:
        "You participated in coordination with another SafeHer volunteer.",
      reference: "COORD-004",
      location: "Gotri, Vadodara",
      time: "05:45 PM",
      status: "Completed",
      details:
        "You coordinated with another volunteer regarding community safety assistance.",
    },

    {
      id: 6,
      dateGroup: "Yesterday",
      type: "Feedback",
      icon: "⭐",
      title: "User Response Rating Received",
      description:
        "You received a response rating from a woman user after an emergency assistance request.",
      reference: "SOS-004",
      location: "Manjalpur, Vadodara",
      time: "03:30 PM",
      status: "Received",
      details:
        "A user submitted feedback after the emergency response was successfully completed.",
    },

    {
      id: 7,
      dateGroup: "25 Aug 2026",
      type: "SOS Response",
      icon: "🚨",
      title: "Responded to SOS Request",
      description:
        "You responded to an emergency request and assisted the user.",
      reference: "SOS-003",
      location: "Fatehgunj, Vadodara",
      time: "09:13 PM",
      status: "Completed",
      details:
        "You accepted the emergency request and responded to the reported location.",
    },

    {
      id: 8,
      dateGroup: "25 Aug 2026",
      type: "Profile",
      icon: "👤",
      title: "Volunteer Profile Updated",
      description: "Your volunteer profile information was updated.",
      reference: "PROFILE",
      location: "SafeHer",
      time: "02:10 PM",
      status: "Updated",
      details:
        "Your volunteer profile information was successfully updated in the SafeHer system.",
    },

    {
      id: 9,
      dateGroup: "24 Aug 2026",
      type: "Badge",
      icon: "🏅",
      title: "Badge Earned",
      description:
        "You earned the Fast Responder badge for maintaining a quick response time.",
      reference: "BADGE-002",
      location: "SafeHer",
      time: "11:30 AM",
      status: "Earned",
      details:
        "You earned this badge based on your emergency response performance and quick response time.",
    },
  ];

  // =========================================
  // FILTER ACTIVITIES
  // =========================================
  const filteredActivities = activities.filter((activity) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      activity.title.toLowerCase().includes(search) ||
      activity.description.toLowerCase().includes(search) ||
      activity.reference.toLowerCase().includes(search) ||
      activity.location.toLowerCase().includes(search);

    const matchesType = typeFilter === "All" || activity.type === typeFilter;

    const matchesDate =
      dateFilter === "All" || activity.dateGroup === dateFilter;

    return matchesSearch && matchesType && matchesDate;
  });

  // =========================================
  // GROUP FILTERED ACTIVITIES BY DATE
  // =========================================
  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    if (!groups[activity.dateGroup]) {
      groups[activity.dateGroup] = [];
    }

    groups[activity.dateGroup].push(activity);

    return groups;
  }, {});

  // =========================================
  // ACTIVITY COLOR
  // =========================================
  const getActivityColor = (type) => {
    switch (type) {
      case "SOS Response":
        return {
          background: "#fee2e2",
          color: "#dc2626",
          border: "#fecaca",
        };

      case "Live Location":
        return {
          background: "#dbeafe",
          color: "#2563eb",
          border: "#bfdbfe",
        };

      case "Incident Report":
        return {
          background: "#fef3c7",
          color: "#d97706",
          border: "#fde68a",
        };

      case "Coordination":
        return {
          background: "#ede9fe",
          color: "#7c3aed",
          border: "#ddd6fe",
        };

      case "Feedback":
        return {
          background: "#fef3c7",
          color: "#b45309",
          border: "#fde68a",
        };

      case "Profile":
        return {
          background: "#e0f2fe",
          color: "#0284c7",
          border: "#bae6fd",
        };

      case "Badge":
        return {
          background: "#f3e8ff",
          color: "#9333ea",
          border: "#e9d5ff",
        };

      default:
        return {
          background: "#f3f4f6",
          color: "#6b7280",
          border: "#e5e7eb",
        };
    }
  };

  // =========================================
  // STYLES
  // =========================================
  const styles = {
    page: {
      padding: "30px",
      background: "#f8f9fc",
      minHeight: "100vh",
      fontFamily: "Arial, sans-serif",
    },

    header: {
      marginBottom: "25px",
    },

    title: {
      margin: 0,
      fontSize: "28px",
      fontWeight: "700",
      color: "#1f2937",
    },

    subtitle: {
      marginTop: "7px",
      marginBottom: 0,
      fontSize: "14px",
      color: "#6b7280",
    },

    // =========================================
    // FILTER BAR
    // =========================================
    filterBar: {
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "10px",
      padding: "16px",
      marginBottom: "30px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    },

    search: {
      flex: 1,
      padding: "11px 14px",
      border: "1px solid #d1d5db",
      borderRadius: "6px",
      outline: "none",
      fontSize: "12px",
    },

    select: {
      padding: "11px 14px",
      border: "1px solid #d1d5db",
      borderRadius: "6px",
      background: "#ffffff",
      color: "#374151",
      fontSize: "12px",
      cursor: "pointer",
      outline: "none",
    },

    // =========================================
    // TIMELINE
    // =========================================
    timelineContainer: {
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "10px",
      padding: "30px 35px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    },

    dateSection: {
      marginBottom: "35px",
    },

    dateTitle: {
      display: "inline-block",
      background: "#f3f4f6",
      padding: "6px 13px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: "700",
      color: "#4b5563",
      marginBottom: "22px",
    },

    timeline: {
      position: "relative",
      marginLeft: "10px",
    },

    verticalLine: {
      position: "absolute",
      left: "19px",
      top: "20px",
      bottom: "20px",
      width: "1px",
      background: "#e5e7eb",
    },

    activityItem: {
      position: "relative",
      display: "flex",
      gap: "20px",
      marginBottom: "28px",
    },

    activityIconWrapper: {
      position: "relative",
      zIndex: 2,
      width: "40px",
      minWidth: "40px",
      height: "40px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "17px",
      border: "4px solid #ffffff",
    },

    activityContent: {
      flex: 1,
      paddingBottom: "5px",
    },

    activityTop: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "15px",
      marginBottom: "6px",
    },

    activityTitle: {
      margin: 0,
      fontSize: "13px",
      fontWeight: "700",
      color: "#1f2937",
    },

    activityTime: {
      fontSize: "10px",
      color: "#9ca3af",
      whiteSpace: "nowrap",
    },

    activityDescription: {
      margin: "0 0 9px",
      fontSize: "11px",
      lineHeight: "1.6",
      color: "#6b7280",
    },

    activityMeta: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      flexWrap: "wrap",
    },

    reference: {
      fontSize: "9px",
      background: "#f3f4f6",
      color: "#6b7280",
      padding: "4px 7px",
      borderRadius: "4px",
    },

    location: {
      fontSize: "9px",
      color: "#9ca3af",
    },

    viewButton: {
      marginLeft: "auto",
      border: "none",
      background: "#eef2ff",
      color: "#4f46e5",
      padding: "6px 10px",
      borderRadius: "5px",
      fontSize: "9px",
      fontWeight: "600",
      cursor: "pointer",
    },

    empty: {
      textAlign: "center",
      padding: "60px 20px",
      color: "#9ca3af",
    },

    // =========================================
    // MODAL
    // =========================================
    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(17, 24, 39, 0.58)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "25px",
    },

    modal: {
      width: "100%",
      maxWidth: "560px",
      background: "#ffffff",
      borderRadius: "10px",
      overflow: "hidden",
      boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    },

    modalHeader: {
      padding: "20px 24px",
      borderBottom: "1px solid #e5e7eb",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },

    modalHeaderLeft: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },

    modalIcon: {
      width: "40px",
      height: "40px",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "18px",
    },

    modalTitle: {
      margin: 0,
      fontSize: "16px",
      fontWeight: "700",
      color: "#1f2937",
    },

    modalSubtitle: {
      margin: "4px 0 0",
      fontSize: "10px",
      color: "#9ca3af",
    },

    closeButton: {
      border: "none",
      background: "#f3f4f6",
      width: "30px",
      height: "30px",
      borderRadius: "50%",
      cursor: "pointer",
      fontSize: "16px",
      color: "#6b7280",
    },

    modalBody: {
      padding: "25px",
    },

    detailRow: {
      display: "flex",
      padding: "12px 0",
      borderBottom: "1px solid #f1f2f4",
    },

    detailLabel: {
      width: "130px",
      fontSize: "10px",
      color: "#9ca3af",
      textTransform: "uppercase",
    },

    detailValue: {
      flex: 1,
      fontSize: "11px",
      fontWeight: "600",
      color: "#374151",
    },

    detailsBox: {
      marginTop: "20px",
      background: "#f9fafb",
      border: "1px solid #e5e7eb",
      borderRadius: "7px",
      padding: "15px",
    },

    detailsLabel: {
      fontSize: "10px",
      fontWeight: "700",
      color: "#4f46e5",
      marginBottom: "7px",
      textTransform: "uppercase",
    },

    detailsText: {
      margin: 0,
      fontSize: "11px",
      color: "#6b7280",
      lineHeight: "1.6",
    },

    modalFooter: {
      padding: "15px 24px",
      background: "#f9fafb",
      borderTop: "1px solid #e5e7eb",
      display: "flex",
      justifyContent: "flex-end",
    },

    closeFooter: {
      border: "1px solid #d1d5db",
      background: "#ffffff",
      color: "#374151",
      padding: "8px 18px",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "11px",
      fontWeight: "600",
    },
  };

  return (
    <div style={styles.page}>
      {/* =========================================
          PAGE HEADER
      ========================================= */}
      <div style={styles.header}>
        <h1 style={styles.title}>Activity History</h1>

        <p style={styles.subtitle}>
          View your complete activity and participation history on SafeHer.
        </p>
      </div>

      {/* =========================================
          FILTER BAR
      ========================================= */}
      <div style={styles.filterBar}>
        <input
          type="text"
          placeholder="🔎 Search activity..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.search}
        />

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={styles.select}
        >
          <option value="All">All Activity</option>

          <option value="SOS Response">SOS Response</option>

          <option value="Live Location">Live Location</option>

          <option value="Incident Report">Incident Report</option>

          <option value="Coordination">Coordination</option>

          <option value="Feedback">Feedback</option>

          <option value="Profile">Profile</option>

          <option value="Badge">Badge</option>
        </select>

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          style={styles.select}
        >
          <option value="All">All Time</option>

          <option value="Today">Today</option>

          <option value="Yesterday">Yesterday</option>

          <option value="Last 7 days">Last 7 days</option>

          <option value="Last 30 days">Last 30 days</option>
          <option value="This year">This year</option>
        </select>
      </div>

      {/* =========================================
          TIMELINE
      ========================================= */}
      <div style={styles.timelineContainer}>
        {Object.keys(groupedActivities).length > 0 ? (
          Object.entries(groupedActivities).map(([date, dateActivities]) => (
            <div key={date} style={styles.dateSection}>
              {/* DATE */}
              <div style={styles.dateTitle}>{date}</div>

              <div style={styles.timeline}>
                {/* VERTICAL TIMELINE LINE */}
                <div style={styles.verticalLine} />

                {dateActivities.map((activity) => {
                  const activityColor = getActivityColor(activity.type);

                  return (
                    <div key={activity.id} style={styles.activityItem}>
                      {/* ICON */}
                      <div
                        style={{
                          ...styles.activityIconWrapper,
                          background: activityColor.background,
                          color: activityColor.color,
                        }}
                      >
                        {activity.icon}
                      </div>

                      {/* CONTENT */}
                      <div style={styles.activityContent}>
                        <div style={styles.activityTop}>
                          <h3 style={styles.activityTitle}>{activity.title}</h3>

                          <span style={styles.activityTime}>
                            {activity.time}
                          </span>
                        </div>

                        <p style={styles.activityDescription}>
                          {activity.description}
                        </p>

                        <div style={styles.activityMeta}>
                          <span style={styles.reference}>
                            {activity.reference}
                          </span>

                          <span style={styles.location}>
                            📍 {activity.location}
                          </span>

                          <button
                            style={styles.viewButton}
                            onClick={() => setSelectedActivity(activity)}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div style={styles.empty}>
            <div
              style={{
                fontSize: "35px",
                marginBottom: "10px",
              }}
            >
              🕒
            </div>

            <div
              style={{
                fontSize: "13px",
                fontWeight: "600",
                marginBottom: "5px",
                color: "#6b7280",
              }}
            >
              No activities found
            </div>

            <div style={{ fontSize: "11px" }}>
              Try changing your search or filters.
            </div>
          </div>
        )}
      </div>

      {/* =========================================
          ACTIVITY DETAILS MODAL
      ========================================= */}
      {selectedActivity && (
        <div style={styles.overlay} onClick={() => setSelectedActivity(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            {/* MODAL HEADER */}
            <div style={styles.modalHeader}>
              <div style={styles.modalHeaderLeft}>
                <div
                  style={{
                    ...styles.modalIcon,
                    background: getActivityColor(selectedActivity.type)
                      .background,
                  }}
                >
                  {selectedActivity.icon}
                </div>

                <div>
                  <h2 style={styles.modalTitle}>{selectedActivity.title}</h2>

                  <p style={styles.modalSubtitle}>Activity Details</p>
                </div>
              </div>

              <button
                style={styles.closeButton}
                onClick={() => setSelectedActivity(null)}
              >
                ×
              </button>
            </div>

            {/* MODAL BODY */}
            <div style={styles.modalBody}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Activity Type</span>

                <span style={styles.detailValue}>{selectedActivity.type}</span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Reference</span>

                <span style={styles.detailValue}>
                  {selectedActivity.reference}
                </span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Date</span>

                <span style={styles.detailValue}>
                  {selectedActivity.dateGroup}
                </span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Time</span>

                <span style={styles.detailValue}>{selectedActivity.time}</span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Location</span>

                <span style={styles.detailValue}>
                  {selectedActivity.location}
                </span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Status</span>

                <span
                  style={{
                    ...styles.detailValue,
                    color: "#15803d",
                  }}
                >
                  ✓ {selectedActivity.status}
                </span>
              </div>

              {/* DESCRIPTION */}
              <div style={styles.detailsBox}>
                <div style={styles.detailsLabel}>Activity Description</div>

                <p style={styles.detailsText}>{selectedActivity.details}</p>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div style={styles.modalFooter}>
              <button
                style={styles.closeFooter}
                onClick={() => setSelectedActivity(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default History;
