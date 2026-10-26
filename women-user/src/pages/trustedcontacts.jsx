import React, { useState, useEffect } from "react";
import "../safeher-css/trustedcontacts.css";
import Swal from "sweetalert2";
import Axios from "axios";

function TrustedContacts() {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const usersession = localStorage.getItem("mydata");
    if (!usersession) {
      window.location.href = "/login";
      return;
    }

    const user = JSON.parse(usersession);
    Axios.get(`http://localhost:3000/api/getTrustedContacts/${user.user_id}`)
      .then((response) => {
        setContacts(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  function handleSubmit() {
    const contactName = document.getElementById("contactName").value.trim();
    const relationship = document.getElementById("relationship").value;
    const phoneNo = document.getElementById("phoneNo").value.trim();
    const email = document.getElementById("email").value.trim();
    const priority = document.querySelector('input[name="priority"]:checked');

    const usersession = localStorage.getItem("mydata");
    if (!usersession) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to manage your trusted contacts.",
        confirmButtonColor: "#2f80ed",
      });

      window.location.href = "/login";
      return;
    }
    const user = JSON.parse(usersession);

    // Name validation
    if (contactName === "") {
      Swal.fire({
        icon: "warning",
        title: "Oops!",
        text: "Please enter contact name.",
        confirmButtonColor: "#2f80ed",
      });
      return;
    }

    // Relationship validation
    if (relationship === "") {
      Swal.fire({
        icon: "warning",
        title: "Oops!",
        text: "Please select relationship.",
        confirmButtonColor: "#2f80ed",
      });
      return;
    }

    // Phone validation
    if (phoneNo === "") {
      Swal.fire({
        icon: "warning",
        title: "Oops!",
        text: "Please enter phone number.",
        confirmButtonColor: "#2f80ed",
      });
      return;
    }

    if (!/^[0-9]{10}$/.test(phoneNo)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Phone Number",
        text: "Phone number must contain exactly 10 digits.",
        confirmButtonColor: "#2f80ed",
      });
      return;
    }

    // Email validation (optional but if provided must be valid)
    if (email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email Address",
        text: "Please enter a valid email address (e.g., example@gmail.com).",
        confirmButtonColor: "#2f80ed",
      });
      return;
    }

    // Priority validation
    if (!priority) {
      Swal.fire({
        icon: "warning",
        title: "Oops!",
        text: "Please select contact priority.",
        confirmButtonColor: "#2f80ed",
      });
      return;
    }

    //send POST reqquest to backend API
    Axios.post("http://localhost:3000/api/addTrustedContact", {
      womanId: user.user_id,
      contactName: contactName,
      relationship: relationship,
      phoneNo: phoneNo,
      email: email,
      priority: priority.value,
    })

      .then((response) => {
        //Add new contact to the list immediately
        setContacts((prevContacts) => [...prevContacts, response.data.contact]);

        //clear form
        document.getElementById("contactName").value = "";
        document.getElementById("relationship").value = "";
        document.getElementById("phoneNo").value = "";
        document.getElementById("email").value = "";

        const priorityButtons = document.querySelectorAll(
          'input[name="priority"]',
        );

        priorityButtons.forEach((button) => {
          button.checked = false;
        });

        Swal.fire({
          icon: "success",
          title: "Contact Added!",
          text: response.data.message,
          confirmButtonColor: "#128412",
        });
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data.message || "Something went wrong",
          confirmButtonColor: "#287df5",
        });
      });
  }

  function handleDelete(contactId) {
    Swal.fire({
      icon: "warning",
      title: "Delete Contact?",
      text: "Are you sure you want to remove this trusted contact?",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Delete",
    }).then((result) => {
      if (result.isConfirmed) {
        Axios.delete(
          `http://localhost:3000/api/deleteTrustedContact/${contactId}`,
        )
          .then((response) => {
            setContacts((prevContacts) =>
              prevContacts.filter((contact) => contact._id !== contactId),
            );

            Swal.fire({
              icon: "success",
              title: "Deleted!",
              text: response.data.message,
              confirmButtonColor: "#128412",
            });
          })
          .catch((error) => {
            Swal.fire({
              icon: "error",
              title: "Error",
              text:
                error.response?.data?.message ||
                "Something went wrong while deleting the contact.",
              confirmButtonColor: "#287df5",
            });
          });
      }
    });
  }

  function handleEdit(contact) {
    Swal.fire({
      title: "Edit Trusted Contact",
      width: "500px",

      html: `
      <div style="display: flex; flex-direction: column; gap: 14px; text-align: left;">

        <div>
          <label style="display: block; margin-bottom: 6px; font-weight: 600;">
            Contact Name
          </label>
          <input
            id="editContactName"
            class="swal2-input"
            placeholder="Enter contact name"
            value="${contact.contactName}"
            style="width: 100%; margin: 0; box-sizing: border-box;"
          />
        </div>

        <div>
          <label style="display: block; margin-bottom: 6px; font-weight: 600;">
            Relationship
          </label>
          <select
            id="editRelationship"
            class="swal2-select"
            style="width: 100%; margin: 0; box-sizing: border-box;"
          >
            <option value="">Select relationship</option>
            <option value="Mother">Mother</option>
            <option value="Father">Father</option>
            <option value="Husband">Husband</option>
            <option value="Sibling">Sibling</option>
            <option value="Friend">Friend</option>
            <option value="Neighbour">Neighbour</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label style="display: block; margin-bottom: 6px; font-weight: 600;">
            Phone Number
          </label>
          <input
            id="editPhoneNo"
            class="swal2-input"
            placeholder="Enter 10 digit phone number"
            value="${contact.phoneNo}"
            maxlength="10"
            style="width: 100%; margin: 0; box-sizing: border-box;"
          />
        </div>

        <div>
          <label style="display: block; margin-bottom: 6px; font-weight: 600;">
            Email Address (for Emergency SOS Alerts)
          </label>
          <input
            id="editEmail"
            type="email"
            class="swal2-input"
            placeholder="Enter email address"
            value="${contact.email || ""}"
            style="width: 100%; margin: 0; box-sizing: border-box;"
          />
        </div>

        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">
            Priority
          </label>

          <div style="
            display: flex;
            gap: 30px;
            align-items: center;
          ">
            <label style="display: flex; align-items: center; gap: 7px; cursor: pointer;">
              <input
                type="radio"
                name="editPriority"
                value="Primary"
                ${contact.priority === "Primary" ? "checked" : ""}
              />
              Primary
            </label>

            <label style="display: flex; align-items: center; gap: 7px; cursor: pointer;">
              <input
                type="radio"
                name="editPriority"
                value="Secondary"
                ${contact.priority === "Secondary" ? "checked" : ""}
              />
              Secondary
            </label>
          </div>
        </div>

      </div>
    `,

      didOpen: () => {
        document.getElementById("editRelationship").value =
          contact.relationship;
      },

      showCancelButton: true,
      confirmButtonText: "Update Contact",
      cancelButtonText: "Cancel",

      confirmButtonColor: "#2f80ed",
      cancelButtonColor: "#6c757d",

      preConfirm: () => {
        const contactName = document
          .getElementById("editContactName")
          .value.trim();

        const relationship = document.getElementById("editRelationship").value;

        const phoneNo = document.getElementById("editPhoneNo").value.trim();

        const email = document.getElementById("editEmail").value.trim();

        const priority = document.querySelector(
          'input[name="editPriority"]:checked',
        );

        if (!contactName) {
          Swal.showValidationMessage("Please enter contact name.");
          return false;
        }

        if (!relationship) {
          Swal.showValidationMessage("Please select relationship.");
          return false;
        }

        if (!phoneNo) {
          Swal.showValidationMessage("Please enter phone number.");
          return false;
        }

        if (!/^[0-9]{10}$/.test(phoneNo)) {
          Swal.showValidationMessage(
            "Phone number must contain exactly 10 digits.",
          );
          return false;
        }

        if (email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          Swal.showValidationMessage(
            "Please enter a valid email address.",
          );
          return false;
        }

        if (!priority) {
          Swal.showValidationMessage("Please select contact priority.");
          return false;
        }

        return {
          contactName,
          relationship,
          phoneNo,
          email,
          priority: priority.value,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        Axios.put(
          `http://localhost:3000/api/editTrustedContact/${contact._id}`,
          result.value,
        )
          .then((response) => {
            setContacts((prevContacts) =>
              prevContacts.map((item) =>
                item._id === contact._id ? response.data.contact : item,
              ),
            );

            Swal.fire({
              icon: "success",
              title: "Updated!",
              text: response.data.message,
              confirmButtonColor: "#128412",
            });
          })
          .catch((error) => {
            Swal.fire({
              icon: "error",
              title: "Error",
              text:
                error.response?.data?.message ||
                "Something went wrong while updating the contact.",
              confirmButtonColor: "#287df5",
            });
          });
      }
    });
  }

  return (
    <div className="tc-body">
      {/* PAGE HEADER */}
      <section className="tc-page-header">
        <div className="tc-header-overlay"></div>

        <div className="tc-header-content">
          <span className="tc-header-tag">🛡️ Emergency Circle</span>

          <h1>Trusted Contacts</h1>

          <p>Your safety circle, always close to you.</p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="tc-main">
        <div className="tc-layout">
          {/* LEFT SIDE */}
          <div className="tc-left">
            {/* INTRO CARD */}
            <div className="tc-card tc-intro-card">
              <div className="tc-intro-icon">🛡️</div>

              <div>
                <h2>Your Safety Circle</h2>

                <p>
                  Add people you trust so they can be contacted quickly during
                  an emergency. Your trusted contacts are only notified when you
                  trigger an SOS.
                </p>
              </div>
            </div>

            {/* CONTACT LIST */}
            <div className="tc-card tc-contacts-card">
              <div className="tc-list-header">
                <div>
                  <span className="tc-small-label">EMERGENCY NETWORK</span>

                  <h2>My Trusted Contacts</h2>
                </div>

                <span className="tc-contact-count">
                  {contacts.length}{" "}
                  {contacts.length === 1 ? "contact" : "contacts"}
                </span>
              </div>

              {/* CONTACT 1 */}
              {contacts.length > 0 ? (
                contacts.map((contact) => (
                  <div className="tc-contact-item" key={contact._id}>
                    <div
                      className={`tc-avatar ${
                        contact.priority === "Primary"
                          ? "tc-avatar-pink"
                          : "tc-avatar-purple"
                      }`}
                    >
                      👤
                    </div>

                    <div className="tc-contact-info">
                      <h3>{contact.contactName}</h3>
                      <p>{contact.relationship}</p>
                      <span className="tc-phone">📞 {contact.phoneNo}</span>
                      {contact.email ? (
                        <span
                          className="tc-email"
                          style={{
                            display: "block",
                            fontSize: "13px",
                            color: "#475569",
                            marginTop: "3px",
                          }}
                        >
                          ✉️ {contact.email}
                        </span>
                      ) : (
                        <span
                          className="tc-no-email"
                          style={{
                            display: "block",
                            fontSize: "12px",
                            color: "#dc2626",
                            marginTop: "3px",
                            fontStyle: "italic",
                          }}
                        >
                          ⚠️ No email (Click Edit to add for SOS emails)
                        </span>
                      )}
                    </div>

                    <div className="tc-contact-right">
                      <span
                        className={
                          contact.priority === "Primary"
                            ? "tc-primary-badge"
                            : "tc-secondary-badge"
                        }
                      >
                        {contact.priority}
                      </span>

                      <div className="tc-actions">
                        <button
                          type="button"
                          onClick={() => handleEdit(contact)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(contact._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="tc-empty-contacts">
                  <div className="tc-empty-icon">👥</div>

                  <h4>No Trusted Contacts Added</h4>

                  <p>
                    Add a trusted person who can be contacted during an
                    emergency.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE - ADD CONTACT */}
          <div className="tc-right">
            <div className="tc-card tc-form-card">
              <div className="tc-form-heading">
                <span className="tc-form-icon">+</span>

                <div>
                  <span className="tc-small-label">ADD NEW</span>

                  <h2>Add Trusted Contact</h2>
                </div>
              </div>

              <p className="tc-form-description">
                Add someone you trust to your emergency circle.
              </p>

              {/* NAME */}
              <div className="tc-form-group">
                <label htmlFor="contactName">Contact Name</label>

                <input
                  type="text"
                  id="contactName"
                  placeholder="Enter full name"
                />
              </div>

              {/* RELATIONSHIP */}
              <div className="tc-form-group">
                <label htmlFor="relationship">Relationship</label>

                <select id="relationship">
                  <option value="">Select relationship</option>

                  <option value="Mother">Mother</option>

                  <option value="Father">Father</option>

                  <option value="Husband">Husband</option>

                  <option value="Sibling">Sibling</option>

                  <option value="Friend">Friend</option>

                  <option value="Neighbour">Neighbour</option>

                  <option value="Other">Other</option>
                </select>
              </div>

              {/* PHONE */}
              <div className="tc-form-group">
                <label htmlFor="phoneNo">Phone Number</label>

                <input
                  type="tel"
                  id="phoneNo"
                  placeholder="Enter 10 digit phone number"
                  maxLength="10"
                />
              </div>

              {/* EMAIL */}
              <div className="tc-form-group">
                <label htmlFor="email">
                  Email Address <span style={{ color: "#dc2626", fontSize: "12px" }}>* (For Emergency SOS Alerts)</span>
                </label>

                <input
                  type="email"
                  id="email"
                  placeholder="Enter email address (e.g. member@gmail.com)"
                />
              </div>

              {/* PRIORITY */}
              <div className="tc-form-group">
                <label>Contact Priority</label>

                <div className="tc-priority-options">
                  <label className="tc-priority-option">
                    <input type="radio" name="priority" value="Primary" />

                    <span>Primary</span>
                  </label>

                  <label className="tc-priority-option">
                    <input type="radio" name="priority" value="Secondary" />

                    <span>Secondary</span>
                  </label>
                </div>
              </div>

              {/* BUTTON */}
              <button
                type="button"
                className="tc-submit-btn"
                onClick={handleSubmit}
              >
                <span>+</span>
                Add Trusted Contact
              </button>
            </div>
          </div>
        </div>

        {/* SAFETY NOTE */}
        <div className="tc-footnote">
          <div className="tc-footnote-icon">🔒</div>

          <div>
            <strong>Your privacy matters</strong>

            <p>
              Contacts are only alerted when you trigger an SOS. Nobody in your
              circle can see your location or activity otherwise, and you can
              remove or update anyone, anytime.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default TrustedContacts;
