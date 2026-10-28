import { useEffect, useState } from "react";
import Axios from "axios";
import AdminInitials from "./AdminInitials";

function Sidebar() {
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    const loadAdminProfile = () => {
      const data = JSON.parse(sessionStorage.getItem("mydata"));
      if (data && data._id) {
        Axios.get(`http://localhost:3000/api/getadminprofile/${data._id}`)
          .then((res) => {
            if (res.data.status === "Success") {
              setAdminData(res.data.data);
            }
          })
          .catch((error) => {
            console.log("Sidebar Admin API Error:", error);
          });
      }
    };

    // Load profile when Sidebar opens
    loadAdminProfile();

    // Reload profile when Admin Profile is updated
    window.addEventListener("adminProfileUpdated", loadAdminProfile);

    return () => {
      window.removeEventListener("adminProfileUpdated", loadAdminProfile);
    };
  }, []);

  return (
    <>
      <nav className="sidebar sidebar-offcanvas" id="sidebar">
        <ul className="nav">
          <li className="nav-item nav-profile">
            <div className="nav-link">
              <div className="profile-image">
                <AdminInitials
                  name={adminData?.name}
                  className="admin-initials-sidebar"
                />
              </div>
              <div className="profile-name">
                <p className="name">{adminData?.name || "Admin"}</p>
                <p className="designation">Safeher Admin</p>
              </div>
            </div>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/dashboard">
              <i className="fa fa-home menu-icon"></i>
              <span className="menu-title">Dashboard</span>
            </a>
          </li>

          <li className="nav-item d-none d-lg-block">
            <a
              className="nav-link"
              data-toggle="collapse"
              href="#sidebar-layouts"
              aria-expanded="false"
              aria-controls="sidebar-layouts"
            >
              <i className="fas fa-users menu-icon"></i>
              <span className="menu-title">User Management</span>
              <i className="menu-arrow"></i>
            </a>
            <div className="collapse" id="sidebar-layouts">
              <ul className="nav flex-column sub-menu">
                <li className="nav-item">
                  <a className="nav-link" href="/womenusers">
                    Woman Users
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/allvolunteers">
                    Volunteers
                  </a>
                </li>
              </ul>
            </div>
          </li>
          <li className="nav-item">
            <a
              className="nav-link"
              data-toggle="collapse"
              href="#ui-basic"
              aria-expanded="false"
              aria-controls="ui-basic"
            >
              <i className="fas fa-exclamation-triangle menu-icon"></i>
              <span className="menu-title">SOS Management</span>
              <i className="menu-arrow"></i>
            </a>
            <div className="collapse" id="ui-basic">
              <ul className="nav flex-column sub-menu">
                <li className="nav-item">
                  <a className="nav-link" href="/sosmonitor">
                    SOS Monitoring
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/adminsoshistory">
                    SOS History
                  </a>
                </li>
              </ul>
            </div>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/adminreports">
              <i className="fas fa-minus-square menu-icon"></i>
              <span className="menu-title">Incident Reports</span>
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/safetymapmanage">
              <i className="fas fa-map-marked-alt menu-icon"></i>
              <span className="menu-title">Safety Map Management</span>
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/safetyarticles">
              <i className="fas fa-book-open menu-icon"></i>
              <span className="menu-title">Safety Articles</span>
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
}
export default Sidebar;
