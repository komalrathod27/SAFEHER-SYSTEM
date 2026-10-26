import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import Axios from "axios";
import "../safeher-css/safetymap.css";

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

function MapCenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15);
    }
  }, [position, map]);
  return null;
}

function MyLocationControl({ onClick }) {
  return (
    <div className="leaflet-bottom leaflet-right sm-my-location-control">
      <div className="leaflet-control">
        <button
          type="button"
          className="sm-location-button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onClick();
          }}
        >
          <i className="fa-solid fa-crosshairs"></i>
          My Location
        </button>
      </div>
    </div>
  );
}

function SafetyMap() {
  const [safetyAreas, setSafetyAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState("");
  const [mapCenter, setMapCenter] = useState([22.3072, 73.1812]);
  const [searchLocation, setSearchLocation] = useState("");
  const [searchError, setSearchError] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    const getSafetyAreas = async () => {
      try {
        const response = await Axios.get(
          "http://localhost:3000/api/getsafetyareas",
        );
        setSafetyAreas(response.data);
      } catch (error) {
        console.error("Error fetching safety areas:", error);
        setMapError("Unable to load safety areas. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    getSafetyAreas();
  }, []);

  const safeCount = safetyAreas.filter((area) => area.type === "Safe").length;

  const cautionCount = safetyAreas.filter(
    (area) => area.type === "Caution",
  ).length;

  const handleSearch = () => {
    const query = searchLocation.trim().toLowerCase();
    if (!query) {
      setSearchError("Please enter an area name.");
      return;
    }
    const area = safetyAreas.find((item) => {
      const location = String(item.location || "").toLowerCase();
      const areaId = String(item.areaId || "").toLowerCase();
      return location.includes(query) || areaId === query;
    });

    if (!area) {
      setSearchError("No matching safety area found.");
      console.log("Available safety areas:", safetyAreas);
      return;
    }

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
      setSearchError("This area's coordinates are invalid.");
      return;
    }
    setSearchError("");
    setMapCenter([latitude, longitude]);
  };

  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = [
          position.coords.latitude,
          position.coords.longitude,
        ];

        setUserLocation(coordinates);
        setMapCenter(coordinates);
      },
      () => {
        setLocationError(
          "Unable to get your location. Please allow location access.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  return (
    <div className="safeher-safety-map">
      {/*  HERO */}
      <section className="sm-hero">
        <div className="sm-hero-overlay"></div>
        <div className="container">
          <div className="sm-hero-content">
            <span className="sm-hero-tag">
              <i className="fa-solid fa-location-dot"></i>
              SAFEHER SAFETY INTELLIGENCE
            </span>
            <h1>
              Know Your
              <span> Surroundings.</span>
            </h1>
            <p>
              Explore safety areas and caution areas to make more informed
              decisions about the places around you.
            </p>
            <div className="sm-hero-status">
              <span className="sm-live-dot"></span>
              Community safety information
              <span className="sm-status-divider"></span>
              Updated regularly
            </div>
          </div>
        </div>
      </section>

      {/* SAFETY INTELLIGENCE / MAP */}
      <section className="sm-intelligence-section">
        <div className="container">
          {/* SECTION HEADING */}
          <div className="sm-section-heading">
            <div>
              <span className="sm-eyebrow">SAFETY INTELLIGENCE</span>
              <h2>Explore your surroundings</h2>
            </div>
            <p>
              View community-reported safety information before travelling
              through an area.
            </p>
          </div>

          {/* MAIN MAP LAYOUT */}
          <div className="sm-map-layout">
            {/* ================= MAP ================= */}
            <div className="sm-map-card">
              {/* MAP TOP BAR */}
              <div className="sm-map-topbar">
                <div className="sm-location-search">
                  <i className="fa-solid fa-magnifying-glass"></i>
                  <input
                    type="text"
                    placeholder="Search a safety area..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch();
                    }}
                  />
                </div>

                <button
                  type="button"
                  className="sm-search-btn"
                  onClick={handleSearch}
                >
                  Search
                </button>
              </div>

              {searchError && (
                <div className="sm-search-validation" role="alert">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{searchError}</span>
                </div>
              )}

              {/* MAP */}
              <div className="sm-map">
                {loading ? (
                  <p>Loading safety map...</p>
                ) : mapError ? (
                  <p>{mapError}</p>
                ) : (
                  <MapContainer
                    center={mapCenter}
                    zoom={13}
                    scrollWheelZoom={true}
                    style={{
                      height: "100%",
                      width: "100%",
                      minHeight: "450px",
                    }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <MapCenter position={mapCenter} />

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
                            <br />
                            Area ID: {area.areaId}
                          </Popup>
                        </Marker>
                      );
                    })}

                    {userLocation && (
                      <Marker position={userLocation}>
                        <Popup>Your current location</Popup>
                      </Marker>
                    )}
                    <MyLocationControl onClick={handleMyLocation} />
                  </MapContainer>
                )}

                {locationError && (
                  <div className="sm-search-validation" role="alert">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span>{locationError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* ================= AREA STATUS ================= */}
            <div className="sm-status-card">
              <div className="sm-status-header">
                <div>
                  <span className="sm-eyebrow">AREA STATUS</span>
                  <h3>Safety overview</h3>
                </div>
                <div className="sm-status-live">
                  <span></span>
                  Live
                </div>
              </div>

              {/* STATUS ITEM */}
              <div className="sm-status-item">
                <div className="sm-status-icon safe-status-icon">
                  <i className="fa-solid fa-shield-heart"></i>
                </div>
                <div className="sm-status-content">
                  <strong>{safeCount}</strong>
                  <span>Safe Areas</span>
                </div>
                <i className="fa-solid fa-arrow-up-right"></i>
              </div>
              <div className="sm-status-item">
                <div className="sm-status-icon caution-status-icon">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                </div>
                <div className="sm-status-content">
                  <strong>{cautionCount}</strong>
                  <span>Caution Areas</span>
                </div>
                <i className="fa-solid fa-arrow-up-right"></i>
              </div>

              {/* STATUS MESSAGE */}
              <div className="sm-status-message">
                <div className="sm-status-message-icon">
                  <i className="fa-solid fa-shield"></i>
                </div>
                <div>
                  <strong>Stay aware</strong>
                  <p>
                    Check recent reports before travelling through unfamiliar
                    areas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RECENT REPORTS*/}

      {/* =====================================================
          SAFETY NOTE
      ===================================================== */}
      <section className="sm-awareness-section">
        <div className="container">
          <div className="sm-awareness">
            <div className="sm-awareness-icon">
              <i className="fa-solid fa-shield-heart"></i>
            </div>
            <div className="sm-awareness-content">
              <span>SAFEHER SAFETY REMINDER</span>
              <h2>Information helps you stay prepared.</h2>
              <p>
                Safety Map information is provided for awareness purposes.
                Conditions can change, so always use your own judgement and
                follow appropriate local safety guidance.
              </p>
            </div>
            <div className="sm-awareness-arrow">
              <i className="fa-solid fa-arrow-right"></i>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SafetyMap;
