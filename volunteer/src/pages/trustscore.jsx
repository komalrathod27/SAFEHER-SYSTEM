import React, { useEffect, useState } from "react";
import "../volunteer-css/TrustScore.css";

function TrustScore() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("mydata") || "{}");
    const volunteerId = user.user_id;

    if (!volunteerId) {
      setError("Volunteer ID not found. Please log in again.");
      setLoading(false);
      return;
    }

    fetch(`http://localhost:3000/api/sos/trust-score/${volunteerId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load Trust Score.");
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="trust-state">
        <div className="trust-spinner" />
        <p>Loading your Trust Score...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="trust-state">
        <h2>Unable to load Trust Score</h2>
        <p>{error || "Please try again later."}</p>
      </div>
    );
  }

  const { performance, factors, trustScore, trustLevel } = data;

  const factorList = [
    {
      title: "Successful Resolution",
      description: "How many accepted SOS requests you successfully resolved.",
      score: factors.resolution.score,
      max: factors.resolution.maxScore,
      progress: performance.successRate,
      detail: `${performance.resolvedRequests} of ${performance.acceptedRequests} accepted requests resolved`,
      icon: "check-circle",
    },
    {
      title: "Response Speed",
      description: "How quickly you accept SOS requests.",
      score: factors.responseSpeed.score,
      max: factors.responseSpeed.maxScore,
      progress:
        (factors.responseSpeed.score / factors.responseSpeed.maxScore) * 100,
      detail:
        performance.averageResponseTime === null
          ? "No valid response-time data yet"
          : `Average response time: ${performance.averageResponseTime} minutes`,
      icon: "clock",
    },
    {
      title: "Consistency",
      description:
        "How many different days you have successfully resolved SOS requests.",
      score: factors.consistency.score,
      max: factors.consistency.maxScore,
      progress: factors.consistency.progress,
      detail: `${factors.consistency.differentDays} of ${factors.consistency.targetDays} different days completed`,
      icon: "calendar-check",
    },
  ];

  const scoreWidth = Math.min(100, Math.max(0, trustScore));

  const levelClass =
    trustScore >= 80
      ? "high"
      : trustScore >= 60
        ? "trusted"
        : trustScore >= 40
          ? "developing"
          : "improvement";

  // Trust Tiers Flow Definitions matching your criteria
  const trustTiers = [
    { range: "0–39", label: "Needs Improvement", min: 0, max: 39 },
    { range: "40–59", label: "Developing", min: 40, max: 59 },
    { range: "60–79", label: "Trusted", min: 60, max: 79 },
    { range: "80–100", label: "Highly Trusted", min: 80, max: 100 },
  ];

  return (
    <main className="trust-page">
      <header className="trust-header">
        <div>
          <span className="trust-eyebrow">VOLUNTEER PERFORMANCE</span>
          <h1>Trust Score</h1>
          <p>See how your contributions build trust in the community.</p>
        </div>
      </header>

      <section className="trust-overview">
        <article className="trust-card trust-main-card">
          <div className="trust-card-heading">
            <span>Current Trust Score</span>
            <span className="trust-icon">★</span>
          </div>

          <div className="trust-score-number">
            {trustScore}
            <span>/100</span>
          </div>

          <div className="trust-progress">
            <div
              className="trust-progress-fill trust-score-fill"
              style={{ width: `${scoreWidth}%` }}
            />
          </div>

          <div className="trust-progress-labels">
            <span>Overall performance</span>
            <strong>{scoreWidth}%</strong>
          </div>
        </article>

        <article className="trust-card trust-level-card">
          <div className="trust-level-heading">
            <div>
              <span className="trust-small-label">YOUR TRUST LEVEL</span>
              <h2>Progress to your next level</h2>
            </div>
            <div className={`trust-level-badge ${levelClass}`}>
              {trustLevel}
            </div>
          </div>

          {/* Trust tier progression */}
          <div className="trust-level-flow">
            {trustTiers.map((tier, idx) => {
              const isActive = trustScore >= tier.min && trustScore <= tier.max;
              const isComplete = trustScore > tier.max;
              return (
                <div
                  key={tier.label}
                  className={`flow-step ${isActive ? "active" : ""} ${
                    isComplete ? "complete" : ""
                  }`}
                  aria-current={isActive ? "step" : undefined}
                >
                  <span>{idx + 1}</span>
                  <small>{tier.range}</small>
                  <strong>{tier.label}</strong>
                </div>
              );
            })}
          </div>

          <div className="trust-level-score">
            <span>Current score</span>
            <strong>{trustScore} / 100</strong>
          </div>

          <div className="trust-level-progress">
            <div
              className="trust-level-progress-fill"
              style={{ width: `${Math.min(100, trustScore)}%` }}
            />
          </div>

          <div className="trust-level-range">
            <span>0</span>
            <span>100 points</span>
          </div>

          <div className="trust-next-level">
            <strong>
              {trustScore >= 80
                ? "Highest trust level achieved!"
                : `${
                    trustScore >= 60
                      ? 80 - trustScore
                      : trustScore >= 40
                        ? 60 - trustScore
                        : 40 - trustScore
                  } points to next level`}
            </strong>

            <p>
              {trustScore >= 80
                ? "Keep responding quickly and resolving SOS requests."
                : trustScore >= 60
                  ? "Reach 80 points to become Highly Trusted."
                  : trustScore >= 40
                    ? "Reach 60 points to move up to Trusted."
                    : "Reach 40 points to move up to Developing."}
            </p>
          </div>
        </article>
      </section>

      <section className="trust-section">
        <div className="trust-section-heading">
          <div>
            <h2>Performance Summary</h2>
            <p>Your SOS activity at a glance.</p>
          </div>
        </div>

        <div className="trust-stats-grid">
          <article className="trust-card trust-stat-card">
            <span className="trust-stat-icon blue">↗</span>
            <p>Accepted SOS</p>
            <h3>{performance.acceptedRequests}</h3>
          </article>

          <article className="trust-card trust-stat-card">
            <span className="trust-stat-icon green">✓</span>
            <p>Resolved SOS</p>
            <h3>{performance.resolvedRequests}</h3>
          </article>

          <article className="trust-card trust-stat-card">
            <span className="trust-stat-icon pink">%</span>
            <p>Success Rate</p>
            <h3>{performance.successRate}%</h3>
          </article>

          <article className="trust-card trust-stat-card">
            <span className="trust-stat-icon purple">◷</span>
            <p>Average Response</p>
            <h3 className="trust-time-value">
              {performance.averageResponseTime === null
                ? "N/A"
                : `${performance.averageResponseTime} min`}
            </h3>
          </article>
        </div>
      </section>

      <section className="trust-section">
        <div className="trust-section-heading">
          <div>
            <h2>How Your Score Is Calculated</h2>
            <p>Three factors contribute to your score out of 100.</p>
          </div>
        </div>

        <div className="trust-factors">
          {factorList.map((factor, index) => (
            <article
              className="trust-card trust-factor-card"
              key={factor.title}
            >
              <div className="trust-factor-top">
                <div className="trust-factor-title">
                  <span className="trust-factor-number">0{index + 1}</span>
                  <div>
                    <h3>{factor.title}</h3>
                    <p>{factor.description}</p>
                  </div>
                </div>

                <div className="trust-factor-score">
                  {factor.score}
                  <span> / {factor.max}</span>
                </div>
              </div>

              <div className="trust-progress">
                <div
                  className={`trust-progress-fill factor-fill-${index + 1}`}
                  style={{
                    width: `${Math.min(100, Math.max(0, factor.progress))}%`,
                  }}
                />
              </div>

              <div className="trust-factor-bottom">
                <span>{factor.detail}</span>
                <strong>
                  {Math.round(Math.min(100, Math.max(0, factor.progress)))}%
                </strong>
              </div>
            </article>
          ))}
        </div>

        <p className="trust-note">
          <strong>Consistency rule:</strong> Each calendar day with at least one
          resolved SOS counts as one different day. The target is{" "}
          {factors.consistency.targetDays} days in total, not necessarily
          consecutive days.
        </p>
      </section>
    </main>
  );
}

export default TrustScore;
