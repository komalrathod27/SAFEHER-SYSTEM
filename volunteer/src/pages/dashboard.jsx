import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Award,
  Bell,
  CalendarCheck2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileWarning,
  HeartHandshake,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Siren,
  Users,
} from "lucide-react";
import { getVolunteerId } from "../utils/volunteerIdentity";
import "../volunteer-css/dashboard.css";

const API = "http://localhost:3000";

const INCIDENTS_URL = `${API}/api/getverifiedincidentreports`;

const routes = {
  sos: "/sosrequests",
  responses: "/responses",
  trust: "/trustscore",
  badges: "/badges",
  history: "/history",
  incidents: "/incidentreports",
};

function readVolunteer() {
  try {
    const raw =
      localStorage.getItem("mydata") || sessionStorage.getItem("mydata");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function timeAgo(date) {
  if (!date) return "";
  const value = new Date(date).getTime();
  if (Number.isNaN(value)) return "";

  const minutes = Math.max(0, Math.floor((Date.now() - value) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} days ago`;

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function getStatus(status = "") {
  const value = String(status).toLowerCase();
  if (value === "pending") return "pending";
  if (["approved", "active"].includes(value)) return "active";
  if (["resolved", "cancelled", "rejected"].includes(value)) return "closed";
  return "other";
}

function Dashboard() {
  const navigate = useNavigate();

  const [volunteerId] = useState(() => getVolunteerId());
  const [volunteer] = useState(() => readVolunteer());

  const [sosRequests, setSosRequests] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [badges, setBadges] = useState([]);
  const [activities, setActivities] = useState([]);
  const [incidents, setIncidents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState({});
  const [live, setLive] = useState(false);
  const [filter, setFilter] = useState("all");

  const volunteerName =
    volunteer.name ||
    volunteer.fullName ||
    volunteer.user_name ||
    volunteer.volunteerName ||
    "Volunteer";

  const firstName = volunteerName.trim().split(/\s+/)[0];

  async function loadDashboard(showLoader = false) {
    if (!volunteerId) {
      setErrors({
        identity: "Volunteer information not found. Please log in again.",
      });
      setLoading(false);
      return;
    }

    if (showLoader) setRefreshing(true);

    const jobs = [
      {
        key: "sos",
        url: `${API}/api/sos/all`,
        update: (data) =>
          setSosRequests(Array.isArray(data.requests) ? data.requests : []),
      },
      {
        key: "performance",
        url: `${API}/api/sos/trust-score/${volunteerId}`,
        update: (data) => setPerformance(data),
      },
      {
        key: "badges",
        url: `${API}/api/volunteer-badges/${volunteerId}`,
        update: (data) =>
          setBadges(Array.isArray(data.badges) ? data.badges : []),
      },
      {
        key: "activities",
        url: `${API}/api/volunteer-activity/${volunteerId}`,
        update: (data) =>
          setActivities(Array.isArray(data.activities) ? data.activities : []),
      },
      {
        key: "incidents",
        url: INCIDENTS_URL,
        update: (data) => {
          setIncidents(Array.isArray(data) ? data : []);
        },
      },
    ];

    const nextErrors = {};

    await Promise.all(
      jobs.map(async (job) => {
        try {
          const response = await fetch(job.url);
          if (!response.ok) throw new Error(`Unable to load ${job.key}.`);
          const data = await response.json();
          job.update(data);
        } catch (error) {
          nextErrors[job.key] = error.message;
        }
      }),
    );

    setErrors(nextErrors);
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    loadDashboard();

    const socket = io(API, { transports: ["polling", "websocket"] });

    socket.on("connect", () => {
      setLive(true);
      socket.emit("join_volunteers");
    });
    socket.on("disconnect", () => setLive(false));

    [
      "new_sos_alert",
      "sos_updated",
      "sos_approved",
      "sos_resolved",
      "sos_cancelled",
    ].forEach((event) => socket.on(event, () => loadDashboard()));

    return () => socket.disconnect();
  }, [volunteerId]);

  const pendingRequests = sosRequests.filter(
    (r) => getStatus(r.status) === "pending",
  );
  const activeRequests = sosRequests.filter(
    (r) => getStatus(r.status) === "active",
  );
  const activeSOSCount = pendingRequests.length + activeRequests.length;

  const resolvedCount = Number(performance?.performance?.resolvedRequests ?? 0);
  const acceptedCount = Number(performance?.performance?.acceptedRequests ?? 0);
  const trustScore = Number(performance?.trustScore ?? 0);
  const trustPct = Math.min(100, Math.max(0, trustScore));
  const averageResponseTime = performance?.performance?.averageResponseTime;

  const earnedBadges = badges.filter((b) => b.earned);
  const lockedBadges = badges.filter((b) => !b.earned);

  const recentActivities = [...activities]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 3);

  const openSOS = [...sosRequests]
    .filter((r) =>
      ["pending", "approved", "active"].includes(
        String(r.status).toLowerCase(),
      ),
    )
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  const visibleSOS = openSOS
    .filter((r) => filter === "all" || getStatus(r.status) === filter)
    .slice(0, 5);

  const stats = [
    {
      title: "Incident reports",
      value: errors.incidents ? "—" : incidents.length,
      detail: "Reports you have filed",
      icon: FileWarning,
      tone: "rose",
      path: routes.incidents,
    },
    {
      title: "Successful resolutions",
      value: errors.performance ? "—" : resolvedCount,
      detail: "SOS requests you resolved",
      icon: CheckCircle2,
      tone: "green",
      path: routes.responses,
    },
    {
      title: "Trust score",
      value: errors.performance ? "—" : trustScore,
      suffix: errors.performance ? "" : "/100",
      detail: performance?.trustLevel || "Your volunteer trust level",
      icon: ShieldCheck,
      tone: "violet",
      path: routes.trust,
    },
    {
      title: "Average response",
      value: errors.performance
        ? "—"
        : averageResponseTime == null
          ? "N/A"
          : averageResponseTime,
      suffix: errors.performance || averageResponseTime == null ? "" : " min",
      detail: "Based on your recorded responses",
      icon: Clock3,
      tone: "amber",
      path: routes.trust,
    },
  ];

  const shortcuts = [
    {
      label: "SOS Requests",
      hint: "Respond to alerts",
      icon: Siren,
      path: routes.sos,
    },
    {
      label: "My Responses",
      hint: "Your handled cases",
      icon: CheckCircle2,
      path: routes.responses,
    },
    {
      label: "Trust Score",
      hint: "See how it's built",
      icon: ShieldCheck,
      path: routes.trust,
    },
    {
      label: "Activity History",
      hint: "Everything you did",
      icon: Activity,
      path: routes.history,
    },
  ];

  if (loading) {
    return (
      <main className="vd-page">
        <div className="vd-state">
          <div className="vd-spinner" />
          <h2>Preparing your dashboard</h2>
          <p>Loading your SafeHer volunteer information...</p>
        </div>
      </main>
    );
  }

  if (errors.identity) {
    return (
      <main className="vd-page">
        <div className="vd-state vd-error">
          <ShieldCheck size={36} />
          <h2>Volunteer session unavailable</h2>
          <p>{errors.identity}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="vd-page">
      <div className="vd-container">
        {/* ---------- Top bar ---------- */}
        <header className="vd-topbar">
          <div className="vd-brand">
            <div className="vd-brand-icon">
              <HeartHandshake size={24} />
            </div>
            <div>
              <strong>SafeHer</strong>
            </div>
          </div>

          <div className="vd-topbar-right">
            <span className={`vd-live ${live ? "on" : ""}`}>
              <i /> {live ? "Live updates on" : "Reconnecting"}
            </span>

            <button
              type="button"
              className="vd-refresh"
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
            >
              <RefreshCw size={15} className={refreshing ? "vd-spin" : ""} />
              <span>{refreshing ? "Refreshing" : "Refresh"}</span>
            </button>
          </div>
        </header>

        {/* ---------- Greeting ---------- */}
        <section className="vd-greeting">
          <span className="vd-date">
            <CalendarCheck2 size={14} /> {formatDate(new Date())}
          </span>
          <h1>
            {greeting()}, <span>{firstName}.</span>
          </h1>
        </section>

        {/* ---------- Stats ---------- */}
        <section className="vd-stats-grid">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <button
                type="button"
                key={item.title}
                className="vd-stat-card"
                onClick={() => navigate(item.path)}
              >
                <div className="vd-stat-top">
                  <span className={`vd-stat-icon ${item.tone}`}>
                    <Icon size={20} />
                  </span>
                  <ArrowUpRight size={17} className="vd-stat-arrow" />
                </div>
                <span className="vd-stat-title">{item.title}</span>
                <strong className="vd-stat-value">
                  {item.value}
                  {item.suffix && <em>{item.suffix}</em>}
                </strong>
                <span className="vd-stat-detail">{item.detail}</span>
                <span className={`vd-stat-bar ${item.tone}`} />
              </button>
            );
          })}
        </section>

        {/* ---------- Main grid ---------- */}
        <section className="vd-main-grid">
          {/* SOS list */}
          <article className="vd-panel">
            <div className="vd-panel-heading">
              <div className="vd-panel-title-icon">
                <Siren size={19} />
              </div>
              <div>
                <h2>Current SOS requests</h2>
                <p>Latest requests available in the system</p>
              </div>
              <button
                type="button"
                className="vd-text-link"
                onClick={() => navigate(routes.sos)}
              >
                View all <ArrowRight size={14} />
              </button>
            </div>

            <div className="vd-tabs" role="tablist">
              {[
                { key: "all", label: "All", count: openSOS.length },
                {
                  key: "pending",
                  label: "Pending",
                  count: pendingRequests.length,
                },
                {
                  key: "active",
                  label: "Active",
                  count: activeRequests.length,
                },
              ].map((tab) => (
                <button
                  type="button"
                  role="tab"
                  key={tab.key}
                  aria-selected={filter === tab.key}
                  className={filter === tab.key ? "is-active" : ""}
                  onClick={() => setFilter(tab.key)}
                >
                  {tab.label} <span>{tab.count}</span>
                </button>
              ))}
            </div>

            {errors.sos ? (
              <div className="vd-empty">
                <p>Unable to load SOS requests.</p>
              </div>
            ) : visibleSOS.length === 0 ? (
              <div className="vd-empty">
                <span className="vd-empty-icon">
                  <CheckCircle2 size={24} />
                </span>
                <h3>All clear</h3>
                <p>
                  There are no {filter === "all" ? "pending or active" : filter}{" "}
                  SOS requests to display.
                </p>
              </div>
            ) : (
              <div className="vd-sos-list">
                {visibleSOS.map((request) => {
                  const status = getStatus(request.status);
                  const requestId = request._id
                    ? `SOS-${request._id.slice(-5).toUpperCase()}`
                    : "SOS request";

                  return (
                    <button
                      type="button"
                      key={request._id || requestId}
                      className="vd-sos-row"
                      onClick={() => navigate(routes.sos)}
                    >
                      <span className={`vd-sos-mark ${status}`}>
                        <Siren size={18} />
                        {status === "pending" && <i className="vd-pulse" />}
                      </span>

                      <span className="vd-sos-info">
                        <strong>{requestId}</strong>
                        <span>
                          <MapPin size={13} />
                          {request.womanAddress ||
                            "Location details unavailable"}
                        </span>
                      </span>

                      <span className="vd-sos-end">
                        <span className={`vd-status ${status}`}>
                          {request.status}
                        </span>
                        <small>{timeAgo(request.createdAt)}</small>
                      </span>

                      <ChevronRight size={16} className="vd-sos-chevron" />
                    </button>
                  );
                })}
              </div>
            )}

            <div className="vd-panel-footer">
              <span>
                <Bell size={14} /> Stay attentive to new requests
              </span>
              <strong>{activeSOSCount} open</strong>
            </div>
          </article>

          {/* Performance */}
          <article className="vd-panel">
            <div className="vd-panel-heading">
              <div className="vd-panel-title-icon vd-purple">
                <ShieldCheck size={19} />
              </div>
              <div>
                <h2>My performance</h2>
                <p>Built from your recorded SOS history</p>
              </div>
            </div>

            {errors.performance ? (
              <div className="vd-empty">
                <p>Unable to load performance data.</p>
                <button
                  type="button"
                  className="vd-text-link"
                  onClick={() => navigate(routes.trust)}
                >
                  Open Trust Score <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <div className="vd-performance-body">
                <div className="vd-trust-summary">
                  <div
                    className="vd-trust-ring"
                    style={{
                      background: `conic-gradient(#198565 ${trustPct}%, #cfe8da 0)`,
                    }}
                  >
                    <div className="vd-trust-ring-inner">
                      <strong>{trustScore}</strong>
                      <span>out of 100</span>
                    </div>
                  </div>
                  <div className="vd-trust-copy">
                    <span className="vd-mini-label">CURRENT TRUST LEVEL</span>
                    <h3>{performance?.trustLevel || "Not available"}</h3>
                    <p>
                      Your score reflects your contribution and consistency.
                    </p>
                  </div>
                </div>

                <div className="vd-performance-metrics">
                  <div>
                    <span>Accepted</span>
                    <strong>{acceptedCount}</strong>
                  </div>
                  <div>
                    <span>Resolved</span>
                    <strong>{resolvedCount}</strong>
                  </div>
                  <div>
                    <span>Success rate</span>
                    <strong>
                      {performance?.performance?.successRate == null
                        ? "N/A"
                        : `${performance.performance.successRate}%`}
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="vd-outline-action"
                  onClick={() => navigate(routes.trust)}
                >
                  Explore your Trust Score <ArrowRight size={16} />
                </button>
              </div>
            )}
          </article>
        </section>

        {/* ---------- Bottom grid ---------- */}
        <section className="vd-bottom-grid">
          {/* Activity timeline */}
          <article className="vd-panel">
            <div className="vd-panel-heading">
              <div className="vd-panel-title-icon vd-amber">
                <Activity size={19} />
              </div>
              <div>
                <h2>Recent activity</h2>
                <p>Your 3 most recent updates</p>
              </div>
              <button
                type="button"
                className="vd-text-link"
                onClick={() => navigate(routes.history)}
              >
                History <ArrowRight size={14} />
              </button>
            </div>

            {errors.activities ? (
              <div className="vd-empty">
                <p>Unable to load recent activity.</p>
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="vd-empty vd-empty-compact">
                <p>
                  Your new achievements and profile updates will appear here.
                </p>
              </div>
            ) : (
              <div className="vd-timeline">
                {recentActivities.map((activity, index) => (
                  <div
                    className="vd-activity-row"
                    key={
                      activity._id ||
                      `${activity.type}-${activity.createdAt}-${index}`
                    }
                  >
                    <span className="vd-activity-dot">
                      {activity.type === "BADGE_EARNED" ? (
                        <Award size={15} />
                      ) : activity.type === "PROFILE_UPDATED" ? (
                        <Users size={15} />
                      ) : (
                        <Activity size={15} />
                      )}
                    </span>
                    <div className="vd-activity-copy">
                      <div className="vd-activity-head">
                        <strong>
                          {activity.title || "Volunteer activity"}
                        </strong>
                        <span>{timeAgo(activity.createdAt)}</span>
                      </div>
                      <p>{activity.description || "Activity recorded."}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>

          {/* Achievements */}
          <article className="vd-panel">
            <div className="vd-panel-heading">
              <div className="vd-panel-title-icon vd-green">
                <Award size={19} />
              </div>
              <div>
                <h2>My achievements</h2>
                <p>Milestones earned through your contribution</p>
              </div>
              <button
                type="button"
                className="vd-text-link"
                onClick={() => navigate(routes.badges)}
              >
                All badges <ArrowRight size={14} />
              </button>
            </div>

            {errors.badges ? (
              <div className="vd-empty">
                <p>Unable to load badge information.</p>
              </div>
            ) : (
              <div className="vd-badges-body">
                <div className="vd-badge-summary">
                  <div className="vd-badge-emblem">
                    <Award size={26} />
                  </div>
                  <div className="vd-badge-count">
                    <strong>
                      {earnedBadges.length} <em>of {badges.length}</em>
                    </strong>
                    <span>badges earned</span>
                  </div>
                  <span className="vd-badge-pct">
                    {badges.length
                      ? Math.round((earnedBadges.length / badges.length) * 100)
                      : 0}
                    %
                  </span>
                </div>

                <div className="vd-progress-track">
                  <div
                    className="vd-progress-fill"
                    style={{
                      width: `${
                        badges.length
                          ? (earnedBadges.length / badges.length) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>

                {earnedBadges.length || lockedBadges.length ? (
                  <div className="vd-badge-grid">
                    {earnedBadges.slice(0, 4).map((badge) => (
                      <div className="vd-badge-tile earned" key={badge.key}>
                        <span>
                          <Award size={18} />
                        </span>
                        <strong>{badge.name}</strong>
                      </div>
                    ))}
                    {lockedBadges
                      .slice(0, Math.max(0, 4 - earnedBadges.length))
                      .map((badge) => (
                        <div className="vd-badge-tile locked" key={badge.key}>
                          <span>
                            <Award size={18} />
                          </span>
                          <strong>{badge.name}</strong>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="vd-empty vd-empty-compact">
                    <p>Your first badge is waiting for your next milestone.</p>
                  </div>
                )}

                <button
                  type="button"
                  className="vd-outline-action"
                  onClick={() => navigate(routes.badges)}
                >
                  View achievements <ArrowRight size={16} />
                </button>
              </div>
            )}
          </article>
        </section>

        {/* ---------- Shortcuts ---------- */}
        <section className="vd-shortcuts">
          <div className="vd-shortcuts-head">
            <span className="vd-section-kicker">GET THINGS DONE</span>
            <h2>Quick actions</h2>
          </div>

          <div className="vd-shortcut-list">
            {shortcuts.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  type="button"
                  key={item.label}
                  onClick={() => navigate(item.path)}
                >
                  <span className="vd-shortcut-icon">
                    <Icon size={18} />
                  </span>
                  <span className="vd-shortcut-text">
                    <strong>{item.label}</strong>
                    <small>{item.hint}</small>
                  </span>
                  <ArrowRight size={15} className="vd-shortcut-arrow" />
                </button>
              );
            })}
          </div>
        </section>

        <footer className="vd-footer">
          <HeartHandshake size={16} />
          <span>SafeHer · Supporting a safer community, together.</span>
        </footer>
      </div>
    </main>
  );
}

export default Dashboard;
