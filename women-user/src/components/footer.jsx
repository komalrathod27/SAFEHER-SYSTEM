import React from "react";
import { Link } from "react-router-dom";
import "../safeher-css/footer.css";

function Footer() {
  const exploreLinks = [
    { label: "Home", path: "/" },
    { label: "About SafeHer", path: "/about" },
    { label: "How It Works", path: "/how-it-works" },
  ];

  const safetyLinks = [
    { label: "Safety Map", path: "/safety-map" },
    { label: "Safety Resources", path: "/safety-resources" },
    { label: "Safety Articles", path: "/safety-articles" },
  ];

  const helplines = [
    { number: "112", label: "Emergency" },
    { number: "181", label: "Women Helpline" },
    { number: "1091", label: "Women in Distress" },
  ];

  return (
    <footer className="safeher-footer">
      <div className="safeher-footer-container">
        <div className="safeher-footer-grid">
          {/* BRAND */}
          <div className="safeher-footer-brand">
            <Link
              to="/"
              className="safeher-footer-logo-card"
              aria-label="SafeHer home"
            >
              <img
                src="assets/images/all-img/SafeHer logo.png"
                alt="SafeHer - Because every woman deserves to feel safe"
                className="safeher-footer-logo-img"
              />
            </Link>

            <p className="safeher-footer-description">
              SafeHer is a community safety platform designed to help women
              explore safety information, identify safer areas, access helpful
              resources and build a more safety-aware community.
            </p>

            <div className="safeher-footer-highlight">
              <span className="safeher-footer-shield" aria-hidden="true">
                ✓
              </span>
              <span>Awareness, preparedness and community support.</span>
            </div>
          </div>

          {/* EXPLORE */}
          <nav className="safeher-footer-column" aria-label="Explore SafeHer">
            <h3 className="safeher-footer-heading">Explore SafeHer</h3>
            <ul className="safeher-footer-links">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.path}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* SAFETY */}
          <nav
            className="safeher-footer-column"
            aria-label="Safety and awareness"
          >
            <h3 className="safeher-footer-heading">Safety &amp; Awareness</h3>
            <ul className="safeher-footer-links">
              {safetyLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.path}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* GET STARTED */}
          <div className="safeher-footer-column safeher-footer-start">
            <h3 className="safeher-footer-heading">Get Started</h3>

            <div className="safeher-footer-start-card">
              <p className="safeher-footer-start-text">
                Access your SafeHer account to use personalized safety features
                and connect with the community.
              </p>

              <Link to="/login" className="safeher-footer-cta">
                Login to SafeHer
                <span aria-hidden="true">→</span>
              </Link>

              <p className="safeher-footer-login-note">
                <span aria-hidden="true">🔒</span> Emergency SOS requires login.
              </p>
            </div>
          </div>
        </div>

        {/* HELPLINE STRIP (optional - delete this block if not needed) */}
        <div className="safeher-footer-helplines">
          <span className="safeher-footer-helplines-title">
            Need help right now?
          </span>
          <div className="safeher-footer-helplines-list">
            {helplines.map((item) => (
              <a
                key={item.number}
                href={`tel:${item.number}`}
                className="safeher-footer-helpline"
              >
                <strong>{item.number}</strong>
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* BOTTOM */}
        <div className="safeher-footer-bottom">
          <p>
            © {new Date().getFullYear()}{" "}
            <span className="safeher-footer-brand-name">SafeHer</span>. All
            rights reserved.
          </p>

          <p className="safeher-footer-bottom-tagline">
            Because Every Woman Deserves to Feel Safe.
          </p>

          <p className="safeher-footer-disclaimer">
            SafeHer supports community safety and does not replace official
            emergency services.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
