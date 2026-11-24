import React, { useCallback, useEffect, useMemo, useState } from "react";
import "../volunteer-css/history.css";

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

  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return formatDate(value);
}

function matchesDate(value, filter) {
  if (filter === "All") return true;

  const date = validDate(value);

  if (!date) return false;

  const now = new Date();

  if (filter === "Today") {
    return date.toDateString() === now.toDateString();
  }

  if (filter === "Last 7 days" || filter === "Last 30 days") {
    const start = new Date(now);

    start.setDate(now.getDate() - (filter === "Last 7 days" ? 6 : 29));
    start.setHours(0, 0, 0, 0);

    return date >= start && date <= now;
  }

  if (filter === "This year") {
    return date.getFullYear() === now.getFullYear();
  }

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

    const saved =
      sessionStorage.getItem("mydata") || localStorage.getItem("mydata");

    let volunteerData;

    try {
      volunteerData = saved ? JSON.parse(saved) : null;
    } catch {
      volunteerData = null;
    }

    const volunteerId = volunteerData?.user_id || volunteerData?._id;
    const token = volunteerData?.token;

    if (!volunteerId || !token) {
      setActivities([]);
      setError("Volunteer session not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/volunteer-activity/${encodeURIComponent(volunteerId)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Could not load activity history.");
      }

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

        if (typeFilter !== "All" && activity.type !== typeFilter) {
          return false;
        }

        if (!matchesDate(activity.createdAt, dateFilter)) {
          return false;
        }

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

  return (
    <div className="history-page">
      {/* =========================================
          HEADER
      ========================================= */}

      <header className="history-header">
        <div>
          <h1 className="history-title">Activity History</h1>

          <p className="history-subtitle">
            Track your badges, milestones, trust score achievements, and profile
            updates on SafeHer.
          </p>
        </div>

        <button
          type="button"
          className="history-button"
          onClick={fetchActivities}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </header>

      {/* =========================================
          FILTERS
      ========================================= */}

      <section className="history-filters" aria-label="Activity filters">
        <input
          className="history-search"
          type="search"
          placeholder="Search title or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search activities"
        />

        <select
          className="history-select"
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
          className="history-select"
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

      {/* =========================================
          ACTIVITY SUMMARY
      ========================================= */}

      <div className="history-summary">
        <span>
          Showing <strong>{filteredActivities.length}</strong>{" "}
          {filteredActivities.length === 1 ? "activity" : "activities"}
        </span>

        <span>Newest activities first</span>
      </div>

      {/* =========================================
          ACTIVITY PANEL
      ========================================= */}

      <main className="history-panel">
        {loading ? (
          <div className="history-empty">
            <div className="history-empty-icon">⏳</div>

            <h3>Loading activity history...</h3>

            <p>Fetching your latest SafeHer updates.</p>
          </div>
        ) : error ? (
          <div className="history-message">
            <p>{error}</p>

            <button
              type="button"
              className="history-button"
              onClick={fetchActivities}
            >
              Try Again
            </button>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="history-empty">
            <div className="history-empty-icon large">🕒</div>

            <h3 className="history-empty-title">No activities found</h3>

            <p className="history-empty-description">
              {activities.length === 0
                ? "Your genuine achievements and profile changes will appear here when recorded."
                : "Try another search term or change your filters."}
            </p>
          </div>
        ) : (
          Object.entries(groupedActivities).map(([group, items]) => (
            <section key={group} className="history-date-section">
              <div className="history-date-title">{group}</div>

              {items.map((activity) => {
                const config = ACTIVITY_TYPES[activity.type];

                return (
                  <article key={activity._id} className="history-item">
                    <div
                      className="history-icon"
                      style={{
                        "--activity-color": config.color,
                        "--activity-bg": config.bg,
                      }}
                      aria-hidden="true"
                    >
                      {config.icon}
                    </div>

                    <div className="history-content">
                      <div className="history-item-top">
                        <h3 className="history-item-title">
                          {activity.title || config.label}
                        </h3>

                        <time
                          className="history-time"
                          dateTime={activity.createdAt}
                        >
                          {formatTime(activity.createdAt)}
                        </time>
                      </div>

                      <div
                        className="history-category"
                        style={{ "--activity-color": config.color }}
                      >
                        {config.label}
                      </div>

                      <p className="history-description">
                        {activity.description ||
                          "No additional details provided."}
                      </p>

                      <div className="history-footer">
                        <button
                          type="button"
                          className="history-view-button"
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

      {/* =========================================
          ACTIVITY DETAILS MODAL
      ========================================= */}

      {selectedActivity &&
        (() => {
          const config =
            ACTIVITY_TYPES[selectedActivity.type] ||
            ACTIVITY_TYPES.PROFILE_UPDATED;

          return (
            <div
              className="history-overlay"
              onClick={() => setSelectedActivity(null)}
            >
              <section
                className="history-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="activity-detail-title"
                onClick={(e) => e.stopPropagation()}
              >
                {/* MODAL HEADER */}

                <header className="history-modal-header">
                  <div className="history-modal-heading">
                    <div
                      className="history-icon"
                      style={{
                        "--activity-color": config.color,
                        "--activity-bg": config.bg,
                      }}
                    >
                      {config.icon}
                    </div>

                    <div className="history-modal-heading-content">
                      <h2
                        id="activity-detail-title"
                        className="history-modal-title"
                      >
                        {selectedActivity.title || config.label}
                      </h2>

                      <p className="history-modal-subtitle">Activity details</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="history-button"
                    onClick={() => setSelectedActivity(null)}
                    aria-label="Close details"
                  >
                    ×
                  </button>
                </header>

                {/* MODAL BODY */}

                <div className="history-modal-body">
                  <div className="history-detail-row">
                    <span className="history-detail-label">Category</span>

                    <span className="history-detail-value">{config.label}</span>
                  </div>

                  <div className="history-detail-row">
                    <span className="history-detail-label">Date</span>

                    <span className="history-detail-value">
                      {formatDate(selectedActivity.createdAt)}
                    </span>
                  </div>

                  <div className="history-detail-row">
                    <span className="history-detail-label">Time</span>

                    <span className="history-detail-value">
                      {formatTime(selectedActivity.createdAt) || "Unavailable"}
                    </span>
                  </div>

                  <div className="history-detail-box">
                    <strong className="history-detail-box-title">
                      Description
                    </strong>

                    <p className="history-detail-box-description">
                      {selectedActivity.description ||
                        "No additional details provided."}
                    </p>
                  </div>
                </div>

                {/* MODAL FOOTER */}

                <footer className="history-modal-footer">
                  <button
                    type="button"
                    className="history-button"
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
