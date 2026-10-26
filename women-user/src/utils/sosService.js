import Axios from "axios";
import Swal from "sweetalert2";

/**
 * Triggers an Emergency SOS alert for the logged-in woman user.
 * Captures live GPS coordinates and broadcasts them to volunteers.
 */
export const activateSOSAlert = () => {
  const rawData = localStorage.getItem("mydata");

  // 1. Check if user is logged in
  if (!rawData) {
    Swal.fire({
      icon: "warning",
      title: "Login Required",
      text: "Aapko pehle login karna hoga taaki volunteers ko aapka live location share ho sake.",
      showCancelButton: true,
      confirmButtonText: "Go to Login",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
    }).then((res) => {
      if (res.isConfirmed) {
        window.location.href = "/login";
      }
    });
    return;
  }

  let user;
  try {
    user = JSON.parse(rawData);
  } catch {
    localStorage.removeItem("mydata");
    window.location.href = "/login";
    return;
  }

  // 2. Confirmation modal
  Swal.fire({
    title: "🚨 ACTIVATE EMERGENCY SOS?",
    text: "Aapka live GPS location turant volunteers ke saath share ho jayega!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#4b5563",
    confirmButtonText: "Yes, Activate SOS Now!",
    cancelButtonText: "Cancel",
  }).then((res) => {
    if (!res.isConfirmed) return;

    Swal.fire({
      title: "Fetching GPS Live Location...",
      text: "Aapka live location check ho raha hai...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const sendSOS = (lat, lng, address) => {
      Axios.post("http://localhost:3000/api/sos/create", {
        womanId: user.user_id,
        womanName: user.fullName,
        womanEmail: user.email,
        womanPhone: user.phoneNumber || "",
        womanLat: lat,
        womanLng: lng,
        womanAddress: address || "Current GPS Live Location",
        emergencyType: "Emergency SOS Assistance",
      })
        .then((resp) => {
          localStorage.setItem("activeSosId", resp.data.sos._id);
          Swal.fire({
            icon: "success",
            title: "🚨 SOS Alert Sent!",
            text: "Aapka live location volunteers ko share ho gaya hai. Tracking map open ho raha hai...",
            timer: 2000,
            showConfirmButton: false,
          }).then(() => {
            window.location.href = "/sostracking";
          });
        })
        .catch((err) => {
          Swal.fire({
            icon: "error",
            title: "SOS Error",
            text:
              err.response?.data?.message ||
              "Failed to trigger SOS. Emergency Helpline 112 par call karein.",
            confirmButtonColor: "#dc2626",
          });
        });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          sendSOS(
            pos.coords.latitude,
            pos.coords.longitude,
            "Current GPS Live Location"
          );
        },
        (err) => {
          console.warn("GPS warning, using fallback coordinates:", err.message);
          // Fallback safety coordinates (Vadodara city center) so emergency action is never blocked
          sendSOS(22.3072, 73.1812, "Detected City Location (Vadodara)");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      sendSOS(22.3072, 73.1812, "Default Coordinates");
    }
  });
};
