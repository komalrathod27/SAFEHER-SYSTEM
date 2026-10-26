import React from "react";
import "../safeher-css/howitworks.css";

function HowItWorks() {
  const safetySteps = [
    {
      number: "01",
      icon: "fa-solid fa-user-plus",
      title: "Register",
      text: "Create your SafeHer account and access the safety features available to you.",
    },
    {
      number: "02",
      icon: "fa-solid fa-users",
      title: "Add Trusted Contacts",
      text: "Add people you trust so they can be contacted when you need support.",
    },
    {
      number: "03",
      icon: "fa-solid fa-shield-halved",
      title: "Stay Connected",
      text: "Use SafeHer resources and community features to stay informed.",
    },
    {
      number: "04",
      icon: "fa-solid fa-hand-holding-heart",
      title: "Get Help",
      text: "When needed, SafeHer helps connect you with appropriate support.",
    },
  ];

  const communitySteps = [
    {
      icon: "fa-solid fa-file-circle-plus",
      title: "Report an Incident",
      text: "Share information about a safety incident with the SafeHer community.",
    },
    {
      icon: "fa-solid fa-map-location-dot",
      title: "Safety Information",
      text: "Community safety information can help users become more aware of their surroundings.",
    },
    {
      icon: "fa-solid fa-people-group",
      title: "Build Awareness",
      text: "Together, users and volunteers can contribute to a safer community.",
    },
  ];

  const roles = [
    {
      icon: "fa-solid fa-person-dress",
      title: "Women",
      text: "Access safety tools, report incidents, manage trusted contacts and get safety guidance.",
    },
    {
      icon: "fa-solid fa-handshake-angle",
      title: "Volunteers",
      text: "Support the community by responding to SOS requests and assisting users when needed.",
    },
    {
      icon: "fa-solid fa-user-shield",
      title: "Admin",
      text: "Verify volunteers, moderate reports and help maintain the safety platform.",
    },
  ];

  return (
    <div className="safeher-how-it-works">
      {/* ================= HERO ================= */}
      <section className="how-hero">
        <div className="container">
          <div className="how-hero-wrapper">
            <div className="how-hero-content">
              <span className="how-label">
                <i className="fa-solid fa-circle-info"></i>
                SAFEHER GUIDE
              </span>

              <h1>How SafeHer Works</h1>

              <p>
                SafeHer brings emergency support, community safety and
                intelligent guidance together to help women stay informed,
                connected and prepared.
              </p>

              <div className="hero-highlight">
                <i className="fa-solid fa-shield-heart"></i>

                <span>
                  Safety support when you need it, information when you need it.
                </span>
              </div>
            </div>

            <div className="how-hero-image">
              <img
                src="/assets/images/all-img/how-safeher-works3.png"
                alt="Woman using SafeHer safety technology"
              />

              <div className="hero-image-badge">
                <i className="fa-solid fa-shield-halved"></i>

                <div>
                  <strong>SafeHer</strong>
                  <span>Community Safety</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BASIC SAFETY FLOW ================= */}
      <section className="safety-flow-section">
        <div className="container">
          <div className="how-section-title">
            <span>GET STARTED</span>

            <h2>How SafeHer Protects You</h2>

            <p>
              SafeHer brings important safety features together in one platform
              so you can stay prepared and connected.
            </p>
          </div>

          <div className="safety-steps">
            {safetySteps.map((step, index) => (
              <div className="safety-step" key={index}>
                <div className="step-number">{step.number}</div>

                <div className="step-icon">
                  <i className={step.icon}></i>
                </div>

                <h3>{step.title}</h3>

                <p>{step.text}</p>

                {index !== safetySteps.length - 1 && (
                  <div className="step-arrow">
                    <i className="fa-solid fa-arrow-right"></i>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= EMERGENCY RESPONSE ================= */}
      <section className="emergency-flow-section">
        <div className="container">
          <div className="how-section-title light-title">
            <span>EMERGENCY RESPONSE</span>

            <h2>What Happens When You Need Help?</h2>

            <p>
              SafeHer is designed to connect an emergency request with trusted
              people and community volunteers.
            </p>
          </div>

          <div className="emergency-flow">
            <div className="emergency-step">
              <div className="emergency-icon">
                <i className="fa-solid fa-bell"></i>
              </div>

              <span>01</span>

              <h3>Trigger SOS</h3>

              <p>The user activates the emergency SOS feature.</p>
            </div>

            <div className="flow-connector">
              <i className="fa-solid fa-arrow-right"></i>
            </div>

            <div className="emergency-step">
              <div className="emergency-icon">
                <i className="fa-solid fa-paper-plane"></i>
              </div>

              <span>02</span>

              <h3>Alert Sent</h3>

              <p>Trusted contacts and eligible volunteers receive the alert.</p>
            </div>

            <div className="flow-connector">
              <i className="fa-solid fa-arrow-right"></i>
            </div>

            <div className="emergency-step">
              <div className="emergency-icon">
                <i className="fa-solid fa-person-circle-check"></i>
              </div>

              <span>03</span>

              <h3>Volunteer Responds</h3>

              <p>An available volunteer can accept the request.</p>
            </div>

            <div className="flow-connector">
              <i className="fa-solid fa-arrow-right"></i>
            </div>

            <div className="emergency-step">
              <div className="emergency-icon">
                <i className="fa-solid fa-location-dot"></i>
              </div>

              <span>04</span>

              <h3>Location Shared</h3>

              <p>
                Location information can help responders understand where
                assistance is needed.
              </p>
            </div>

            <div className="flow-connector">
              <i className="fa-solid fa-arrow-right"></i>
            </div>

            <div className="emergency-step">
              <div className="emergency-icon">
                <i className="fa-solid fa-circle-check"></i>
              </div>

              <span>05</span>

              <h3>Help Provided</h3>

              <p>The emergency can be resolved after appropriate support.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SAFEHER AI ================= */}
      <section className="ai-section">
        <div className="container">
          <div className="ai-wrapper">
            {/* AI IMAGE */}
            <div className="ai-image">
              <img
                src="/assets/images/all-img/safeher-ai.png"
                alt="Woman using AI safety assistant"
              />

              <div className="ai-image-badge">
                <i className="fa-solid fa-robot"></i>
                <span>SafeHer AI</span>
              </div>
            </div>

            {/* AI CONTENT */}
            <div className="ai-content">
              <span className="ai-label">
                <i className="fa-solid fa-robot"></i>
                SAFEHER AI
              </span>

              <h2>How SafeHer AI Works</h2>

              <p>
                SafeHer AI provides quick access to general safety information
                and guidance. Users can ask questions about personal safety,
                travel, digital safety and other safety-related topics.
              </p>

              <div className="ai-flow">
                <div className="ai-flow-item">
                  <div className="ai-flow-icon">
                    <i className="fa-solid fa-robot"></i>
                  </div>

                  <div>
                    <h3>Open AI</h3>
                    <p>Click the SafeHer AI button.</p>
                  </div>
                </div>

                <div className="ai-flow-item">
                  <div className="ai-flow-icon">
                    <i className="fa-solid fa-message"></i>
                  </div>

                  <div>
                    <h3>Ask a Question</h3>
                    <p>Enter your safety-related question.</p>
                  </div>
                </div>

                <div className="ai-flow-item">
                  <div className="ai-flow-icon">
                    <i className="fa-solid fa-brain"></i>
                  </div>

                  <div>
                    <h3>AI Understands</h3>
                    <p>The AI processes your question.</p>
                  </div>
                </div>

                <div className="ai-flow-item">
                  <div className="ai-flow-icon">
                    <i className="fa-solid fa-lightbulb"></i>
                  </div>

                  <div>
                    <h3>Get Guidance</h3>
                    <p>Receive useful safety information.</p>
                  </div>
                </div>
              </div>

              <div className="ai-note">
                <i className="fa-solid fa-circle-info"></i>

                <span>
                  SafeHer AI provides general safety guidance. It does not
                  replace emergency services or professional assistance.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= COMMUNITY SAFETY ================= */}
      <section className="community-section">
        <div className="container">
          <div className="how-section-title">
            <span>COMMUNITY SAFETY</span>

            <h2>Safety Is Better Together</h2>

            <p>
              SafeHer encourages users to contribute to community safety by
              sharing useful information and increasing awareness.
            </p>
          </div>

          <div className="community-grid">
            {communitySteps.map((item, index) => (
              <div className="community-card" key={index}>
                <div className="community-icon">
                  <i className={item.icon}></i>
                </div>

                <h3>{item.title}</h3>

                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= USER ROLES ================= */}
      <section className="roles-section">
        <div className="container">
          <div className="how-section-title">
            <span>SAFEHER COMMUNITY</span>

            <h2>SafeHer for Everyone</h2>

            <p>Different users work together to create a safer community.</p>
          </div>

          <div className="roles-grid">
            {roles.map((role, index) => (
              <div className="role-card" key={index}>
                <div className="role-icon">
                  <i className={role.icon}></i>
                </div>

                <h3>{role.title}</h3>

                <p>{role.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FINAL REMINDER ================= */}
      <section className="how-reminder">
        <div className="container">
          <div className="how-reminder-box">
            <div className="reminder-heart">
              <i className="fa-solid fa-heart"></i>
            </div>

            <div>
              <h3>Because Every Woman Deserves to Feel Safe.</h3>

              <p>
                Stay informed, stay connected and use SafeHer whenever you need
                safety information or support.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HowItWorks;
