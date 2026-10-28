import React from "react";
import "../safeher-css/header.css";

function Header() {
  function logout() {
    localStorage.clear();
    window.location = "/";
  }
  return (
    <div className="top_header_banner2 safeher-header">
      {/* ================= TOP HEADER ================= */}
      <section className="logo-contact">
        <div className="container">
          <div className="row">
            {/* PHONE */}
            <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
              <div className="single-top-contact">
                <i className="ti-mobile"></i>

                <h4>
                  <a href="tel:+4857548546">+ 485 7548 8546</a>
                </h4>
              </div>
            </div>

            {/* EMAIL */}
            <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
              <div className="single-top-contact">
                <i className="ti-email"></i>

                <h4>
                  <a href="mailto:safeher@gmail.com">safeher@gmail.com</a>
                </h4>
              </div>
            </div>

            {/* SUPPORT */}
            <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
              <div className="single-top-contact">
                <i className="ti-alarm-clock"></i>

                <h4>24/7 Safety Support</h4>
              </div>
            </div>

            {/* SOCIAL ICONS */}
            <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
              <div className="top_social_profile">
                <ul>
                  <li>
                    <a href="#" className="top_f_facebook">
                      <i className="fa-brands fa-facebook"></i>
                    </a>
                  </li>

                  <li>
                    <a href="#" className="top_f_twitter">
                      <i className="fa-brands fa-x-twitter"></i>
                    </a>
                  </li>

                  <li>
                    <a href="#" className="top_f_instagram">
                      <i className="fa-brands fa-instagram"></i>
                    </a>
                  </li>

                  <li>
                    <a href="#" className="top_f_linkedin">
                      <i className="fa-brands fa-linkedin-in"></i>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= NAVIGATION ================= */}
      <div id="navigation" className="navbar-light bg-faded site-navigation">
        <div className="container">
          <div className="row align-items-center">
            {/* ================= LOGO ================= */}
            <div className="col-lg-3 col-md-3">
              <div className="site-logo">
                <a href="/">
                  <img
                    src="assets/images/all-img/SafeHer logo.png"
                    alt="SafeHer"
                  />
                </a>
              </div>
            </div>

            {/* ================= MENU ================= */}
            <div className="col-lg-6 col-md-6">
              <nav id="main-menu">
                <ul>
                  {localStorage.getItem("mydata") === null ? (
                    <>
                      <li>
                        <a href="/">Home</a>
                      </li>

                      <li>
                        <a href="/about">About</a>
                      </li>

                      <li>
                        <a href="/safetymap">Safety Map</a>
                      </li>

                      <li>
                        <a href="/safetyresources">Safety Resources</a>
                      </li>

                      <li>
                        <a href="/howitworks">How It Works</a>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <a href="/">Home</a>
                      </li>

                      <li>
                        <a href="/about">About</a>
                      </li>

                      <li>
                        <a href="/trustedcontacts">Trusted Contacts</a>
                      </li>

                      <li>
                        <a href="/reportincident">Report Incident</a>
                      </li>

                      <li>
                        <a href="/myreports">My Reports</a>
                      </li>
                    </>
                  )}
                </ul>
              </nav>
            </div>

            {/* ================= RIGHT SIDE ================= */}
            <div className="col-lg-3 col-md-3">
              <div
                className="header-right"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  justifyContent: "flex-end",
                }}
              >
                {localStorage.getItem("mydata") === null ? (
                  <div className="call_to_action">
                    <a className="btn_two" href="/register">
                      Register Now
                      <i className="fa-solid fa-arrow-right"></i>
                    </a>
                  </div>
                ) : (
                  <>
                    {/* PROFILE DROPDOWN */}
                    <div className="profile-dropdown">
                      <button className="profile-button">
                        <i className="fa-regular fa-circle-user"></i>

                        <span>My Profile</span>

                        <i className="fa-solid fa-chevron-down dropdown-arrow"></i>
                      </button>

                      {/* DROPDOWN MENU */}
                      <div className="profile-menu">
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
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
