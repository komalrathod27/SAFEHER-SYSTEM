import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Axios from "axios";
import { io } from "socket.io-client";

function Sidebar({ onClose }) {
  const [pendingSosCount, setPendingSosCount] = useState(0);

  const storedData =
    sessionStorage.getItem("mydata") || localStorage.getItem("mydata");

  const volunteerData = storedData ? JSON.parse(storedData) : null;
  const volunteerId = volunteerData?.user_id;

  useEffect(() => {
    const fetchCount = () => {
      Axios.get("http://localhost:3000/api/sos/all")
        .then((res) => {
          if (res.data && res.data.requests) {
            const pendingList = res.data.requests.filter(
              (r) =>
                r.status === "Pending" &&
                !r.rejectedByVolunteerIds?.includes(String(volunteerId)),
            );
            setPendingSosCount(pendingList.length);
          }
        })
        .catch(() => {});
    };

    fetchCount();

    // Socket.IO real-time listener (Replaced Polling)
    const socket = io("http://localhost:3000", {
      transports: ["polling", "websocket"],
    });

    socket.on("connect", () => {
      socket.emit("join_volunteers");
    });

    socket.on("new_sos_alert", fetchCount);
    socket.on("sos_updated", fetchCount);
    socket.on("sos_approved", fetchCount);
    socket.on("sos_resolved", fetchCount);
    socket.on("sos_cancelled", fetchCount);
    socket.on("sos_rejected", fetchCount);

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const sidebar = document.querySelector(".menu-sidebar");
    if (!sidebar) return undefined;

    /* =========================================
       SUBMENU TOGGLE
    ========================================= */

    const handleArrowClick = (event) => {
      const arrow = event.target.closest(".js-arrow");

      if (!arrow || !sidebar.contains(arrow)) return;

      event.preventDefault();

      const submenu = arrow.nextElementSibling;

      if (!submenu || !submenu.classList.contains("js-sub-list")) {
        return;
      }

      const isOpen = arrow.classList.toggle("open");

      submenu.style.display = isOpen ? "block" : "none";
    };

    sidebar.addEventListener("click", handleArrowClick);

    /* =========================================
       DETECT COLLAPSED SIDEBAR
    ========================================= */

    const updateSidebarState = () => {
      const sidebarWidth = sidebar.getBoundingClientRect().width;

      if (sidebarWidth < 200) {
        sidebar.classList.add("safeher-collapsed");
      } else {
        sidebar.classList.remove("safeher-collapsed");
      }
    };

    updateSidebarState();

    const resizeObserver = new ResizeObserver(() => {
      updateSidebarState();
    });

    resizeObserver.observe(sidebar);

    window.addEventListener("resize", updateSidebarState);

    return () => {
      sidebar.removeEventListener("click", handleArrowClick);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateSidebarState);
    };
  }, []);

  /* =========================================
     ACTIVE MENU FUNCTION
  ========================================= */

  const menuClass = ({ isActive }) =>
    isActive ? "safeher-nav-link active" : "safeher-nav-link";

  return (
    <>
      <style>
        {`
          /* =========================================
             SAFEHER VOLUNTEER THEME
          ========================================= */

          .menu-sidebar {
            background: #ffffff !important;
            border-right: 1px solid #e5e7eb;
          }

          /* =========================================
             LOGO
          ========================================= */

          .menu-sidebar .logo {
            background: #ffffff !important;
            border-bottom: 1px solid #e5e7eb;

            display: flex;
            align-items: center;
            justify-content: center;

            min-height: 90px;
            height: 90px;

            padding: 8px 18px;

            position: relative;
            box-sizing: border-box;
          }

          .safeher-logo-link {
            display: flex;
            align-items: center;
            justify-content: center;

            text-decoration: none;

            width: 100%;
            height: 100%;
          }

          .safeher-logo-image {
            width: 190px;
            height: 48px;

            object-fit: contain;
            object-position: center;

            display: block;
          }

          /* =========================================
             CLOSE BUTTON
          ========================================= */

          .menu-sidebar .sidebar-close {
            color: #198754;
            background: #f0fdf4;

            border: none;
            border-radius: 7px;

            width: 34px;
            height: 34px;

            display: flex;
            align-items: center;
            justify-content: center;

            cursor: pointer;

            transition: all 0.2s ease;
          }

          .menu-sidebar .sidebar-close:hover {
            background: #198754;
            color: #ffffff;
          }

          /* =========================================
             SIDEBAR CONTENT
          ========================================= */

          .menu-sidebar__content {
            background: #ffffff !important;
          }

          .navbar-sidebar {
            padding-top: 12px;
          }

          /* =========================================
             MENU LIST
          ========================================= */

          .navbar__list > li {
            margin-bottom: 2px;
          }

          /* =========================================
             NORMAL MENU LINK
          ========================================= */

          .navbar__list > li > a.safeher-nav-link {
            color: #172554 !important;

            background: transparent !important;

            border-radius: 8px;

            transition:
              background 0.2s ease,
              color 0.2s ease,
              transform 0.2s ease,
              box-shadow 0.2s ease;

            font-weight: 500;

            font-size: 15px;

            display: flex;
            align-items: center;

            min-height: 46px;

            padding-top: 10px;
            padding-bottom: 10px;
          }

          /* =========================================
             MENU ICON
          ========================================= */

          .navbar__list > li > a.safeher-nav-link i {
            color: #475569 !important;

            font-size: 16px;

            transition: color 0.2s ease;

            flex-shrink: 0;
          }

          /* =========================================
             MENU TEXT
          ========================================= */

          .safeher-menu-text {
            display: inline-block;

            white-space: nowrap;

            transition:
              opacity 0.15s ease,
              visibility 0.15s ease;
          }

          /* =========================================
             HOVER
             
             IMPORTANT:
             Hover is LIGHT green.
          ========================================= */

          .navbar__list > li > a.safeher-nav-link:hover {
            background: #f0fdf4 !important;
            color: #198754 !important;

            transform: translateX(2px);
          }

          .navbar__list > li > a.safeher-nav-link:hover i {
            color: #198754 !important;
          }

          /* =========================================
             ACTIVE MENU
             
             IMPORTANT:
             Only the current URL gets this style.
          ========================================= */

          .navbar__list > li > a.safeher-nav-link.active {
            background: #198754 !important;
            color: #ffffff !important;

            box-shadow:
              0 5px 12px rgba(25, 135, 84, 0.18);

            font-weight: 600;

            transform: none;
          }

          .navbar__list > li > a.safeher-nav-link.active i {
            color: #ffffff !important;
          }

          /* =========================================
             ACTIVE MENU HOVER
          ========================================= */

          .navbar__list > li > a.safeher-nav-link.active:hover {
            background: #198754 !important;
            color: #ffffff !important;

            transform: none;
          }

          .navbar__list > li > a.safeher-nav-link.active:hover i {
            color: #ffffff !important;
          }

          /* =========================================
             SUBMENU
          ========================================= */

          .navbar__sub-list {
            padding-left: 0 !important;
            margin-top: 3px;
          }

          .navbar__sub-list li a {
            color: #64748b !important;

            transition: all 0.2s ease;

            border-radius: 7px;

            font-size: 14px;
          }

          .navbar__sub-list li a:hover {
            color: #198754 !important;
            background: #f0fdf4 !important;
          }

          .navbar__sub-list li.active a {
            color: #198754 !important;
            background: #f0fdf4 !important;
            font-weight: 600;
          }

          /* =========================================
             SECTION TITLES
          ========================================= */

          .safeher-section-title {
            color: #94a3b8;

            font-size: 11px;

            font-weight: 700;

            letter-spacing: 1.3px;

            text-transform: uppercase;

            padding: 14px 20px 7px;

            margin-top: 8px;

            white-space: nowrap;

            overflow: hidden;

            transition:
              opacity 0.15s ease,
              visibility 0.15s ease,
              height 0.15s ease,
              padding 0.15s ease,
              margin 0.15s ease;
          }

          /* =========================================
             SOS BADGE
          ========================================= */

          .safeher-sos-badge {
            margin-left: auto;

            min-width: 23px;
            height: 23px;

            padding: 0 7px;

            border-radius: 20px;

            background: #22c55e;

            color: #ffffff;

            font-size: 11px;

            font-weight: 700;

            display: flex;
            align-items: center;
            justify-content: center;
          }

          /* =========================================
             DIVIDER
          ========================================= */

          .safeher-sidebar-divider {
            height: 1px;

            background: #e8edf2;

            margin: 15px 20px;
          }

          /* =========================================
             VOLUNTEER THEME
          ========================================= */

          .safeher-volunteer-label {
            color: #198754;

            font-size: 10px;

            font-weight: 700;

            letter-spacing: 1.2px;

            text-transform: uppercase;

            text-align: center;

            margin-top: 3px;
          }

          /* =========================================
             COLLAPSED SIDEBAR
          ========================================= */

          .menu-sidebar.safeher-collapsed {
            overflow: hidden;
          }

          /* Hide section headings */

          .menu-sidebar.safeher-collapsed
          .safeher-section-title {
            opacity: 0 !important;
            visibility: hidden !important;

            height: 0 !important;

            padding-top: 0 !important;
            padding-bottom: 0 !important;

            margin-top: 0 !important;
            margin-bottom: 0 !important;
          }

          /* Hide menu text */

          .menu-sidebar.safeher-collapsed
          .safeher-menu-text {
            opacity: 0 !important;
            visibility: hidden !important;

            width: 0 !important;

            display: none !important;
          }

          /* Hide SOS badge */

          .menu-sidebar.safeher-collapsed
          .safeher-sos-badge {
            display: none !important;
          }

          /* Hide divider */

          .menu-sidebar.safeher-collapsed
          .safeher-sidebar-divider {
            opacity: 0 !important;

            height: 0 !important;

            margin: 0 !important;
          }

          /* Keep menu links icon-only */

          .menu-sidebar.safeher-collapsed
          .navbar__list > li > a.safeher-nav-link {
            justify-content: center !important;

            padding-left: 0 !important;
            padding-right: 0 !important;

            width: 100%;

            transform: none !important;
          }

          /* Keep icons centered */

          .menu-sidebar.safeher-collapsed
          .navbar__list > li > a.safeher-nav-link i {
            margin-right: 0 !important;
            margin-left: 0 !important;
          }

          /* =========================================
             COLLAPSED LOGO
          ========================================= */

          .menu-sidebar.safeher-collapsed
          .safeher-logo-link {
            width: auto;
          }

          .menu-sidebar.safeher-collapsed
          .safeher-logo-image {
            width: 40px;
            height: 40px;
            object-fit: cover;
            object-position: left center;
          }

          /* =========================================
             COLLAPSED CLOSE BUTTON
          ========================================= */

          .menu-sidebar.safeher-collapsed
          .sidebar-close {
            display: none;
          }

          /* =========================================
             MOBILE
          ========================================= */

          @media (max-width: 991px) {

            .safeher-logo-image {
              width: 175px;
              height: 44px;
            }

            .navbar__list > li > a.safeher-nav-link {
              font-size: 15px;
            }

          }
        `}
      </style>

      {/* =========================================
          SIDEBAR
      ========================================= */}

      <aside className="menu-sidebar" id="main-sidebar">
        {/* =========================================
            LOGO
        ========================================= */}

        <div className="logo">
          <NavLink
            className="safeher-logo-link"
            to="/dashboard"
            aria-label="SafeHer Volunteer Dashboard"
          >
            <img
              src="/images/icon/volunteer-logo.png"
              alt="SafeHer Volunteer"
              className="safeher-logo-image"
            />
            <img
              src="/images/icon/volunteer-mini.png"
              alt=""
              aria-hidden="true"
              className="safeher-mini-logo-image"
            />
          </NavLink>

          <button
            className="sidebar-close js-sidebar-toggle"
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>

        {/* =========================================
            SIDEBAR CONTENT
        ========================================= */}

        <div className="menu-sidebar__content js-scrollbar1">
          <nav className="navbar-sidebar">
            <ul className="list-unstyled navbar__list">
              {/* =====================================
                  MAIN
              ===================================== */}

              <li>
                <div className="safeher-section-title">Main</div>
              </li>

              <li>
                <NavLink to="/dashboard" className={menuClass}>
                  <i className="fa-solid fa-gauge-high"></i>

                  <span className="safeher-menu-text">Dashboard</span>
                </NavLink>
              </li>

              {/* =====================================
                  EMERGENCY
              ===================================== */}

              <li>
                <div className="safeher-section-title">Emergency</div>
              </li>

              <li>
                <NavLink to="/sosrequests" className={menuClass}>
                  <i className="fa-solid fa-triangle-exclamation"></i>

                  <span className="safeher-menu-text">SOS Requests</span>

                  {pendingSosCount > 0 && (
                    <span className="safeher-sos-badge">{pendingSosCount}</span>
                  )}
                </NavLink>
              </li>

              {/* =====================================
                  COMMUNITY
              ===================================== */}

              <li>
                <div className="safeher-section-title">Community</div>
              </li>

              <li>
                <NavLink to="/incidentreports" className={menuClass}>
                  <i className="fa-solid fa-file-circle-exclamation"></i>

                  <span className="safeher-menu-text">Incident Reports</span>
                </NavLink>
              </li>

              {/* =====================================
                  MY ACTIVITY
              ===================================== */}

              <li>
                <div className="safeher-section-title">My Activity</div>
              </li>

              <li>
                <NavLink to="/responses" className={menuClass}>
                  <i className="fa-solid fa-handshake"></i>

                  <span className="safeher-menu-text">My Responses</span>
                </NavLink>
              </li>

              <li>
                <NavLink to="/history" className={menuClass}>
                  <i className="fa-solid fa-clock-rotate-left"></i>

                  <span className="safeher-menu-text">Activity History</span>
                </NavLink>
              </li>

              {/* =====================================
                  VOLUNTEER
              ===================================== */}

              <li>
                <div className="safeher-section-title">Volunteer</div>
              </li>

              <li>
                <NavLink to="/trustscore" className={menuClass}>
                  <i className="fa-solid fa-star"></i>

                  <span className="safeher-menu-text">Trust Score</span>
                </NavLink>
              </li>

              <li>
                <NavLink to="/badges" className={menuClass}>
                  <i className="fa-solid fa-award"></i>

                  <span className="safeher-menu-text">My Badges</span>
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
