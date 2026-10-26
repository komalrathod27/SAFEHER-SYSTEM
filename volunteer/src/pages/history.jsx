// import React, { useState } from "react";

// function History() {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [typeFilter, setTypeFilter] = useState("All");
//   const [dateFilter, setDateFilter] = useState("All");
//   const [selectedActivity, setSelectedActivity] = useState(null);

//   // =========================================
//   // DUMMY ACTIVITY DATA
//   // =========================================
//   const activities = [
//     {
//       id: 1,
//       dateGroup: "Today",
//       type: "SOS Response",
//       icon: "🚨",
//       title: "Responded to SOS Request",
//       description:
//         "You responded to an emergency SOS request and started assisting the user.",
//       reference: "SOS-001",
//       location: "Alkapuri, Vadodara",
//       time: "08:37 PM",
//       status: "Completed",
//       details:
//         "You accepted the SOS request and started the emergency response. The user's live location was shared during the response.",
//     },

//     {
//       id: 2,
//       dateGroup: "Today",
//       type: "Live Location",
//       icon: "📍",
//       title: "Live Location Sharing Started",
//       description:
//         "Live location sharing was started for an active SOS response.",
//       reference: "SOS-001",
//       location: "Alkapuri, Vadodara",
//       time: "08:36 PM",
//       status: "Completed",
//       details:
//         "Your location was shared with the woman user during the active emergency response.",
//     },

//     {
//       id: 3,
//       dateGroup: "Today",
//       type: "SOS Response",
//       icon: "🤝",
//       title: "Accepted SOS Request",
//       description: "You accepted an emergency request from a nearby user.",
//       reference: "SOS-001",
//       location: "Alkapuri, Vadodara",
//       time: "08:35 PM",
//       status: "Completed",
//       details:
//         "The SOS request was accepted successfully and added to your active emergency responses.",
//     },

//     {
//       id: 4,
//       dateGroup: "Yesterday",
//       type: "Incident Report",
//       icon: "📄",
//       title: "Viewed Incident Report",
//       description:
//         "You viewed an incident report approved by SafeHer administration.",
//       reference: "INC-002",
//       location: "Gotri, Vadodara",
//       time: "06:20 PM",
//       status: "Viewed",
//       details:
//         "You opened the approved incident report to review the incident information and community safety details.",
//     },

//     {
//       id: 5,
//       dateGroup: "Yesterday",
//       type: "Coordination",
//       icon: "👥",
//       title: "Volunteer Coordination Activity",
//       description:
//         "You participated in coordination with another SafeHer volunteer.",
//       reference: "COORD-004",
//       location: "Gotri, Vadodara",
//       time: "05:45 PM",
//       status: "Completed",
//       details:
//         "You coordinated with another volunteer regarding community safety assistance.",
//     },

//     {
//       id: 6,
//       dateGroup: "Yesterday",
//       type: "Feedback",
//       icon: "⭐",
//       title: "User Response Rating Received",
//       description:
//         "You received a response rating from a woman user after an emergency assistance request.",
//       reference: "SOS-004",
//       location: "Manjalpur, Vadodara",
//       time: "03:30 PM",
//       status: "Received",
//       details:
//         "A user submitted feedback after the emergency response was successfully completed.",
//     },

//     {
//       id: 7,
//       dateGroup: "25 Aug 2026",
//       type: "SOS Response",
//       icon: "🚨",
//       title: "Responded to SOS Request",
//       description:
//         "You responded to an emergency request and assisted the user.",
//       reference: "SOS-003",
//       location: "Fatehgunj, Vadodara",
//       time: "09:13 PM",
//       status: "Completed",
//       details:
//         "You accepted the emergency request and responded to the reported location.",
//     },

//     {
//       id: 8,
//       dateGroup: "25 Aug 2026",
//       type: "Profile",
//       icon: "👤",
//       title: "Volunteer Profile Updated",
//       description: "Your volunteer profile information was updated.",
//       reference: "PROFILE",
//       location: "SafeHer",
//       time: "02:10 PM",
//       status: "Updated",
//       details:
//         "Your volunteer profile information was successfully updated in the SafeHer system.",
//     },

//     {
//       id: 9,
//       dateGroup: "24 Aug 2026",
//       type: "Badge",
//       icon: "🏅",
//       title: "Badge Earned",
//       description:
//         "You earned the Fast Responder badge for maintaining a quick response time.",
//       reference: "BADGE-002",
//       location: "SafeHer",
//       time: "11:30 AM",
//       status: "Earned",
//       details:
//         "You earned this badge based on your emergency response performance and quick response time.",
//     },
//   ];

//   // =========================================
//   // FILTER ACTIVITIES
//   // =========================================
//   const filteredActivities = activities.filter((activity) => {
//     const search = searchTerm.toLowerCase();

//     const matchesSearch =
//       activity.title.toLowerCase().includes(search) ||
//       activity.description.toLowerCase().includes(search) ||
//       activity.reference.toLowerCase().includes(search) ||
//       activity.location.toLowerCase().includes(search);

//     const matchesType = typeFilter === "All" || activity.type === typeFilter;

//     const matchesDate =
//       dateFilter === "All" || activity.dateGroup === dateFilter;

//     return matchesSearch && matchesType && matchesDate;
//   });

//   // =========================================
//   // GROUP FILTERED ACTIVITIES BY DATE
//   // =========================================
//   const groupedActivities = filteredActivities.reduce((groups, activity) => {
//     if (!groups[activity.dateGroup]) {
//       groups[activity.dateGroup] = [];
//     }

//     groups[activity.dateGroup].push(activity);

//     return groups;
//   }, {});

//   // =========================================
//   // ACTIVITY COLOR
//   // =========================================
//   const getActivityColor = (type) => {
//     switch (type) {
//       case "SOS Response":
//         return {
//           background: "#fee2e2",
//           color: "#dc2626",
//           border: "#fecaca",
//         };

//       case "Live Location":
//         return {
//           background: "#dbeafe",
//           color: "#2563eb",
//           border: "#bfdbfe",
//         };

//       case "Incident Report":
//         return {
//           background: "#fef3c7",
//           color: "#d97706",
//           border: "#fde68a",
//         };

//       case "Coordination":
//         return {
//           background: "#ede9fe",
//           color: "#7c3aed",
//           border: "#ddd6fe",
//         };

//       case "Feedback":
//         return {
//           background: "#fef3c7",
//           color: "#b45309",
//           border: "#fde68a",
//         };

//       case "Profile":
//         return {
//           background: "#e0f2fe",
//           color: "#0284c7",
//           border: "#bae6fd",
//         };

//       case "Badge":
//         return {
//           background: "#f3e8ff",
//           color: "#9333ea",
//           border: "#e9d5ff",
//         };

//       default:
//         return {
//           background: "#f3f4f6",
//           color: "#6b7280",
//           border: "#e5e7eb",
//         };
//     }
//   };

//   // =========================================
//   // STYLES
//   // =========================================
//   const styles = {
//     page: {
//       padding: "30px",
//       background: "#f8f9fc",
//       minHeight: "100vh",
//       fontFamily: "Arial, sans-serif",
//     },

//     header: {
//       marginBottom: "25px",
//     },

//     title: {
//       margin: 0,
//       fontSize: "28px",
//       fontWeight: "700",
//       color: "#1f2937",
//     },

//     subtitle: {
//       marginTop: "7px",
//       marginBottom: 0,
//       fontSize: "14px",
//       color: "#6b7280",
//     },

//     // =========================================
//     // FILTER BAR
//     // =========================================
//     filterBar: {
//       background: "#ffffff",
//       border: "1px solid #e5e7eb",
//       borderRadius: "10px",
//       padding: "16px",
//       marginBottom: "30px",
//       display: "flex",
//       alignItems: "center",
//       gap: "12px",
//       boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
//     },

//     search: {
//       flex: 1,
//       padding: "11px 14px",
//       border: "1px solid #d1d5db",
//       borderRadius: "6px",
//       outline: "none",
//       fontSize: "12px",
//     },

//     select: {
//       padding: "11px 14px",
//       border: "1px solid #d1d5db",
//       borderRadius: "6px",
//       background: "#ffffff",
//       color: "#374151",
//       fontSize: "12px",
//       cursor: "pointer",
//       outline: "none",
//     },

//     // =========================================
//     // TIMELINE
//     // =========================================
//     timelineContainer: {
//       background: "#ffffff",
//       border: "1px solid #e5e7eb",
//       borderRadius: "10px",
//       padding: "30px 35px",
//       boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
//     },

//     dateSection: {
//       marginBottom: "35px",
//     },

//     dateTitle: {
//       display: "inline-block",
//       background: "#f3f4f6",
//       padding: "6px 13px",
//       borderRadius: "20px",
//       fontSize: "11px",
//       fontWeight: "700",
//       color: "#4b5563",
//       marginBottom: "22px",
//     },

//     timeline: {
//       position: "relative",
//       marginLeft: "10px",
//     },

//     verticalLine: {
//       position: "absolute",
//       left: "19px",
//       top: "20px",
//       bottom: "20px",
//       width: "1px",
//       background: "#e5e7eb",
//     },

//     activityItem: {
//       position: "relative",
//       display: "flex",
//       gap: "20px",
//       marginBottom: "28px",
//     },

//     activityIconWrapper: {
//       position: "relative",
//       zIndex: 2,
//       width: "40px",
//       minWidth: "40px",
//       height: "40px",
//       borderRadius: "50%",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       fontSize: "17px",
//       border: "4px solid #ffffff",
//     },

//     activityContent: {
//       flex: 1,
//       paddingBottom: "5px",
//     },

//     activityTop: {
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "space-between",
//       gap: "15px",
//       marginBottom: "6px",
//     },

//     activityTitle: {
//       margin: 0,
//       fontSize: "13px",
//       fontWeight: "700",
//       color: "#1f2937",
//     },

//     activityTime: {
//       fontSize: "10px",
//       color: "#9ca3af",
//       whiteSpace: "nowrap",
//     },

//     activityDescription: {
//       margin: "0 0 9px",
//       fontSize: "11px",
//       lineHeight: "1.6",
//       color: "#6b7280",
//     },

//     activityMeta: {
//       display: "flex",
//       alignItems: "center",
//       gap: "12px",
//       flexWrap: "wrap",
//     },

//     reference: {
//       fontSize: "9px",
//       background: "#f3f4f6",
//       color: "#6b7280",
//       padding: "4px 7px",
//       borderRadius: "4px",
//     },

//     location: {
//       fontSize: "9px",
//       color: "#9ca3af",
//     },

//     viewButton: {
//       marginLeft: "auto",
//       border: "none",
//       background: "#eef2ff",
//       color: "#4f46e5",
//       padding: "6px 10px",
//       borderRadius: "5px",
//       fontSize: "9px",
//       fontWeight: "600",
//       cursor: "pointer",
//     },

//     empty: {
//       textAlign: "center",
//       padding: "60px 20px",
//       color: "#9ca3af",
//     },

//     // =========================================
//     // MODAL
//     // =========================================
//     overlay: {
//       position: "fixed",
//       inset: 0,
//       background: "rgba(17, 24, 39, 0.58)",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       zIndex: 1000,
//       padding: "25px",
//     },

//     modal: {
//       width: "100%",
//       maxWidth: "560px",
//       background: "#ffffff",
//       borderRadius: "10px",
//       overflow: "hidden",
//       boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
//     },

//     modalHeader: {
//       padding: "20px 24px",
//       borderBottom: "1px solid #e5e7eb",
//       display: "flex",
//       justifyContent: "space-between",
//       alignItems: "center",
//     },

//     modalHeaderLeft: {
//       display: "flex",
//       alignItems: "center",
//       gap: "12px",
//     },

//     modalIcon: {
//       width: "40px",
//       height: "40px",
//       borderRadius: "8px",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       fontSize: "18px",
//     },

//     modalTitle: {
//       margin: 0,
//       fontSize: "16px",
//       fontWeight: "700",
//       color: "#1f2937",
//     },

//     modalSubtitle: {
//       margin: "4px 0 0",
//       fontSize: "10px",
//       color: "#9ca3af",
//     },

//     closeButton: {
//       border: "none",
//       background: "#f3f4f6",
//       width: "30px",
//       height: "30px",
//       borderRadius: "50%",
//       cursor: "pointer",
//       fontSize: "16px",
//       color: "#6b7280",
//     },

//     modalBody: {
//       padding: "25px",
//     },

//     detailRow: {
//       display: "flex",
//       padding: "12px 0",
//       borderBottom: "1px solid #f1f2f4",
//     },

//     detailLabel: {
//       width: "130px",
//       fontSize: "10px",
//       color: "#9ca3af",
//       textTransform: "uppercase",
//     },

//     detailValue: {
//       flex: 1,
//       fontSize: "11px",
//       fontWeight: "600",
//       color: "#374151",
//     },

//     detailsBox: {
//       marginTop: "20px",
//       background: "#f9fafb",
//       border: "1px solid #e5e7eb",
//       borderRadius: "7px",
//       padding: "15px",
//     },

//     detailsLabel: {
//       fontSize: "10px",
//       fontWeight: "700",
//       color: "#4f46e5",
//       marginBottom: "7px",
//       textTransform: "uppercase",
//     },

//     detailsText: {
//       margin: 0,
//       fontSize: "11px",
//       color: "#6b7280",
//       lineHeight: "1.6",
//     },

//     modalFooter: {
//       padding: "15px 24px",
//       background: "#f9fafb",
//       borderTop: "1px solid #e5e7eb",
//       display: "flex",
//       justifyContent: "flex-end",
//     },

//     closeFooter: {
//       border: "1px solid #d1d5db",
//       background: "#ffffff",
//       color: "#374151",
//       padding: "8px 18px",
//       borderRadius: "6px",
//       cursor: "pointer",
//       fontSize: "11px",
//       fontWeight: "600",
//     },
//   };

//   return (
//     <div style={styles.page}>
//       {/* =========================================
//           PAGE HEADER
//       ========================================= */}
//       <div style={styles.header}>
//         <h1 style={styles.title}>Activity History</h1>

//         <p style={styles.subtitle}>
//           View your complete activity and participation history on SafeHer.
//         </p>
//       </div>

//       {/* =========================================
//           FILTER BAR
//       ========================================= */}
//       <div style={styles.filterBar}>
//         <input
//           type="text"
//           placeholder="🔎 Search activity..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           style={styles.search}
//         />

//         <select
//           value={typeFilter}
//           onChange={(e) => setTypeFilter(e.target.value)}
//           style={styles.select}
//         >
//           <option value="All">All Activity</option>

//           <option value="SOS Response">SOS Response</option>

//           <option value="Live Location">Live Location</option>

//           <option value="Incident Report">Incident Report</option>

//           <option value="Coordination">Coordination</option>

//           <option value="Feedback">Feedback</option>

//           <option value="Profile">Profile</option>

//           <option value="Badge">Badge</option>
//         </select>

//         <select
//           value={dateFilter}
//           onChange={(e) => setDateFilter(e.target.value)}
//           style={styles.select}
//         >
//           <option value="All">All Time</option>

//           <option value="Today">Today</option>

//           <option value="Yesterday">Yesterday</option>

//           <option value="Last 7 days">Last 7 days</option>

//           <option value="Last 30 days">Last 30 days</option>
//           <option value="This year">This year</option>
//         </select>
//       </div>

//       {/* =========================================
//           TIMELINE
//       ========================================= */}
//       <div style={styles.timelineContainer}>
//         {Object.keys(groupedActivities).length > 0 ? (
//           Object.entries(groupedActivities).map(([date, dateActivities]) => (
//             <div key={date} style={styles.dateSection}>
//               {/* DATE */}
//               <div style={styles.dateTitle}>{date}</div>

//               <div style={styles.timeline}>
//                 {/* VERTICAL TIMELINE LINE */}
//                 <div style={styles.verticalLine} />

//                 {dateActivities.map((activity) => {
//                   const activityColor = getActivityColor(activity.type);

//                   return (
//                     <div key={activity.id} style={styles.activityItem}>
//                       {/* ICON */}
//                       <div
//                         style={{
//                           ...styles.activityIconWrapper,
//                           background: activityColor.background,
//                           color: activityColor.color,
//                         }}
//                       >
//                         {activity.icon}
//                       </div>

//                       {/* CONTENT */}
//                       <div style={styles.activityContent}>
//                         <div style={styles.activityTop}>
//                           <h3 style={styles.activityTitle}>{activity.title}</h3>

//                           <span style={styles.activityTime}>
//                             {activity.time}
//                           </span>
//                         </div>

//                         <p style={styles.activityDescription}>
//                           {activity.description}
//                         </p>

//                         <div style={styles.activityMeta}>
//                           <span style={styles.reference}>
//                             {activity.reference}
//                           </span>

//                           <span style={styles.location}>
//                             📍 {activity.location}
//                           </span>

//                           <button
//                             style={styles.viewButton}
//                             onClick={() => setSelectedActivity(activity)}
//                           >
//                             View Details
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           ))
//         ) : (
//           <div style={styles.empty}>
//             <div
//               style={{
//                 fontSize: "35px",
//                 marginBottom: "10px",
//               }}
//             >
//               🕒
//             </div>

//             <div
//               style={{
//                 fontSize: "13px",
//                 fontWeight: "600",
//                 marginBottom: "5px",
//                 color: "#6b7280",
//               }}
//             >
//               No activities found
//             </div>

//             <div style={{ fontSize: "11px" }}>
//               Try changing your search or filters.
//             </div>
//           </div>
//         )}
//       </div>

//       {/* =========================================
//           ACTIVITY DETAILS MODAL
//       ========================================= */}
//       {selectedActivity && (
//         <div style={styles.overlay} onClick={() => setSelectedActivity(null)}>
//           <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
//             {/* MODAL HEADER */}
//             <div style={styles.modalHeader}>
//               <div style={styles.modalHeaderLeft}>
//                 <div
//                   style={{
//                     ...styles.modalIcon,
//                     background: getActivityColor(selectedActivity.type)
//                       .background,
//                   }}
//                 >
//                   {selectedActivity.icon}
//                 </div>

//                 <div>
//                   <h2 style={styles.modalTitle}>{selectedActivity.title}</h2>

//                   <p style={styles.modalSubtitle}>Activity Details</p>
//                 </div>
//               </div>

//               <button
//                 style={styles.closeButton}
//                 onClick={() => setSelectedActivity(null)}
//               >
//                 ×
//               </button>
//             </div>

//             {/* MODAL BODY */}
//             <div style={styles.modalBody}>
//               <div style={styles.detailRow}>
//                 <span style={styles.detailLabel}>Activity Type</span>

//                 <span style={styles.detailValue}>{selectedActivity.type}</span>
//               </div>

//               <div style={styles.detailRow}>
//                 <span style={styles.detailLabel}>Reference</span>

//                 <span style={styles.detailValue}>
//                   {selectedActivity.reference}
//                 </span>
//               </div>

//               <div style={styles.detailRow}>
//                 <span style={styles.detailLabel}>Date</span>

//                 <span style={styles.detailValue}>
//                   {selectedActivity.dateGroup}
//                 </span>
//               </div>

//               <div style={styles.detailRow}>
//                 <span style={styles.detailLabel}>Time</span>

//                 <span style={styles.detailValue}>{selectedActivity.time}</span>
//               </div>

//               <div style={styles.detailRow}>
//                 <span style={styles.detailLabel}>Location</span>

//                 <span style={styles.detailValue}>
//                   {selectedActivity.location}
//                 </span>
//               </div>

//               <div style={styles.detailRow}>
//                 <span style={styles.detailLabel}>Status</span>

//                 <span
//                   style={{
//                     ...styles.detailValue,
//                     color: "#15803d",
//                   }}
//                 >
//                   ✓ {selectedActivity.status}
//                 </span>
//               </div>

//               {/* DESCRIPTION */}
//               <div style={styles.detailsBox}>
//                 <div style={styles.detailsLabel}>Activity Description</div>

//                 <p style={styles.detailsText}>{selectedActivity.details}</p>
//               </div>
//             </div>

//             {/* MODAL FOOTER */}
//             <div style={styles.modalFooter}>
//               <button
//                 style={styles.closeFooter}
//                 onClick={() => setSelectedActivity(null)}
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default History;

import React, { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:3000";

const ACTIVITY_TYPES = {
  BADGE_EARNED: {
    label: "Badges Earned",
    icon: "🏅",
    color: "#7c3aed",
    bg: "#f3e8ff",
  },
  VOLUNTEER_MILESTONE: {
    label: "Volunteer Milestones",
    icon: "🎯",
    color: "#15803d",
    bg: "#dcfce7",
  },
  TRUST_SCORE_MILESTONE: {
    label: "Trust Score Milestones",
    icon: "📈",
    color: "#2563eb",
    bg: "#dbeafe",
  },
  PROFILE_UPDATED: {
    label: "Profile Changes",
    icon: "👤",
    color: "#be185d",
    bg: "#fce7f3",
  },
};

function getVolunteerId() {
  try {
    const saved =
      localStorage.getItem("mydata") || sessionStorage.getItem("mydata");
    if (!saved) return null;
    const user = JSON.parse(saved);
    return user?.user_id || user?._id || user?.id || null;
  } catch {
    return null;
  }
}

function validDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = validDate(value);
  return date
    ? date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Date unavailable";
}

function formatTime(value) {
  const date = validDate(value);
  return date
    ? date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "";
}

function getDateGroup(value) {
  const date = validDate(value);
  if (!date) return "Earlier";
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return formatDate(value);
}

function matchesDate(value, filter) {
  if (filter === "All") return true;
  const date = validDate(value);
  if (!date) return false;
  const now = new Date();
  if (filter === "Today") return date.toDateString() === now.toDateString();
  if (filter === "Last 7 days" || filter === "Last 30 days") {
    const start = new Date(now);
    start.setDate(now.getDate() - (filter === "Last 7 days" ? 6 : 29));
    start.setHours(0, 0, 0, 0);
    return date >= start && date <= now;
  }
  if (filter === "This year") return date.getFullYear() === now.getFullYear();
  return true;
}

function History() {
  const [activities, setActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError("");
    const volunteerId = getVolunteerId();

    if (!volunteerId) {
      setActivities([]);
      setError("Volunteer login details were not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/volunteer-activity/${encodeURIComponent(volunteerId)}`,
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data?.message || "Could not load activity history.");
      setActivities(Array.isArray(data.activities) ? data.activities : []);
    } catch (err) {
      console.error("Activity history fetch error:", err);
      setError(err.message || "Unable to connect to the SafeHer server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const filteredActivities = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return [...activities]
      .filter((activity) => {
        if (!ACTIVITY_TYPES[activity.type]) return false;
        if (typeFilter !== "All" && activity.type !== typeFilter) return false;
        if (!matchesDate(activity.createdAt, dateFilter)) return false;
        const config = ACTIVITY_TYPES[activity.type];
        const searchable = [activity.title, activity.description, config.label]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return searchable.includes(search);
      })
      .sort(
        (a, b) =>
          (validDate(b.createdAt)?.getTime() || 0) -
          (validDate(a.createdAt)?.getTime() || 0),
      );
  }, [activities, searchTerm, typeFilter, dateFilter]);

  const groupedActivities = useMemo(
    () =>
      filteredActivities.reduce((groups, activity) => {
        const group = getDateGroup(activity.createdAt);
        if (!groups[group]) groups[group] = [];
        groups[group].push(activity);
        return groups;
      }, {}),
    [filteredActivities],
  );

  const s = {
    page: {
      minHeight: "100vh",
      padding: "30px",
      background: "#f4f6fb",
      fontFamily: "Inter, Arial, sans-serif",
      color: "#172033",
      boxSizing: "border-box",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      flexWrap: "wrap",
      gap: "14px",
      marginBottom: "24px",
    },
    title: {
      margin: 0,
      color: "#172554",
      fontSize: "28px",
      fontWeight: 750,
      letterSpacing: "-.5px",
    },
    subtitle: {
      margin: "8px 0 0",
      color: "#64748b",
      fontSize: "14px",
      lineHeight: 1.6,
    },
    button: {
      border: "1px solid #cbd5e1",
      borderRadius: "9px",
      padding: "10px 14px",
      background: "#fff",
      color: "#334155",
      fontWeight: 700,
      cursor: "pointer",
    },
    filters: {
      display: "flex",
      flexWrap: "wrap",
      gap: "12px",
      padding: "16px",
      marginBottom: "16px",
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: "14px",
      boxShadow: "0 5px 18px #0f172a08",
    },
    search: {
      flex: "1 1 220px",
      minWidth: 0,
      padding: "12px 14px",
      border: "1px solid #cbd5e1",
      borderRadius: "9px",
      fontSize: "13px",
      outline: "none",
    },
    select: {
      flex: "0 1 190px",
      minWidth: "150px",
      padding: "12px",
      border: "1px solid #cbd5e1",
      borderRadius: "9px",
      background: "#fff",
      color: "#334155",
      fontSize: "13px",
    },
    summary: {
      display: "flex",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "8px",
      margin: "0 2px 12px",
      color: "#64748b",
      fontSize: "12px",
    },
    panel: {
      padding: "26px",
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: "14px",
      boxShadow: "0 5px 18px #0f172a08",
    },
    dateSection: { marginBottom: "26px" },
    dateTitle: {
      display: "inline-block",
      marginBottom: "18px",
      padding: "6px 11px",
      borderRadius: "7px",
      background: "#eef2ff",
      color: "#3730a3",
      fontSize: "12px",
      fontWeight: 750,
    },
    item: {
      display: "flex",
      alignItems: "flex-start",
      gap: "14px",
      paddingBottom: "17px",
      marginBottom: "17px",
      borderBottom: "1px solid #f1f5f9",
    },
    icon: {
      flex: "0 0 42px",
      width: "42px",
      height: "42px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "12px",
      fontSize: "19px",
    },
    content: { flex: 1, minWidth: 0 },
    itemTop: {
      display: "flex",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "8px",
      marginBottom: "5px",
    },
    itemTitle: {
      margin: 0,
      fontSize: "14px",
      lineHeight: 1.5,
      fontWeight: 750,
      color: "#1e293b",
    },
    time: { color: "#94a3b8", fontSize: "11px", whiteSpace: "nowrap" },
    category: {
      display: "inline-block",
      marginBottom: "7px",
      fontSize: "10px",
      fontWeight: 750,
      textTransform: "uppercase",
    },
    description: {
      margin: "0 0 10px",
      color: "#64748b",
      fontSize: "12px",
      lineHeight: 1.7,
      overflowWrap: "anywhere",
    },
    footer: {
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "10px",
    },

    view: {
      marginLeft: "auto",
      border: "1px solid #c7d2fe",
      borderRadius: "7px",
      padding: "7px 10px",
      background: "#eef2ff",
      color: "#3730a3",
      fontSize: "11px",
      fontWeight: 700,
      cursor: "pointer",
    },
    empty: { padding: "52px 16px", textAlign: "center", color: "#64748b" },
    message: {
      padding: "18px",
      borderRadius: "10px",
      background: "#fff1f2",
      border: "1px solid #fecdd3",
      color: "#be123c",
      textAlign: "center",
      fontSize: "13px",
      lineHeight: 1.6,
    },
    overlay: {
      position: "fixed",
      inset: 0,
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "18px",
      background: "#0f172a9e",
      boxSizing: "border-box",
    },
    modal: {
      width: "100%",
      maxWidth: "520px",
      maxHeight: "85vh",
      overflowY: "auto",
      background: "#fff",
      borderRadius: "16px",
      boxShadow: "0 24px 70px #0004",
    },
    modalHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      padding: "20px 22px",
      borderBottom: "1px solid #e2e8f0",
    },
    modalTitle: {
      margin: 0,
      fontSize: "16px",
      color: "#172554",
      overflowWrap: "anywhere",
    },
    modalBody: { padding: "22px" },
    row: {
      display: "flex",
      gap: "14px",
      padding: "12px 0",
      borderBottom: "1px solid #f1f5f9",
    },
    label: {
      flex: "0 0 105px",
      color: "#94a3b8",
      fontSize: "10px",
      fontWeight: 750,
      textTransform: "uppercase",
    },
    value: {
      flex: 1,
      minWidth: 0,
      color: "#334155",
      fontSize: "12px",
      lineHeight: 1.6,
      overflowWrap: "anywhere",
    },
    detailBox: {
      marginTop: "18px",
      padding: "15px",
      border: "1px solid #e2e8f0",
      borderRadius: "10px",
      background: "#f8fafc",
    },
    modalFooter: {
      display: "flex",
      justifyContent: "flex-end",
      padding: "14px 22px",
      background: "#f8fafc",
      borderTop: "1px solid #e2e8f0",
    },
  };

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div>
          <h1 style={s.title}>Activity History</h1>
          <p style={s.subtitle}>
            Track your badges, milestones, trust score achievements, and profile
            updates on SafeHer.
          </p>
        </div>
        <button
          type="button"
          style={s.button}
          onClick={fetchActivities}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </header>

      <section style={s.filters} aria-label="Activity filters">
        <input
          style={s.search}
          type="search"
          placeholder="Search title or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search activities"
        />
        <select
          style={s.select}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          aria-label="Filter activity type"
        >
          <option value="All">All Activity Types</option>
          {Object.entries(ACTIVITY_TYPES).map(([value, config]) => (
            <option key={value} value={value}>
              {config.label}
            </option>
          ))}
        </select>
        <select
          style={s.select}
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          aria-label="Filter date"
        >
          <option value="All">All Time</option>
          <option value="Today">Today</option>
          <option value="Last 7 days">Last 7 Days</option>
          <option value="Last 30 days">Last 30 Days</option>
          <option value="This year">This Year</option>
        </select>
      </section>

      <div style={s.summary}>
        <span>
          Showing <strong>{filteredActivities.length}</strong>{" "}
          {filteredActivities.length === 1 ? "activity" : "activities"}
        </span>
        <span>Newest activities first</span>
      </div>

      <main style={s.panel}>
        {loading ? (
          <div style={s.empty}>
            <div style={{ fontSize: 32 }}>⏳</div>
            <h3>Loading activity history...</h3>
            <p>Fetching your latest SafeHer updates.</p>
          </div>
        ) : error ? (
          <div style={s.message}>
            <p>{error}</p>
            <button type="button" style={s.button} onClick={fetchActivities}>
              Try Again
            </button>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 34 }}>🕒</div>
            <h3 style={{ margin: "10px 0 6px", color: "#334155" }}>
              No activities found
            </h3>
            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6 }}>
              {activities.length === 0
                ? "Your genuine achievements and profile changes will appear here when recorded."
                : "Try another search term or change your filters."}
            </p>
          </div>
        ) : (
          Object.entries(groupedActivities).map(([group, items]) => (
            <section key={group} style={s.dateSection}>
              <div style={s.dateTitle}>{group}</div>
              {items.map((activity) => {
                const config = ACTIVITY_TYPES[activity.type];
                return (
                  <article key={activity._id} style={s.item}>
                    <div
                      style={{
                        ...s.icon,
                        color: config.color,
                        background: config.bg,
                      }}
                      aria-hidden="true"
                    >
                      {config.icon}
                    </div>
                    <div style={s.content}>
                      <div style={s.itemTop}>
                        <h3 style={s.itemTitle}>
                          {activity.title || config.label}
                        </h3>
                        <time style={s.time} dateTime={activity.createdAt}>
                          {formatTime(activity.createdAt)}
                        </time>
                      </div>
                      <div style={{ ...s.category, color: config.color }}>
                        {config.label}
                      </div>
                      <p style={s.description}>
                        {activity.description ||
                          "No additional details provided."}
                      </p>
                      <div style={s.footer}>
                        <button
                          type="button"
                          style={s.view}
                          onClick={() => setSelectedActivity(activity)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          ))
        )}
      </main>

      {selectedActivity &&
        (() => {
          const config =
            ACTIVITY_TYPES[selectedActivity.type] ||
            ACTIVITY_TYPES.PROFILE_UPDATED;
          return (
            <div style={s.overlay} onClick={() => setSelectedActivity(null)}>
              <section
                style={s.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="activity-detail-title"
                onClick={(e) => e.stopPropagation()}
              >
                <header style={s.modalHeader}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        ...s.icon,
                        color: config.color,
                        background: config.bg,
                      }}
                    >
                      {config.icon}
                    </div>
                    <div>
                      <h2 id="activity-detail-title" style={s.modalTitle}>
                        {selectedActivity.title || config.label}
                      </h2>
                      <p
                        style={{
                          margin: "5px 0 0",
                          fontSize: 11,
                          color: "#64748b",
                        }}
                      >
                        Activity details
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    style={s.button}
                    onClick={() => setSelectedActivity(null)}
                    aria-label="Close details"
                  >
                    ×
                  </button>
                </header>
                <div style={s.modalBody}>
                  <div style={s.row}>
                    <span style={s.label}>Category</span>
                    <span style={s.value}>{config.label}</span>
                  </div>
                  <div style={s.row}>
                    <span style={s.label}>Date</span>
                    <span style={s.value}>
                      {formatDate(selectedActivity.createdAt)}
                    </span>
                  </div>
                  <div style={s.row}>
                    <span style={s.label}>Time</span>
                    <span style={s.value}>
                      {formatTime(selectedActivity.createdAt) || "Unavailable"}
                    </span>
                  </div>
                  <div style={s.detailBox}>
                    <strong
                      style={{
                        fontSize: 10,
                        color: "#475569",
                        textTransform: "uppercase",
                      }}
                    >
                      Description
                    </strong>
                    <p
                      style={{
                        margin: "8px 0 0",
                        fontSize: 12,
                        lineHeight: 1.7,
                        color: "#64748b",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {selectedActivity.description ||
                        "No additional details provided."}
                    </p>
                  </div>
                </div>
                <footer style={s.modalFooter}>
                  <button
                    type="button"
                    style={s.button}
                    onClick={() => setSelectedActivity(null)}
                  >
                    Close
                  </button>
                </footer>
              </section>
            </div>
          );
        })()}
    </div>
  );
}

export default History;
