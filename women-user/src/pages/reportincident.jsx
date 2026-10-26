import React from "react";
import swal from "sweetalert2";
import "../safeher-css/reportincident.css";
import axios from "axios";

function ReportIncident() {
  const [fileName, setFileName] = React.useState("No file chosen");
  const handleSubmit = async () => {
    // Get values using ID
    const incidentType = document.getElementById("ri-type").value;
    const description = document.getElementById("ri-description").value;
    const incidentDate = document.getElementById("ri-date").value;
    const incidentTime = document.getElementById("ri-time").value;
    const photo = document.getElementById("ri-photo").files[0];
    const location = document.getElementById("ri-location").value;

    //Get logged-in woman user data
    const mydata = JSON.parse(localStorage.getItem("mydata"));

    //check login data
    if (!mydata || !mydata.user_id) {
      swal.fire({
        icon: "error",
        title: "Login Required",
        text: "Please login before reporting an incident.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // Incident Type validation
    if (!incidentType) {
      swal.fire({
        icon: "warning",
        title: "Oops!",
        text: "Please select the incident type.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // Description validation
    if (!description.trim()) {
      swal.fire({
        icon: "warning",
        title: "Oops!",
        text: "Please describe what happened.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // Incident Date validation
    if (!incidentDate) {
      swal.fire({
        icon: "warning",
        title: "Oops!",
        text: "Please select the incident date.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // Incident Time validation
    if (!incidentTime) {
      swal.fire({
        icon: "warning",
        title: "Oops!",
        text: "Please select the incident time.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // Photo validation
    if (!photo) {
      swal.fire({
        icon: "warning",
        title: "Oops!",
        text: "Please upload a photo.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // Location validation
    if (!location.trim()) {
      swal.fire({
        icon: "warning",
        title: "Oops!",
        text: "Please enter the incident location.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    try {
      // Create FormData to send data
      const formData = new FormData();
      formData.append("womanId", mydata.user_id); // Append user ID to associate the report with the logged-in user
      formData.append("incidentType", incidentType);
      formData.append("description", description);
      formData.append("incidentDate", incidentDate);
      formData.append("incidentTime", incidentTime);
      formData.append("photo", photo);
      formData.append("location", location);

      // Send report to backend
      const response = await axios.post(
        "http://localhost:3000/api/addincidentreport",
        formData,
      );

      //success message
      swal.fire({
        icon: "success",
        title: "Report Submitted",
        text: response.data.message,
        confirmButtonColor: "#287df5",
      });

      // Clear form fields after submission
      document.getElementById("ri-type").value = "";
      document.getElementById("ri-description").value = "";
      document.getElementById("ri-date").value = "";
      document.getElementById("ri-time").value = "";
      document.getElementById("ri-photo").value = "";
      document.getElementById("ri-location").value = "";
      setFileName("No file chosen");
    } catch (error) {
      console.log(error);
      swal.fire({
        icon: "error",
        title: "Submission Failed",
        text:
          error.response?.data?.message ||
          "Something went wrong while submitting the report.",
        confirmButtonColor: "#287df5",
      });
    }
  };

  return (
    <div className="ri-body">
      <style>{`
        /* KEEP YOUR EXISTING CSS HERE */
      `}</style>

      <div className="ri-page-head">
        <span className="ri-tag">🛡 Community Safety</span>
        <h1>Report an Incident</h1>
        <p>Help make your community safer by reporting a safety incident.</p>
      </div>

      <div className="ri-layout">
        <div className="ri-card">
          <h2>Incident Report</h2>

          {/* NO FORM TAG */}

          {/* INCIDENT TYPE */}
          <div className="ri-field">
            <label htmlFor="ri-type">Incident Type</label>

            <select id="ri-type" defaultValue="">
              <option value="">Select incident type</option>
              <option>Harassment</option>
              <option>Stalking</option>
              <option>Assault</option>
              <option>Unsafe location</option>
              <option>Suspicious activity</option>
              <option>Other</option>
            </select>
          </div>

          {/* DESCRIPTION */}
          <div className="ri-field">
            <label htmlFor="ri-description">Description</label>

            <textarea
              id="ri-description"
              placeholder="Describe what happened..."
            />
          </div>

          {/* DATE AND TIME */}
          <div className="ri-row">
            <div className="ri-field">
              <label htmlFor="ri-date">Incident Date</label>

              <input id="ri-date" type="date" />
            </div>

            <div className="ri-field">
              <label htmlFor="ri-time">Incident Time</label>

              <input id="ri-time" type="time" />
            </div>
          </div>

          {/* PHOTO */}
          <div className="ri-field">
            <label htmlFor="ri-photo">Photo</label>

            <div className="ri-file-field">
              <label className="ri-file-btn" htmlFor="ri-photo">
                Choose File
              </label>

              <span className="ri-file-name">{fileName}</span>

              <input
                id="ri-photo"
                type="file"
                style={{ display: "none" }}
                accept=".jpg, .jpeg, .png"
                onChange={(e) => {
                  setFileName(e.target.files[0]?.name || "No file chosen");
                }}
              />
            </div>
          </div>

          {/* LOCATION */}
          <div style={{ marginBottom: "22px" }}>
            <div className="ri-field">
              <label htmlFor="ri-location">Location</label>

              <input
                id="ri-location"
                type="text"
                placeholder="Enter incident location"
              />
            </div>
          </div>

          {/* BUTTON */}
          <button
            className="ri-submit-btn"
            type="button"
            onClick={handleSubmit}
          >
            Submit Report
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>

      {/* SAFETY NOTE */}
      <div className="ri-footnote">
        <span className="ri-footnote-icon">🛡</span>

        <p>
          <strong>Your report helps keep others safe.</strong> Reports are
          reviewed by our safety team, and your identity is kept confidential
          unless you choose to share it.
        </p>
      </div>
    </div>
  );
}

export default ReportIncident;
