import { useEffect, useState } from "react";
import Axios from "axios";
import Swal from "sweetalert2";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "../safeher-css/home.css";
import { activateSOSAlert } from "../utils/sosService";

const safeIcon = new L.DivIcon({
  className: "safeher-map-icon",
  html: '<div class="sm-real-marker safe-marker">🛡️</div>',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const cautionIcon = new L.DivIcon({
  className: "safeher-map-icon",
  html: '<div class="sm-real-marker caution-marker">⚠️</div>',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

function Home() {
  const [activeSos, setActiveSos] = useState(null);
  const [safetyAreas, setSafetyAreas] = useState([]);

  useEffect(() => {
    const rawData = localStorage.getItem("mydata");
    if (!rawData) return;
    try {
      const user = JSON.parse(rawData);
      Axios.get(`http://localhost:3000/api/sos/active/${user.user_id}`)
        .then((res) => {
          if (res.data.active && res.data.sos) {
            setActiveSos(res.data.sos);
          }
        })
        .catch(() => {});
    } catch {}
  }, []);

  useEffect(() => {
    const getSafetyAreas = async () => {
      try {
        const response = await Axios.get(
          "http://localhost:3000/api/getsafetyareas",
        );

        setSafetyAreas(response.data);
      } catch (error) {
        console.error("Error loading safety areas:", error);
      }
    };

    getSafetyAreas();
  }, []);

  const safeCount = safetyAreas.filter((area) => area.type === "Safe").length;

  const cautionCount = safetyAreas.filter(
    (area) => area.type === "Caution",
  ).length;

  const handleSOSClick = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    activateSOSAlert();
  };

  return (
    <div className="safeher-home-page">
      {/* Floating Active SOS Banner */}
      {activeSos && (
        <div
          style={{
            background: "linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)",
            color: "#ffffff",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
            boxShadow: "0 4px 12px rgba(220,38,38,0.3)",
            position: "sticky",
            top: "0",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontWeight: "700",
              fontSize: "14px",
            }}
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#ffffff",
                animation: "safeher-sos-pulse 1.2s infinite",
              }}
            ></span>
            <span>🚨 ACTIVE SOS IN PROGRESS:</span>
            <span style={{ fontWeight: "400", opacity: 0.9 }}>
              {activeSos.volunteerName
                ? `Volunteer ${activeSos.volunteerName} accepted your request!`
                : "Waiting for nearby volunteer to approve..."}
            </span>
            {activeSos.distance && (
              <span
                style={{
                  background: "rgba(255,255,255,0.2)",
                  padding: "2px 8px",
                  borderRadius: "10px",
                }}
              >
                Distance: {activeSos.distance}
              </span>
            )}
          </div>
          <a
            href="/sostracking"
            style={{
              background: "#ffffff",
              color: "#dc2626",
              padding: "6px 16px",
              borderRadius: "20px",
              fontWeight: "700",
              fontSize: "13px",
              textDecoration: "none",
            }}
          >
            Open Live Tracking Map →
          </a>
        </div>
      )}

      {/* ================= HERO ================= */}
      <section className="sh-home-hero">
        {/* Background Image */}
        <div className="sh-hero-bg-image"></div>

        {/* Background decorative elements */}
        <div className="sh-hero-bg-circle sh-bg-circle-1"></div>
        <div className="sh-hero-bg-circle sh-bg-circle-2"></div>

        <div className="container">
          <div className="row align-items-center sh-hero-row">
            {/* ================= LEFT CONTENT ================= */}
            <div className="col-lg-6 col-md-12">
              <div className="sh-hero-content">
                {/* Small Label */}
                <div className="sh-hero-label">
                  <span className="sh-label-dot"></span>
                  SAFEHER COMMUNITY SAFETY PLATFORM
                </div>

                {/* Main Heading */}
                <h1>
                  Feel Safe.
                  <br />
                  <span>Stay Connected.</span>
                </h1>

                {/* Description */}
                <p>
                  SafeHer is here to help you stay connected, informed, and
                  prepared. Get quick access to emergency assistance, trusted
                  contacts, safety maps, and community safety information
                  whenever you need it.
                </p>

                {/* Buttons */}
                <div className="sh-hero-buttons">
                  {/* Get Started */}
                  <a href="/register" className="sh-primary-btn">
                    Get Started
                    <i className="fa-solid fa-arrow-right"></i>
                  </a>

                  {/* SOS BUTTON WITH LIVE LOGIN CHECK & GPS SHARING */}
                  <button
                    type="button"
                    onClick={handleSOSClick}
                    className="safeher-sos-button"
                    style={{ border: "none", cursor: "pointer" }}
                    title="Activate Emergency SOS"
                  >
                    <span className="safeher-sos-icon">
                      <i className="fa-solid fa-triangle-exclamation"></i>
                    </span>

                    <span className="safeher-sos-text">SOS</span>
                  </button>
                </div>

                {/* Safety Trust */}
                <div className="sh-hero-trust">
                  <div className="sh-trust-icon">
                    <i className="fa-solid fa-shield-halved"></i>
                  </div>

                  <div className="sh-trust-text">
                    <strong>Built for everyday safety</strong>
                    <span>Stay aware. Stay prepared. Stay connected.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= RIGHT VISUAL ================= */}
            <div className="col-lg-6 col-md-12">
              <div className="sh-hero-visual">
                {/* Large background circle */}
                <div className="sh-hero-circle-bg"></div>

                {/* Main circular image */}
                <div className="sh-hero-image">
                  <img
                    src="/assets/images/all-img/woman-user3.png"
                    alt="Woman walking safely in the city"
                  />
                </div>

                {/* Small decorative ring */}
                <div className="sh-hero-ring"></div>

                {/* Small floating dot */}
                <div className="sh-hero-dot"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHY SAFEHER ================= */}
      <section className="why-safeher">
        <div className="container">
          <div className="why-title">
            <span>WHY SAFEHER</span>
            <h2>
              Safety made <strong>simple.</strong>
            </h2>
            <p>Everything you need to stay aware, prepared and connected.</p>
          </div>

          <div className="row align-items-center">
            {/* IMAGE */}
            <div className="col-lg-5 mb-4 mb-lg-0">
              <div className="why-image">
                <img
                  src="/assets/images/all-img/hero-second.png"
                  alt="SafeHer Safety"
                />

                <div className="why-image-badge">
                  <i className="fa-solid fa-shield-heart"></i>
                  <span>YOUR SAFETY MATTERS</span>
                </div>
              </div>
            </div>

            {/* CONTENT */}
            <div className="col-lg-7">
              <div className="why-content">
                <span className="why-label">SAFETY WITH PURPOSE</span>

                <h3>Be aware. Be prepared.</h3>

                <p>
                  SafeHer brings safety information, community awareness and
                  practical resources together in one place.
                </p>

                {/* CARDS */}
                <div className="why-cards">
                  <div className="why-card">
                    <i className="fa-solid fa-circle-info"></i>
                    <div>
                      <h4>Stay Informed</h4>
                      <p>Get important safety information easily.</p>
                    </div>
                  </div>

                  <div className="why-card">
                    <i className="fa-solid fa-location-dot"></i>
                    <div>
                      <h4>Know Your Area</h4>
                      <p>Understand incidents around you.</p>
                    </div>
                  </div>

                  <div className="why-card">
                    <i className="fa-solid fa-book-open"></i>
                    <div>
                      <h4>Learn Safety</h4>
                      <p>Discover practical safety guidance.</p>
                    </div>
                  </div>

                  <div className="why-card">
                    <i className="fa-solid fa-people-group"></i>
                    <div>
                      <h4>Stay Connected</h4>
                      <p>Build a safer and supportive community.</p>
                    </div>
                  </div>

                  {/* DISCOVER BUTTON */}
                  <a href="/about" className="why-discover-btn">
                    Discover SafeHer
                    <i className="fa-solid fa-arrow-right"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SAFETY NETWORK ================= */}
      <section className="sh-network-section">
        <div className="container">
          <div className="sh-section-heading light">
            <span>HOW SAFEHER HELPS</span>

            <h2>
              A safer experience starts with
              <strong> awareness.</strong>
            </h2>

            <p>
              SafeHer brings different aspects of personal and community safety
              together so you can access the right information when you need it.
            </p>
          </div>

          <div className="row">
            {/* EMERGENCY */}
            <div className="col-lg-4 col-md-6">
              <div className="sh-network-card">
                <div className="sh-network-number">01</div>

                <div className="sh-network-icon emergency">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                </div>

                <h3>Emergency Support</h3>

                <p>
                  Be prepared for unexpected situations with quick access to
                  emergency-related safety resources.
                </p>

                <span className="sh-network-line"></span>
              </div>
            </div>

            {/* COMMUNITY */}
            <div className="col-lg-4 col-md-6">
              <div className="sh-network-card">
                <div className="sh-network-number">02</div>

                <div className="sh-network-icon community">
                  <i className="fa-solid fa-people-group"></i>
                </div>

                <h3>Community Awareness</h3>

                <p>
                  Learn from safety reports and community information to
                  understand what is happening around you.
                </p>

                <span className="sh-network-line"></span>
              </div>
            </div>

            {/* INFORMATION */}
            <div className="col-lg-4 col-md-6">
              <div className="sh-network-card">
                <div className="sh-network-number">03</div>

                <div className="sh-network-icon information">
                  <i className="fa-solid fa-book-open"></i>
                </div>

                <h3>Safety Knowledge</h3>

                <p>
                  Explore practical guides and resources that help you develop
                  safer habits in everyday situations.
                </p>

                <span className="sh-network-line"></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SAFETY MAP PREVIEW ================= */}
      <section className="sh-map-section">
        <div className="container">
          {/* SECTION HEADING */}
          <div className="sh-map-heading">
            <span className="sh-small-label">SAFETY MAP</span>

            <h2>
              See what's happening
              <strong> around you.</strong>
            </h2>

            <p>
              Explore admin-managed safety areas and check whether locations are
              marked Safe or Caution before you head out.
            </p>
          </div>

          <div className="row align-items-center">
            {/* ================= LEFT CONTENT ================= */}
            <div className="col-lg-5 col-md-12">
              <div className="sh-map-content">
                <span className="sh-map-mini-label">
                  KNOW YOUR SURROUNDINGS
                </span>

                <h3>
                  Make informed decisions
                  <br />
                  <strong>before you go.</strong>
                </h3>

                <p>
                  SafeHer helps you understand your surroundings with safety
                  information maintained by the admin, helping you make more
                  informed travel decisions.
                </p>

                {/* SAFETY STATUS CARDS */}
                <div className="sh-map-status">
                  <div className="sh-status-card">
                    <div className="sh-status-icon safe">
                      <i className="fa-solid fa-shield-heart"></i>
                    </div>

                    <div className="sh-status-text">
                      <strong>Safer Areas</strong>
                      <span>{safeCount} areas marked Safe</span>
                    </div>
                  </div>

                  <div className="sh-status-card">
                    <div className="sh-status-icon caution">
                      <i className="fa-solid fa-triangle-exclamation"></i>
                    </div>

                    <div className="sh-status-text">
                      <strong>Caution Areas</strong>
                      <span>{cautionCount} areas marked Caution</span>
                    </div>
                  </div>
                </div>

                {/* BUTTON */}
                <a href="/safetymap" className="sh-map-main-btn">
                  Explore Safety Map
                  <i className="fa-solid fa-arrow-right"></i>
                </a>
              </div>
            </div>

            {/* ================= MAP PREVIEW ================= */}
            <div className="col-lg-7 col-md-12">
              <div className="sh-map-preview">
                {/* MAP */}
                <div className="sh-map-frame">
                  {/* MAP MARKERS */}

                  <MapContainer
                    center={[22.3072, 73.1812]}
                    zoom={12}
                    scrollWheelZoom={false}
                    style={{
                      width: "100%",
                      height: "100%",
                      minHeight: "350px",
                    }}
                  >
                    <TileLayer
                      attribution="&copy; OpenStreetMap contributors"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {safetyAreas.map((area) => {
                      const latitude = Number(area.latitude);
                      const longitude = Number(area.longitude);

                      if (
                        !Number.isFinite(latitude) ||
                        !Number.isFinite(longitude) ||
                        latitude < -90 ||
                        latitude > 90 ||
                        longitude < -180 ||
                        longitude > 180
                      ) {
                        return null;
                      }

                      return (
                        <Marker
                          key={area._id || area.areaId}
                          position={[latitude, longitude]}
                          icon={area.type === "Safe" ? safeIcon : cautionIcon}
                        >
                          <Popup>
                            <strong>{area.location}</strong>
                            <br />
                            Status: {area.type}
                            <br />
                            {area.description}
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MapContainer>

                  {/* BOTTOM INFO CARD */}

                  <div className="sh-map-info-card">
                    <div className="sh-map-info-icon">
                      <i className="fa-solid fa-location-dot"></i>
                    </div>

                    <div>
                      <strong>Safety information</strong>
                      <span>View incidents and area conditions</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS PREVIEW ================= */}
      <section className="sh-process-section">
        <div className="container">
          {/* SECTION HEADING */}
          <div className="sh-process-heading">
            <span>THE SAFEHER APPROACH</span>

            <h2>
              Safety is stronger when we
              <strong> work together.</strong>
            </h2>

            <p>
              SafeHer combines personal awareness, emergency resources and
              community information into one connected safety platform.
            </p>
          </div>

          {/* PROCESS */}
          <div className="sh-process-wrapper">
            <div className="sh-process-line"></div>

            {/* STEP 01 */}
            <div className="sh-process-item">
              <div className="sh-process-icon">
                <i className="fa-solid fa-location-crosshairs"></i>
              </div>

              <span>01</span>

              <h3>Know Your Safety</h3>

              <p>
                Understand your surroundings and access useful safety
                information.
              </p>
            </div>

            {/* STEP 02 */}
            <div className="sh-process-item">
              <div className="sh-process-icon">
                <i className="fa-solid fa-user-shield"></i>
              </div>

              <span>02</span>

              <h3>Build Your Safety Circle</h3>

              <p>
                Add trusted contacts and keep the people who matter ready when
                you need support.
              </p>
            </div>

            {/* STEP 03 */}
            <div className="sh-process-item">
              <div className="sh-process-icon">
                <i className="fa-solid fa-hand-holding-heart"></i>
              </div>

              <span>03</span>

              <h3>Get Help When It Matters</h3>

              <p>
                Use emergency support and connect with the SafeHer community
                when a situation requires help.
              </p>
            </div>
          </div>

          {/* BOTTOM LINK */}
          <div className="sh-centered-link">
            <a href="/howitworks" className="sh-text-link">
              See How SafeHer Works
              <i className="fa-solid fa-arrow-right"></i>
            </a>
          </div>
        </div>
      </section>

      {/* ================= SAFETY RESOURCES ================= */}
      <section className="sh-resources-section">
        <div className="container">
          <div className="sh-resource-heading-row">
            <div>
              <span className="sh-small-label">SAFETY RESOURCES</span>

              <h2>
                Knowledge can make a<strong> difference.</strong>
              </h2>
            </div>

            <a href="/safetyresources" className="sh-outline-btn">
              View All Resources
              <i className="fa-solid fa-arrow-right"></i>
            </a>
          </div>

          <div className="row">
            {/* LARGE ARTICLE */}
            <div className="col-lg-7 col-md-12">
              <article className="sh-feature-article">
                <div className="sh-feature-article-image">
                  <img
                    src="/assets/images/all-img/safety-personal.png"
                    alt="Personal safety"
                  />

                  <span>PERSONAL SAFETY</span>
                </div>

                <div className="sh-feature-article-content">
                  <h3>Simple safety habits every woman should know</h3>

                  <p>
                    Practical habits that can help you stay alert, prepared and
                    confident in everyday situations.
                  </p>

                  <a href="/safetyresources">
                    Read Guide
                    <i className="fa-solid fa-arrow-right"></i>
                  </a>
                </div>
              </article>
            </div>

            {/* SMALL ARTICLES */}
            <div className="col-lg-5 col-md-12">
              <article className="sh-resource-small">
                <img
                  src="/assets/images/all-img/safety-digital.png"
                  alt="Digital safety"
                />

                <div>
                  <span>DIGITAL SAFETY</span>

                  <h4>Protect your personal information online</h4>

                  <a href="/safetyresources">
                    Explore
                    <i className="fa-solid fa-arrow-right"></i>
                  </a>
                </div>
              </article>

              <article className="sh-resource-small">
                <img
                  src="/assets/images/all-img/safety-emergency.png"
                  alt="Emergency safety"
                />

                <div>
                  <span>EMERGENCY</span>

                  <h4>What to do when you feel unsafe</h4>

                  <a href="/safetyresources">
                    Explore
                    <i className="fa-solid fa-arrow-right"></i>
                  </a>
                </div>
              </article>

              <article className="sh-resource-small">
                <img
                  src="/assets/images/all-img/safety-transport.png"
                  alt="Travel safety"
                />

                <div>
                  <span>TRAVEL SAFETY</span>

                  <h4>Smart precautions when travelling alone</h4>

                  <a href="/safetyresources">
                    Explore
                    <i className="fa-solid fa-arrow-right"></i>
                  </a>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SAFETY AWARENESS ================= */}
      <section className="sh-awareness-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 col-md-12">
              <div className="sh-awareness-image">
                <img
                  src="/assets/images/all-img/resources3.png"
                  alt="Woman walking safely"
                />

                <div className="sh-awareness-badge">
                  <i className="fa-solid fa-shield-heart"></i>
                  <div>
                    <strong>Stay Prepared</strong>
                    <span>Everyday safety matters</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6 col-md-12">
              <div className="sh-awareness-content">
                <span className="sh-small-label">SAFETY AWARENESS</span>

                <h2>
                  Small habits can make a<strong> big difference.</strong>
                </h2>

                <p>
                  Staying safe is not only about responding to emergencies. It
                  is also about being prepared before something happens.
                </p>

                <div className="sh-awareness-list">
                  <div>
                    <i className="fa-solid fa-mobile-screen"></i>
                    <div>
                      <strong>Keep your phone ready</strong>
                      <span>Keep it charged and accessible.</span>
                    </div>
                  </div>

                  <div>
                    <i className="fa-solid fa-lightbulb"></i>
                    <div>
                      <strong>Stay aware</strong>
                      <span>Pay attention to your surroundings.</span>
                    </div>
                  </div>

                  <div>
                    <i className="fa-solid fa-route"></i>
                    <div>
                      <strong>Choose safer routes</strong>
                      <span>Prefer well-lit and populated areas.</span>
                    </div>
                  </div>

                  <div>
                    <i className="fa-solid fa-person-walking"></i>
                    <div>
                      <strong>Trust your instincts</strong>
                      <span>
                        Move to a safer place if something feels wrong.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="sh-final-cta">
        <div className="sh-final-bg"></div>

        <div className="container">
          <div className="sh-final-content">
            <span>SAFEHER</span>

            <h2>
              Because Every Woman
              <br />
              Deserves to Feel <strong>Safe.</strong>
            </h2>

            <p>Stay informed. Stay prepared. Be part of a safer community.</p>

            <div className="sh-final-buttons">
              <a href="/register" className="sh-final-primary">
                Get Started
                <i className="fa-solid fa-arrow-right"></i>
              </a>

              <a href="/about" className="sh-final-secondary">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FLOATING AI ================= */}
      <div className="sh-ai-float">
        <button
          type="button"
          className="sh-ai-button"
          title="Ask SafeHer AI"
          aria-label="Ask SafeHer AI"
        >
          <i className="fa-solid fa-robot"></i>
          <span className="sh-ai-label">SafeHer AI</span>
          <span className="sh-ai-status" aria-hidden="true"></span>
        </button>
      </div>
    </div>
  );
}

export default Home;
