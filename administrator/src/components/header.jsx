import React, { useEffect, useState } from "react";
import Axios from "axios";

function Header() {
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    const data = JSON.parse(sessionStorage.getItem("mydata"));
    if (data && data._id) {
      Axios.get(`http://localhost:3000/api/getadminprofile/${data._id}`)
        .then((res) => {
          if (res.data.status === "Success") {
            setAdminData(res.data.data);
          }
        })
        .catch((error) => {
          console.log("Header Admin API Error:", error);
        });
    }
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
            <img src="/images/SafeHer logo.png" alt="logo" />
          </a>
          <a className="navbar-brand brand-logo-mini" href="/">
            <img src="/images/SafeHer logo.png" alt="logo" />
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
          <ul className="navbar-nav">
            <li className="nav-item nav-search d-none d-md-flex">
              <div className="nav-link">
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <i className="fas fa-search"></i>
                    </span>
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search"
                    aria-label="Search"
                  />
                </div>
              </div>
            </li>
          </ul>
          <ul className="navbar-nav navbar-nav-right">
            <li className="nav-item nav-profile dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                data-toggle="dropdown"
                id="profileDropdown"
              >
                <img src="images/faces/face5.jpg" alt="profile" />
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
