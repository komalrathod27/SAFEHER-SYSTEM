import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import "../safeher-css/header.css";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState("");
  const location = useLocation();

  const userSession = JSON.parse(localStorage.getItem("mydata") || "null");
  const isLoggedIn = Boolean(userSession);
  const currentPath = location.pathname.replace(/\/$/, "") || "/";

  useEffect(() => {
    let isMounted = true;

    async function loadProfilePhoto() {
      if (!userSession?.user_id) {
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:3000/api/getwomanuserdetails/${userSession.user_id}`,
        );
        if (isMounted) {
          setProfilePhoto(response.data.profile_photo || "");
        }
      } catch (error) {
        console.error("Header profile photo fetch error:", error);
      }
    }

    loadProfilePhoto();
    window.addEventListener("womanProfileUpdated", loadProfilePhoto);

    return () => {
      isMounted = false;
      window.removeEventListener("womanProfileUpdated", loadProfilePhoto);
    };
  }, [location.pathname, userSession?.user_id]);

  function logout() {
    localStorage.clear();
    window.location = "/";
  }

  const guestLinks = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Safety Map", path: "/safetymap" },
    { label: "Safety Resources", path: "/safetyresources" },
    { label: "How It Works", path: "/howitworks" },
  ];

  const userLinks = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Trusted Contacts", path: "/trustedcontacts" },
    { label: "Report Incident", path: "/reportincident" },
    { label: "My Reports", path: "/myreports" },
  ];

  const links = isLoggedIn ? userLinks : guestLinks;

  return (
    <header className="safeher-header">
      <div className="safeher-header-inner">
        {/* LOGO */}
        <a href="/" className="safeher-header-logo" aria-label="SafeHer home">
          <img src="/assets/images/all-img/SafeHer logo.png" alt="SafeHer" />
        </a>

        {/* MOBILE TOGGLE */}
        <button
          type="button"
          className={`safeher-header-toggle ${menuOpen ? "is-open" : ""}`}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* MENU + ACTIONS */}
        <div className={`safeher-header-collapse ${menuOpen ? "is-open" : ""}`}>
          <nav className="safeher-header-nav" aria-label="Main menu">
            <ul>
              {links.map((link) => {
                const isActive = currentPath === link.path;
                return (
                  <li key={link.label}>
                    <a
                      href={link.path}
                      className={isActive ? "active" : ""}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="safeher-header-actions">
            {!isLoggedIn ? (
              <a className="safeher-header-register" href="/register">
                Register Now
                <i className="fa-solid fa-arrow-right"></i>
              </a>
            ) : (
              <div className="safeher-header-profile">
                <button type="button" className="safeher-header-profile-btn">
                  {profilePhoto ? (
                    <img
                      className="safeher-header-avatar"
                      src={
                        profilePhoto.startsWith("http")
                          ? profilePhoto
                          : `http://localhost:3000/public/${encodeURIComponent(profilePhoto)}`
                      }
                      alt=""
                    />
                  ) : (
                    <i className="fa-regular fa-circle-user"></i>
                  )}
                  <span>My Profile</span>
                  <i className="fa-solid fa-chevron-down safeher-header-arrow"></i>
                </button>

                <div className="safeher-header-profile-menu">
                  <a href="/profile">
                    <i className="fa-regular fa-user"></i>
                    My Profile
                  </a>

                  <a href="#" onClick={logout}>
                    <i className="fa-solid fa-right-from-bracket"></i>
                    Logout
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
