import Axios from "axios";
import Swal from "sweetalert2";
import { getAccurateLocation } from "./geoService";

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
          const smsStatus = resp.data.smsStatus;

          if (smsStatus && !smsStatus.success && smsStatus.devExhausted && smsStatus.gatewayExhausted) {
            Swal.fire({
              icon: "warning",
              title: "⚠️ SMS Delivery Warning!",
              html: `
                <div style="text-align: left; font-size: 14px; line-height: 1.6;">
                  <p style="color: #dc2626; font-weight: 800; font-size: 16px; margin-bottom: 8px;">
                    🚨 Bhai dono ka hi recharge nahi hai!
                  </p>
                  <p style="margin-bottom: 8px; color: #334155;">
                    Dev ke number ka 100 SMS/day recharge pack bhi khatam ho gaya hai aur SMS Gateway ka bhi recharge nahi hai, isiliye SMS nahi ja paya!
                  </p>
                  <p style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 10px; border-radius: 6px; color: #991b1b; font-weight: 600; margin: 0;">
                    Email alert bhej diya gaya hai. Kripya turant Emergency Helpline 112 par direct call karein!
                  </p>
                </div>
              `,
              confirmButtonColor: "#dc2626",
              confirmButtonText: "Open Tracking Map",
            }).then(() => {
              window.location.href = "/sostracking";
            });
            return;
          }

          Swal.fire({
            icon: "success",
            title: "🚨 SOS Alert Sent!",
            text: "Aapka live location volunteers aur trusted contacts ko share ho gaya hai. Tracking map open ho raha hai...",
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

    getAccurateLocation(user).then((loc) => {
      sendSOS(loc.lat, loc.lng, loc.address);
    });
  });
};
