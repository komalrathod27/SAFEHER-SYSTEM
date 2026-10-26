import React from "react";
import "../safeher-css/about.css";

function About() {
  return (
    <div className="safeher-about">
      {/* ================= HERO SECTION ================= */}
      <section className="about-hero">
        <div className="about-hero-overlay"></div>

        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <div className="about-hero-content">
                <span className="about-tag">ABOUT SAFEHER</span>

                <h1>
                  Because Every Woman
                  <br />
                  Deserves to Feel <span>Safe.</span>
                </h1>

                <p>
                  SafeHer is a community safety platform designed to help women
                  stay connected, informed and supported whenever they need it.
                </p>

                <a href="/register" className="about-primary-btn">
                  Join SafeHer
                  <i className="fa-solid fa-arrow-right"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHO WE ARE ================= */}
      <section className="about-main-section">
        <div className="container">
          <div className="row align-items-center">
            {/* LEFT CONTENT */}
            <div className="col-lg-6">
              <div className="about-main-content">
                <span className="about-tag">WHO WE ARE</span>

                <h2>
                  A Safer World Starts
                  <span> Together.</span>
                </h2>

                <p className="large-text">
                  SafeHer brings emergency support, trusted connections,
                  community safety information and useful resources together in
                  one platform.
                </p>

                <p>
                  Our goal is to make safety information and support easier to
                  access. Whether a woman is looking for safety information,
                  reporting an incident, or facing an emergency, SafeHer is
                  designed to provide a connected safety experience.
                </p>

                {/* FEATURES */}
                <div className="about-check-list">
                  <div>
                    <i className="fa-solid fa-circle-check"></i>
                    Emergency Assistance
                  </div>

                  <div>
                    <i className="fa-solid fa-circle-check"></i>
                    Trusted Contacts
                  </div>

                  <div>
                    <i className="fa-solid fa-circle-check"></i>
                    Community Safety
                  </div>

                  <div>
                    <i className="fa-solid fa-circle-check"></i>
                    Safety Resources
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIMPLE INFO CARD */}
            <div className="col-lg-6">
              <div className="about-info-box">
                <div className="about-info-icon">
                  <i className="fa-solid fa-shield-heart"></i>
                </div>

                <h3>Safety. Connection. Support.</h3>

                <p>
                  SafeHer is designed to bring important safety features
                  together in one simple and accessible platform.
                </p>

                <div className="info-stat-row">
                  <div>
                    <strong>24/7</strong>
                    <span>Safety Support</span>
                  </div>

                  <div>
                    <strong>1</strong>
                    <span>Connected Platform</span>
                  </div>

                  <div>
                    <strong>3</strong>
                    <span>Community Roles</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHY SAFEHER ================= */}
      <section className="why-safeher">
        <div className="container">
          <div className="why-content">
            <span className="about-tag">WHY SAFEHER</span>

            <h2>
              Safety Is More Than
              <br />
              An <span>Emergency Button.</span>
            </h2>

            <p>
              True safety also means awareness, preparation, connection and
              community support.
            </p>
          </div>

          <div className="row why-cards">
            {/* CARD 1 */}
            <div className="col-lg-3 col-md-6">
              <div className="why-card">
                <div className="why-icon">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                </div>

                <h3>Stay Alert</h3>

                <p>
                  Access safety information and become more aware of your
                  surroundings.
                </p>
              </div>
            </div>

            {/* CARD 2 */}
            <div className="col-lg-3 col-md-6">
              <div className="why-card">
                <div className="why-icon">
                  <i className="fa-solid fa-user-group"></i>
                </div>

                <h3>Stay Connected</h3>

                <p>Keep important people and community support within reach.</p>
              </div>
            </div>

            {/* CARD 3 */}
            <div className="col-lg-3 col-md-6">
              <div className="why-card">
                <div className="why-icon">
                  <i className="fa-solid fa-location-dot"></i>
                </div>

                <h3>Know Your Area</h3>

                <p>
                  Explore community safety information and reported incidents.
                </p>
              </div>
            </div>

            {/* CARD 4 */}
            <div className="col-lg-3 col-md-6">
              <div className="why-card">
                <div className="why-icon">
                  <i className="fa-solid fa-hand-holding-heart"></i>
                </div>

                <h3>Support Others</h3>

                <p>
                  Contribute to a stronger and safer community through
                  responsible reporting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MISSION ================= */}
      <section className="mission-section">
        <div className="container">
          <div className="row align-items-center">
            {/* LEFT */}
            <div className="col-lg-6">
              <div className="mission-content">
                <span className="about-tag">OUR MISSION</span>

                <h2>
                  Building a Community
                  <br />
                  That <span>Looks Out for You.</span>
                </h2>

                <p>
                  SafeHer aims to create a connected environment where women can
                  access help, share safety information and make informed
                  decisions.
                </p>

                <p>
                  We believe technology can bring people together and make
                  safety support more accessible when it matters most.
                </p>

                <a href="/howitworks" className="mission-btn">
                  See How It Works
                  <i className="fa-solid fa-arrow-right"></i>
                </a>
              </div>
            </div>

            {/* RIGHT — ONLY ONE IMAGE */}
            <div className="col-lg-6">
              <div className="mission-image">
                {/* ADD YOUR IMAGE HERE */}
                {/* Image path:
                   ../assets/images/safeher-mission.jpg
                */}

                <div className="mission-image-badge">
                  <i className="fa-solid fa-heart"></i>

                  <span>
                    Community
                    <small>Powered Safety</small>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="about-final-cta">
        <div className="cta-overlay"></div>

        <div className="container">
          <div className="cta-content">
            <span className="about-tag">SAFEHER</span>

            <h2>
              Stay Aware.
              <br />
              Stay Connected.
              <br />
              Stay <span>Safe.</span>
            </h2>

            <p>
              Join SafeHer and take a step towards a more connected safety
              experience.
            </p>

            <a href="/register" className="about-primary-btn">
              Get Started
              <i className="fa-solid fa-arrow-right"></i>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
