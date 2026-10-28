import { useEffect, useState } from "react";
import Axios from "axios";
import AdminInitials from "./AdminInitials";

function Header() {
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    const loadAdminProfile = () => {
      const data = JSON.parse(sessionStorage.getItem("mydata") || "null");
      if (!data?._id) return;

      Axios.get(`http://localhost:3000/api/getadminprofile/${data._id}`)
        .then((res) => {
          if (res.data.status === "Success") setAdminData(res.data.data);
        })
        .catch((error) => console.log("Header Admin API Error:", error));
    };

    loadAdminProfile();
    window.addEventListener("adminProfileUpdated", loadAdminProfile);

    return () =>
      window.removeEventListener("adminProfileUpdated", loadAdminProfile);
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    sessionStorage.removeItem("mydata");
    window.location.href = "/";
  };
  return (
    <>
      <nav className="navbar col-lg-12 col-12 p-0 fixed-top d-flex flex-row default-layout-navbar">
        <div className="text-center navbar-brand-wrapper d-flex align-items-center justify-content-center">
          <a className="navbar-brand brand-logo" href="/">
            <img src="/images/SafeHer logo.png" alt="SafeHer" />
          </a>
          <a className="navbar-brand brand-logo-mini" href="/">
            <img src="/images/mini-logo.png" alt="SafeHer" />
          </a>
        </div>
        <div className="navbar-menu-wrapper d-flex align-items-stretch">
          <button
            className="navbar-toggler navbar-toggler align-self-center"
            type="button"
            data-toggle="minimize"
          >
            <span className="fas fa-bars"></span>
          </button>

          <ul className="navbar-nav navbar-nav-right">
            <li className="nav-item nav-profile dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                data-toggle="dropdown"
                id="profileDropdown"
              >
                <AdminInitials
                  name={adminData?.name}
                  className="admin-initials-header"
                />
              </a>
              <div
                className="dropdown-menu dropdown-menu-right navbar-dropdown"
                aria-labelledby="profileDropdown"
              >
                <a className="dropdown-item" href="/adminprofile">
                  <i className="fas fa-cog text-primary"></i>
                  My profile
                </a>
                <div className="dropdown-divider"></div>
                <a className="dropdown-item" href="#" onClick={handleLogout}>
                  <i className="fas fa-power-off text-primary"></i>
                  Logout
                </a>
              </div>
            </li>
          </ul>
          <button
            className="navbar-toggler navbar-toggler-right d-lg-none align-self-center"
            type="button"
            data-toggle="offcanvas"
          >
            <span className="fas fa-bars"></span>
          </button>
        </div>
      </nav>
    </>
  );
}
export default Header;
