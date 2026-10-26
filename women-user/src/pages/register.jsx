import React from "react";
import Swal from "sweetalert2";
import Axios from "axios";

function Register() {
  // Create Account
  const handleCreateAccount = () => {
    // Get values using ID
    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const phoneNumber = document.getElementById("phoneNumber").value;
    const gender = document.querySelector('input[name="gender"]:checked');
    const dob = document.getElementById("dob").value;
    const city = document.getElementById("city").value;
    const state = document.getElementById("state").value;
    const pincode = document.getElementById("pincode").value;
    const address = document.getElementById("address").value;
    const profilephoto = document.getElementById("profilephoto").files[0];

    // Gender value
    const genderValue = gender ? gender.value : "";

    // Full Name Validation
    if (fullName.trim() === "") {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please enter your full name.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // Email Validation
    if (email.trim() === "") {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please enter your email address.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please enter a valid email address.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // Password Validation
    if (password.trim() === "") {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please enter your password.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    if (password.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Password must be at least 6 characters long.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // Contact Number Validation
    if (phoneNumber.trim() === "") {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please enter your contact number.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please enter a valid 10 digit contact number.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // Gender Validation
    if (genderValue === "") {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please select your gender.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // Date of Birth Validation
    if (dob === "") {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please select your date of birth.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // City Validation
    if (city === "") {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please select your city.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // State Validation
    if (state === "") {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please select your state.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // Pincode Validation
    if (pincode.trim() === "") {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please enter your pincode.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    if (!/^[0-9]{6}$/.test(pincode)) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please enter a valid 6 digit pincode.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // Address Validation
    if (address.trim() === "") {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please enter your complete address.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // Profile Photo Validation
    if (!profilephoto) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please upload your profile photo.",
        confirmButtonColor: "#287df5",
      });
      return;
    }

    // Create FormData
    const data = new FormData();

    data.append("fullName", fullName);
    data.append("email", email);
    data.append("password", password);
    data.append("phoneNumber", phoneNumber);
    data.append("gender", genderValue);
    data.append("dob", dob);
    data.append("city", city);
    data.append("state", state);
    data.append("pincode", pincode);
    data.append("address", address);
    data.append("profilephoto", profilephoto);

    // Send POST request to backend API
    Axios.post("http://localhost:3000/api/womanregister", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then((response) => {
        Swal.fire({
          icon: "success",
          title: "Registration Successful!",
          text: response.data.message,
          confirmButtonColor: "#287df5",
        }).then(() => {
          window.location = "/";
        });
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "Registration Failed!",
          text: "Email already exists. Please try another email.",
          confirmButtonColor: "#287df5",
        });
      });
  };

  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f5f9ff 0%, #fff5fa 100%)",
          padding: "50px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "1050px",
            margin: "0 auto",
          }}
        >
          {/* SafeHer Heading */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "35px",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "65px",
                height: "65px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #287df5, #e94b9b)",
                color: "white",
                fontSize: "28px",
                marginBottom: "15px",
                boxShadow: "0 8px 20px rgba(40,125,245,0.20)",
              }}
            >
              🛡️
            </div>

            <h1
              style={{
                margin: "0",
                color: "#172b62",
                fontSize: "34px",
                fontWeight: "650",
              }}
            >
              SafeHer
            </h1>

            <p
              style={{
                margin: "8px 0 0",
                color: "#68738a",
                fontSize: "15px",
              }}
            >
              Because Every Woman Deserves to Feel Safe
            </p>
          </div>

          {/* Registration Card */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "18px",
              padding: "40px 45px",
              boxShadow: "0 12px 40px rgba(35,55,90,0.10)",
              border: "1px solid #edf0f6",
            }}
          >
            {/* Form Heading */}
            <div
              style={{
                marginBottom: "30px",
                borderBottom: "1px solid #edf0f5",
                paddingBottom: "20px",
              }}
            >
              <h2
                style={{
                  margin: "0 0 7px",
                  color: "#172b62",
                  fontSize: "25px",
                  fontWeight: "650",
                  textAlign: "center",
                }}
              >
                Create Your SafeHer Account
              </h2>

              <p
                style={{
                  margin: "0",
                  color: "#7b8497",
                  fontSize: "14px",
                  textAlign: "center",
                }}
              >
                Register to access the SafeHer community safety platform.
              </p>
            </div>

            {/* NO FORM TAG */}

            {/* Full Name */}
            <div className="row">
              <div className="col-lg-12">
                <div className="form-group" style={{ marginBottom: "22px" }}>
                  <label
                    style={{
                      color: "#26385f",
                      fontWeight: "600",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    Full Name
                  </label>

                  <input
                    type="text"
                    id="fullName"
                    className="form-control"
                    placeholder="Enter your full name"
                    style={{
                      height: "48px",
                      borderRadius: "8px",
                      border: "1px solid #dce2ec",
                      padding: "10px 14px",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Email + Password */}
            <div className="row">
              <div className="col-lg-6">
                <div className="form-group" style={{ marginBottom: "22px" }}>
                  <label
                    style={{
                      color: "#26385f",
                      fontWeight: "600",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    Email Address
                  </label>

                  <input
                    type="email"
                    id="email"
                    className="form-control"
                    placeholder="Enter your email"
                    style={{
                      height: "48px",
                      borderRadius: "8px",
                      border: "1px solid #dce2ec",
                      padding: "10px 14px",
                    }}
                  />
                </div>
              </div>

              <div className="col-lg-6">
                <div className="form-group" style={{ marginBottom: "22px" }}>
                  <label
                    style={{
                      color: "#26385f",
                      fontWeight: "600",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    Password
                  </label>

                  <input
                    type="password"
                    id="password"
                    className="form-control"
                    placeholder="Enter your password"
                    style={{
                      height: "48px",
                      borderRadius: "8px",
                      border: "1px solid #dce2ec",
                      padding: "10px 14px",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Contact + Gender */}
            <div className="row">
              <div className="col-lg-6">
                <div className="form-group" style={{ marginBottom: "22px" }}>
                  <label
                    style={{
                      color: "#26385f",
                      fontWeight: "600",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    Contact Number
                  </label>

                  <input
                    type="tel"
                    id="phoneNumber"
                    className="form-control"
                    placeholder="Enter 10 digit number"
                    style={{
                      height: "48px",
                      borderRadius: "8px",
                      border: "1px solid #dce2ec",
                      padding: "10px 14px",
                    }}
                  />
                </div>
              </div>

              <div className="col-lg-6">
                <div className="form-group" style={{ marginBottom: "22px" }}>
                  <label
                    style={{
                      color: "#26385f",
                      fontWeight: "600",
                      marginBottom: "10px",
                      display: "block",
                    }}
                  >
                    Gender
                  </label>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "25px",
                      height: "48px",
                    }}
                  >
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "7px",
                        margin: 0,
                        color: "#555f72",
                      }}
                    >
                      <input type="radio" name="gender" value="female" />
                      Female
                    </label>

                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "7px",
                        margin: 0,
                        color: "#555f72",
                      }}
                    >
                      <input type="radio" name="gender" value="male" />
                      Male
                    </label>

                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "7px",
                        margin: 0,
                        color: "#555f72",
                      }}
                    >
                      <input type="radio" name="gender" value="other" />
                      Other
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Date of Birth + City */}
            <div className="row">
              <div className="col-lg-6">
                <div className="form-group" style={{ marginBottom: "22px" }}>
                  <label
                    style={{
                      color: "#26385f",
                      fontWeight: "600",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    Date of Birth
                  </label>

                  <input
                    type="date"
                    id="dob"
                    className="form-control"
                    style={{
                      height: "48px",
                      borderRadius: "8px",
                      border: "1px solid #dce2ec",
                      padding: "10px 14px",
                    }}
                  />
                </div>
              </div>

              <div className="col-lg-6">
                <div className="form-group" style={{ marginBottom: "22px" }}>
                  <label
                    style={{
                      color: "#26385f",
                      fontWeight: "600",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    City
                  </label>

                  <input
                    id="city"
                    list="all-india-cities"
                    className="form-control"
                    placeholder="Enter or select your city"
                    style={{
                      height: "48px",
                      borderRadius: "8px",
                      border: "1px solid #dce2ec",
                      padding: "10px 14px",
                    }}
                  />
                  <datalist id="all-india-cities">
                    <option value="Amreli">Amreli (Gujarat)</option>
                    <option value="Vadodara">Vadodara (Gujarat)</option>
                    <option value="Ahmedabad">Ahmedabad (Gujarat)</option>
                    <option value="Surat">Surat (Gujarat)</option>
                    <option value="Rajkot">Rajkot (Gujarat)</option>
                    <option value="Gandhinagar">Gandhinagar (Gujarat)</option>
                    <option value="Bhavnagar">Bhavnagar (Gujarat)</option>
                    <option value="Jamnagar">Jamnagar (Gujarat)</option>
                    <option value="Junagadh">Junagadh (Gujarat)</option>
                    <option value="Anand">Anand (Gujarat)</option>
                    <option value="Nadiad">Nadiad (Gujarat)</option>
                    <option value="Navsari">Navsari (Gujarat)</option>
                    <option value="Valsad">Valsad (Gujarat)</option>
                    <option value="Vapi">Vapi (Gujarat)</option>
                    <option value="Bharuch">Bharuch (Gujarat)</option>
                    <option value="Porbandar">Porbandar (Gujarat)</option>
                    <option value="Bhuj">Bhuj (Gujarat)</option>
                    <option value="Morbi">Morbi (Gujarat)</option>
                    <option value="Mehsana">Mehsana (Gujarat)</option>
                    <option value="Palanpur">Palanpur (Gujarat)</option>
                    <option value="Mahuva">Mahuva (Gujarat)</option>
                    <option value="Mumbai">Mumbai (Maharashtra)</option>
                    <option value="Pune">Pune (Maharashtra)</option>
                    <option value="Nagpur">Nagpur (Maharashtra)</option>
                    <option value="Thane">Thane (Maharashtra)</option>
                    <option value="Nashik">Nashik (Maharashtra)</option>
                    <option value="Navi Mumbai">Navi Mumbai (Maharashtra)</option>
                    <option value="Delhi">Delhi (NCR)</option>
                    <option value="New Delhi">New Delhi (NCR)</option>
                    <option value="Noida">Noida (Uttar Pradesh)</option>
                    <option value="Gurugram">Gurugram / Gurgaon (Haryana)</option>
                    <option value="Faridabad">Faridabad (Haryana)</option>
                    <option value="Ghaziabad">Ghaziabad (Uttar Pradesh)</option>
                    <option value="Bengaluru">Bengaluru / Bangalore (Karnataka)</option>
                    <option value="Mysuru">Mysuru / Mysore (Karnataka)</option>
                    <option value="Hubli">Hubli (Karnataka)</option>
                    <option value="Mangaluru">Mangaluru / Mangalore (Karnataka)</option>
                    <option value="Hyderabad">Hyderabad (Telangana)</option>
                    <option value="Warangal">Warangal (Telangana)</option>
                    <option value="Chennai">Chennai (Tamil Nadu)</option>
                    <option value="Coimbatore">Coimbatore (Tamil Nadu)</option>
                    <option value="Madurai">Madurai (Tamil Nadu)</option>
                    <option value="Tiruchirappalli">Tiruchirappalli / Trichy (Tamil Nadu)</option>
                    <option value="Kolkata">Kolkata (West Bengal)</option>
                    <option value="Howrah">Howrah (West Bengal)</option>
                    <option value="Siliguri">Siliguri (West Bengal)</option>
                    <option value="Jaipur">Jaipur (Rajasthan)</option>
                    <option value="Jodhpur">Jodhpur (Rajasthan)</option>
                    <option value="Udaipur">Udaipur (Rajasthan)</option>
                    <option value="Kota">Kota (Rajasthan)</option>
                    <option value="Bikaner">Bikaner (Rajasthan)</option>
                    <option value="Lucknow">Lucknow (Uttar Pradesh)</option>
                    <option value="Kanpur">Kanpur (Uttar Pradesh)</option>
                    <option value="Varanasi">Varanasi (Uttar Pradesh)</option>
                    <option value="Agra">Agra (Uttar Pradesh)</option>
                    <option value="Prayagraj">Prayagraj / Allahabad (Uttar Pradesh)</option>
                    <option value="Meerut">Meerut (Uttar Pradesh)</option>
                    <option value="Bhopal">Bhopal (Madhya Pradesh)</option>
                    <option value="Indore">Indore (Madhya Pradesh)</option>
                    <option value="Gwalior">Gwalior (Madhya Pradesh)</option>
                    <option value="Jabalpur">Jabalpur (Madhya Pradesh)</option>
                    <option value="Patna">Patna (Bihar)</option>
                    <option value="Gaya">Gaya (Bihar)</option>
                    <option value="Muzaffarpur">Muzaffarpur (Bihar)</option>
                    <option value="Chandigarh">Chandigarh</option>
                    <option value="Ludhiana">Ludhiana (Punjab)</option>
                    <option value="Amritsar">Amritsar (Punjab)</option>
                    <option value="Jalandhar">Jalandhar (Punjab)</option>
                    <option value="Thiruvananthapuram">Thiruvananthapuram (Kerala)</option>
                    <option value="Kochi">Kochi / Cochin (Kerala)</option>
                    <option value="Kozhikode">Kozhikode (Kerala)</option>
                    <option value="Visakhapatnam">Visakhapatnam (Andhra Pradesh)</option>
                    <option value="Vijayawada">Vijayawada (Andhra Pradesh)</option>
                    <option value="Bhubaneswar">Bhubaneswar (Odisha)</option>
                    <option value="Cuttack">Cuttack (Odisha)</option>
                    <option value="Guwahati">Guwahati (Assam)</option>
                    <option value="Ranchi">Ranchi (Jharkhand)</option>
                    <option value="Jamshedpur">Jamshedpur (Jharkhand)</option>
                    <option value="Raipur">Raipur (Chhattisgarh)</option>
                    <option value="Dehradun">Dehradun (Uttarakhand)</option>
                    <option value="Shimla">Shimla (Himachal Pradesh)</option>
                    <option value="Srinagar">Srinagar (Jammu and Kashmir)</option>
                    <option value="Jammu">Jammu (Jammu and Kashmir)</option>
                    <option value="Panaji">Panaji (Goa)</option>
                    <option value="Puducherry">Puducherry</option>
                  </datalist>
                </div>
              </div>
            </div>

            {/* State + Pincode */}
            <div className="row">
              <div className="col-lg-6">
                <div className="form-group" style={{ marginBottom: "22px" }}>
                  <label
                    style={{
                      color: "#26385f",
                      fontWeight: "600",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    State / Union Territory
                  </label>

                  <select
                    id="state"
                    className="form-control"
                    style={{
                      height: "48px",
                      borderRadius: "8px",
                      border: "1px solid #dce2ec",
                      padding: "10px 14px",
                    }}
                  >
                    <option value="">Select State / UT</option>
                    <option>Gujarat</option>
                    <option>Maharashtra</option>
                    <option>Delhi</option>
                    <option>Karnataka</option>
                    <option>Tamil Nadu</option>
                    <option>Telangana</option>
                    <option>Andhra Pradesh</option>
                    <option>Uttar Pradesh</option>
                    <option>West Bengal</option>
                    <option>Rajasthan</option>
                    <option>Madhya Pradesh</option>
                    <option>Bihar</option>
                    <option>Punjab</option>
                    <option>Haryana</option>
                    <option>Kerala</option>
                    <option>Odisha</option>
                    <option>Assam</option>
                    <option>Jharkhand</option>
                    <option>Chhattisgarh</option>
                    <option>Uttarakhand</option>
                    <option>Himachal Pradesh</option>
                    <option>Jammu and Kashmir</option>
                    <option>Goa</option>
                    <option>Chandigarh</option>
                    <option>Puducherry</option>
                    <option>Tripura</option>
                    <option>Meghalaya</option>
                    <option>Manipur</option>
                    <option>Mizoram</option>
                    <option>Nagaland</option>
                    <option>Arunachal Pradesh</option>
                    <option>Sikkim</option>
                    <option>Ladakh</option>
                    <option>Andaman and Nicobar Islands</option>
                    <option>Dadra and Nagar Haveli and Daman and Diu</option>
                    <option>Lakshadweep</option>
                  </select>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="form-group" style={{ marginBottom: "22px" }}>
                  <label
                    style={{
                      color: "#26385f",
                      fontWeight: "600",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    Pincode
                  </label>

                  <input
                    type="text"
                    id="pincode"
                    className="form-control"
                    placeholder="Enter 6 digit pincode"
                    style={{
                      width: "100%",
                      height: "48px",
                      borderRadius: "8px",
                      border: "1px solid #dce2ec",
                      padding: "10px 14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="row">
              <div className="col-lg-12">
                <div className="form-group" style={{ marginBottom: "22px" }}>
                  <label
                    style={{
                      color: "#26385f",
                      fontWeight: "600",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    Address
                  </label>

                  <textarea
                    id="address"
                    className="form-control"
                    rows="3"
                    placeholder="Enter your complete address"
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #dce2ec",
                      padding: "12px 14px",
                      resize: "vertical",
                    }}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Profile Photo */}
            <div className="row">
              <div className="col-lg-12">
                <div className="form-group" style={{ marginBottom: "28px" }}>
                  <label
                    style={{
                      color: "#26385f",
                      fontWeight: "600",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    Profile Photo
                  </label>

                  <input
                    type="file"
                    id="profilephoto"
                    className="form-control"
                    accept=".jpg,.jpeg,.png"
                    style={{
                      height: "48px",
                      borderRadius: "8px",
                      border: "1px solid #dce2ec",
                      padding: "8px 12px",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Create Account */}
            <div style={{ textAlign: "center" }}>
              <button
                type="button"
                onClick={handleCreateAccount}
                style={{
                  border: "none",
                  borderRadius: "25px",
                  padding: "13px 38px",
                  minWidth: "180px",
                  background: "linear-gradient(90deg, #287df5, #e94b9b)",
                  color: "#ffffff",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 6px 18px rgba(40,125,245,0.20)",
                }}
              >
                Create Account
              </button>
            </div>

            {/* Login */}
            <p
              style={{
                textAlign: "center",
                marginTop: "22px",
                marginBottom: "0",
                color: "#70798b",
                fontSize: "14px",
              }}
            >
              Already have an account?{" "}
              <a
                href="/login"
                style={{
                  color: "#287df5",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;
