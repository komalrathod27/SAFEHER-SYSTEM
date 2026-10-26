import { useEffect, useState } from "react";
import {
  Award,
  BadgeCheck,
  CalendarCheck2,
  HandHeart,
  LockKeyhole,
  ShieldCheck,
  Zap,
} from "lucide-react";
import "../volunteer-css/badges.css";
import { getVolunteerId } from "../utils/volunteerIdentity";

function BadgeIcon({ type, size = 64 }) {
  const icons = {
    "helping-hand": HandHeart,
    "fast-responder": Zap,
    "emergency-champion": Award,
    "consistent-guardian": CalendarCheck2,
    "trusted-volunteer": ShieldCheck,
  };
  const Icon = icons[type] || BadgeCheck;

  return <Icon size={size} strokeWidth={1.8} aria-hidden="true" />;
}

const badgeCatalog = [
  {
    key: "helping-hand",
    name: "Helping Hand",
    category: "Assistance",
    description: "Your first successful SOS resolution.",
  },
  {
    key: "fast-responder",
    name: "Fast Responder",
    category: "Emergency Response",
    description: "Achieve an average response time of 3 minutes or less.",
  },
  {
    key: "emergency-champion",
    name: "Emergency Champion",
    category: "Milestone",
    description: "Successfully resolve 25 SOS requests.",
  },
  {
    key: "consistent-guardian",
    name: "Consistent Guardian",
    category: "Reliability",
    description: "Resolve SOS requests on 10 different days.",
  },
  {
    key: "trusted-volunteer",
    name: "Trusted Volunteer",
    category: "Trust & Reliability",
    description: "Reach a Trust Score of 80 or above.",
  },
];

function formatDate(date) {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

function getProgress(badge) {
  if (badge.earned) return 100;

  const progress = Number(badge.progress);
  const target = Number(badge.target);

  if (Number.isFinite(progress) && Number.isFinite(target) && target > 0) {
    return Math.min(100, Math.max(0, Math.round((progress / target) * 100)));
  }

  if (badge.key === "fast-responder" && Number(badge.averageResponseTime) > 0) {
    return Math.min(
      99,
      Math.round((3 / Number(badge.averageResponseTime)) * 100),
    );
  }

  return 0;
}

function Badges() {
  const [badges, setBadges] = useState([]);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [trustScore, setTrustScore] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchBadges() {
      try {
        const volunteerId = getVolunteerId();

        if (!volunteerId) {
          throw new Error(
            "Volunteer information not found. Please log in again.",
          );
        }
        const response = await fetch(
          `http://localhost:3000/api/volunteer-badges/${volunteerId}`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load badges.");
        }

        if (cancelled) return;

        setTrustScore(Number(data.trustScore) || 0);

        const receivedBadges = Array.isArray(data.badges) ? data.badges : [];

        const mergedBadges = badgeCatalog.map((catalogBadge) => {
          const savedBadge = receivedBadges.find(
            (item) => item.key === catalogBadge.key,
          );

          return {
            ...catalogBadge,
            ...(savedBadge || {}),
            key: catalogBadge.key,
            name: savedBadge?.name || catalogBadge.name,
            category: catalogBadge.category,
            description: catalogBadge.description,
            earned: Boolean(savedBadge?.earned),
          };
        });

        setBadges(mergedBadges);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Something went wrong while loading badges.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchBadges();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === "Escape") setSelectedBadge(null);
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const earnedBadges = badges.filter((badge) => badge.earned);
  const lockedBadges = badges.filter((badge) => !badge.earned);

  if (loading) {
    return (
      <div className="badges-page">
        <div className="badges-message">
          <div className="badges-loader" />
          <p>Loading your achievements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="badges-page">
        <div className="badges-message badges-error">
          <h3>Unable to load badges</h3>
          <p>{error}</p>
          <button
            className="badges-retry"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const renderBadgeCard = (badge) => {
    const progress = getProgress(badge);

    return (
      <button
        type="button"
        key={badge.key}
        className={`badge-card badge-${badge.key} ${badge.earned ? "earned" : "locked"}`}
        onClick={() => setSelectedBadge(badge)}
      >
        <div className="badge-card-top">
          <div className={`badge-icon badge-icon-${badge.key}`}>
            <BadgeIcon type={badge.key} size={64} />
          </div>

          <span className={`badge-status ${badge.earned ? "is-earned" : ""}`}>
            {badge.earned ? "Earned" : "Locked"}
          </span>
        </div>

        <div className="badge-card-content">
          <span className="badge-category">{badge.category}</span>
          <h3>{badge.name}</h3>
          <p>{badge.description}</p>

          {badge.earned ? (
            <div className="badge-earned-date">
              <span className="badge-check">✓</span>
              {badge.earnedAt
                ? `Earned ${formatDate(badge.earnedAt)}`
                : "Achievement unlocked"}
            </div>
          ) : (
            <div className="badge-progress">
              <div className="badge-progress-label">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>

              <div
                className="badge-progress-track"
                role="progressbar"
                aria-label={`${badge.name} progress`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              >
                <div
                  className="badge-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <span className="badge-requirement">
                {badge.requirement || "Keep helping to unlock this badge."}
              </span>
            </div>
          )}
        </div>

        <span className="badge-card-arrow" aria-hidden="true">
          ↗
        </span>
      </button>
    );
  };

  return (
    <div className="badges-page">
      <div className="badges-container">
        <header className="badges-header">
          <div>
            <span className="badges-eyebrow">VOLUNTEER ACHIEVEMENTS</span>
            <h1>My Badges</h1>
            <p>
              Every helping hand makes a difference. Keep making a positive
              impact with SafeHer.
            </p>
          </div>

          <div className="badges-header-emblem" aria-hidden="true">
            <BadgeIcon type="emergency-champion" size={72} />
          </div>
        </header>

        <section className="badges-summary">
          <div className="summary-item">
            <span className="summary-icon summary-earned">
              <Award size={23} strokeWidth={2} aria-hidden="true" />
            </span>
            <div>
              <span className="summary-label">Badges Earned</span>
              <strong>
                {earnedBadges.length}
                <small> / {badges.length}</small>
              </strong>
            </div>
          </div>

          <div className="summary-divider" />

          <div className="summary-item">
            <span className="summary-icon summary-locked">
              <LockKeyhole size={22} strokeWidth={2} aria-hidden="true" />
            </span>
            <div>
              <span className="summary-label">Still to Unlock</span>
              <strong>{lockedBadges.length}</strong>
            </div>
          </div>

          <div className="summary-divider" />

          <div className="summary-item">
            <span className="summary-icon summary-trust">
              <ShieldCheck size={23} strokeWidth={2} aria-hidden="true" />
            </span>
            <div>
              <span className="summary-label">Trust Score</span>
              <strong>{trustScore}</strong>
            </div>
          </div>
        </section>

        <section className="badges-section">
          <div className="badges-section-heading">
            <div>
              <h2>Earned Badges</h2>
              <p>Your efforts are making a difference.</p>
            </div>
            <span className="section-count">{earnedBadges.length}</span>
          </div>

          {earnedBadges.length > 0 ? (
            <div className="badges-grid">
              {earnedBadges.map(renderBadgeCard)}
            </div>
          ) : (
            <div className="badges-empty">
              <div className="empty-icon">
                <BadgeIcon type="helping-hand" size={48} />
              </div>
              <h3>Your first badge is waiting!</h3>
              <p>Complete your first successful SOS resolution to begin.</p>
            </div>
          )}
        </section>

        <section className="badges-section">
          <div className="badges-section-heading">
            <div>
              <h2>Ready to Unlock</h2>
              <p>Keep supporting your community to earn more badges.</p>
            </div>
            <span className="section-count">{lockedBadges.length}</span>
          </div>

          {lockedBadges.length > 0 ? (
            <div className="badges-grid">
              {lockedBadges.map(renderBadgeCard)}
            </div>
          ) : (
            <div className="badges-empty">
              <h3>Amazing work!</h3>
              <p>You have earned every badge currently available.</p>
            </div>
          )}
        </section>

        <section className="badges-motivation">
          <div className="motivation-icon">
            <BadgeIcon type="trusted-volunteer" size={54} />
          </div>
          <div>
            <h3>Every action builds trust.</h3>
            <p>
              Your time, consistency, and commitment help make the community
              safer for everyone.
            </p>
          </div>
        </section>
      </div>

      {selectedBadge && (
        <div
          className="badge-modal-overlay"
          onClick={() => setSelectedBadge(null)}
          role="presentation"
        >
          <div
            className="badge-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="badge-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="badge-modal-close"
              onClick={() => setSelectedBadge(null)}
              aria-label="Close badge details"
            >
              ×
            </button>

            <div
              className={`badge-modal-icon badge-modal-icon-${selectedBadge.key} ${
                selectedBadge.earned ? "" : "modal-icon-locked"
              }`}
            >
              <BadgeIcon type={selectedBadge.key} size={82} />
            </div>

            <span className="badge-category">{selectedBadge.category}</span>
            <h2 id="badge-modal-title">{selectedBadge.name}</h2>
            <p className="badge-modal-description">
              {selectedBadge.description}
            </p>

            <div
              className={`badge-modal-status ${
                selectedBadge.earned ? "modal-earned" : "modal-locked"
              }`}
            >
              {selectedBadge.earned ? "✓ Badge Earned" : "🔒 Not Unlocked Yet"}
            </div>

            {selectedBadge.earned ? (
              <div className="badge-modal-info">
                <span>Achievement status</span>
                <strong>
                  {selectedBadge.earnedAt
                    ? formatDate(selectedBadge.earnedAt)
                    : "Unlocked"}
                </strong>
              </div>
            ) : (
              <>
                <div className="badge-modal-info">
                  <span>How to unlock</span>
                  <strong>
                    {selectedBadge.requirement || selectedBadge.description}
                  </strong>
                </div>

                <div className="badge-progress modal-progress">
                  <div className="badge-progress-label">
                    <span>Your progress</span>
                    <span>{getProgress(selectedBadge)}%</span>
                  </div>
                  <div className="badge-progress-track">
                    <div
                      className="badge-progress-fill"
                      style={{
                        width: `${getProgress(selectedBadge)}%`,
                      }}
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="button"
              className="badge-modal-button"
              onClick={() => setSelectedBadge(null)}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Badges;
