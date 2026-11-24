import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Axios from "axios";
import { io } from "socket.io-client";
import "../volunteer-css/sidebar.css";

function Sidebar({ onClose }) {
  const [pendingSosCount, setPendingSosCount] = useState(0);

  const storedData =
    sessionStorage.getItem("mydata") || localStorage.getItem("mydata");

  const volunteerData = storedData ? JSON.parse(storedData) : null;
  const volunteerId = volunteerData?.user_id;

  useEffect(() => {
    const fetchCount = () => {
      Axios.get("http://localhost:3000/api/sos/all", {
        headers: {
          Authorization: `Bearer ${volunteerData?.token || ""}`,
        },
      })
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

    // Socket.IO real-time listener
    const socket = io("http://localhost:3000", {
      transports: ["polling", "websocket"],
      auth: { token: volunteerData?.token },
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
      {/* =========================================
          SIDEBAR
      ========================================= */}

      <aside className="menu-sidebar" id="main-sidebar">
        {/* LOGO */}

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

        {/* SIDEBAR CONTENT */}

        <div className="menu-sidebar__content js-scrollbar1">
          <nav className="navbar-sidebar">
            <ul className="list-unstyled navbar__list">
              {/* MAIN */}

              <li>
                <div className="safeher-section-title">Main</div>
              </li>

              <li>
                <NavLink to="/dashboard" className={menuClass}>
                  <i className="fa-solid fa-gauge-high"></i>
                  <span className="safeher-menu-text">Dashboard</span>
                </NavLink>
              </li>

              {/* EMERGENCY */}

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

              {/* COMMUNITY */}

              <li>
                <div className="safeher-section-title">Community</div>
              </li>

              <li>
                <NavLink to="/incidentreports" className={menuClass}>
                  <i className="fa-solid fa-file-circle-exclamation"></i>
                  <span className="safeher-menu-text">Incident Reports</span>
                </NavLink>
              </li>

              {/* MY ACTIVITY */}

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

              {/* VOLUNTEER */}

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
