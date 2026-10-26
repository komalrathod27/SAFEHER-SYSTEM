import React from "react";

function Footer() {
  return (
    <footer className="safeher-footer">
      <style>{`
        .safeher-footer {
          background: #172554;
          color: #ffffff;
          padding: 65px 0 20px;
        }

        .safeher-footer-logo {
          font-family: "Poppins", sans-serif;
          font-size: 28px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 15px;
        }

        .safeher-footer-logo span {
          color: #e83e8c;
        }

        .safeher-footer-about {
          color: #b9c3d8;
          font-size: 13px;
          line-height: 1.8;
          max-width: 350px;
          margin-bottom: 20px;
        }

        .safeher-footer-social {
          display: flex;
          gap: 10px;
        }

        .safeher-footer-social a {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.08);
          color: #ffffff;
          text-decoration: none;
          transition: 0.3s ease;
        }

        .safeher-footer-social a:hover {
          background: #e83e8c;
          transform: translateY(-3px);
        }

        .safeher-footer h4 {
          color: #ffffff;
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .safeher-footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .safeher-footer-links li {
          margin-bottom: 11px;
        }

        .safeher-footer-links a {
          color: #b9c3d8;
          font-size: 13px;
          text-decoration: none;
          transition: 0.3s ease;
        }

        .safeher-footer-links a:hover {
          color: #e83e8c;
          padding-left: 4px;
        }

        .safeher-footer-contact p {
          color: #b9c3d8;
          font-size: 13px;
          margin-bottom: 12px;
        }

        .safeher-footer-contact i {
          color: #e83e8c;
          margin-right: 8px;
        }

        .safeher-footer-bottom {
          margin-top: 45px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.10);
          text-align: center;
        }

        .safeher-footer-bottom p {
          margin: 0;
          color: #9da8c0;
          font-size: 12px;
        }

        .safeher-footer-bottom span {
          color: #e83e8c;
        }

        @media (max-width: 767px) {
          .safeher-footer {
            padding: 50px 0 20px;
          }

          .safeher-footer-col {
            margin-bottom: 35px;
          }

          .safeher-footer-about {
            margin-left: auto;
            margin-right: auto;
          }

          .safeher-footer-social {
            justify-content: center;
          }

          .safeher-footer-logo,
          .safeher-footer h4 {
            text-align: center;
          }

          .safeher-footer-links {
            text-align: center;
          }

          .safeher-footer-contact {
            text-align: center;
          }
        }
      `}</style>

      <div className="container">
        <div className="row">
          {/* ABOUT SAFEHER */}
          <div className="col-lg-5 col-md-6 safeher-footer-col">
            <div className="safeher-footer-logo">
              Safe<span>Her</span>
            </div>

            <p className="safeher-footer-about">
              SafeHer is a community safety platform designed to help women stay
              connected, informed, prepared, and safer in everyday life.
            </p>

            <div className="safeher-footer-social">
              <a href="#" aria-label="Facebook">
                <i className="fa-brands fa-facebook-f"></i>
              </a>

              <a href="#" aria-label="Instagram">
                <i className="fa-brands fa-instagram"></i>
              </a>

              <a href="#" aria-label="Twitter">
                <i className="fa-brands fa-twitter"></i>
              </a>

              <a href="#" aria-label="LinkedIn">
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="col-lg-3 col-md-6 safeher-footer-col">
            <h4>Quick Links</h4>

            <ul className="safeher-footer-links">
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/about">About SafeHer</a>
              </li>
              <li>
                <a href="/trusted-contacts">Trusted Contacts</a>
              </li>
              <li>
                <a href="/safety-map">Safety Map</a>
              </li>
              <li>
                <a href="/report-incident">Report Incident</a>
              </li>
            </ul>
          </div>

          {/* SAFETY */}
          <div className="col-lg-2 col-md-6 safeher-footer-col">
            <h4>Safety</h4>

            <ul className="safeher-footer-links">
              <li>
                <a href="/sostracking">Emergency SOS</a>
              </li>
              <li>
                <a href="#">Safety Tips</a>
              </li>
              <li>
                <a href="#">Safety Articles</a>
              </li>
              <li>
                <a href="#">SafeHer AI</a>
              </li>
            </ul>
          </div>

          {/* CONTACT */}
          <div className="col-lg-2 col-md-6 safeher-footer-col">
            <h4>Contact</h4>

            <div className="safeher-footer-contact">
              <p>
                <i className="fa-solid fa-envelope"></i>
                support@safeher.com
              </p>

              <p>
                <i className="fa-solid fa-phone"></i>
                Emergency Support
              </p>

              <p>
                <i className="fa-solid fa-shield-halved"></i>
                Stay Safe
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="safeher-footer-bottom">
          <p>
            © 2026 <span>SafeHer</span>. All Rights Reserved. | Because Every
            Woman Deserves to Feel Safe.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
