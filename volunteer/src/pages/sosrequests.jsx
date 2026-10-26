import { useState, useEffect, useRef } from "react";
import Axios from "axios";
import Swal from "sweetalert2";
import { io } from "socket.io-client";
import { getAccurateLocation } from "../utils/geoService";

// Precise Haversine distance calculator
function computeDistance(lat1, lon1, lat2, lon2) {
  if (
    lat1 === undefined ||
    lat1 === null ||
    lon1 === undefined ||
    lon1 === null ||
    lat2 === undefined ||
    lat2 === null ||
    lon2 === undefined ||
    lon2 === null
  ) {
    return null;
  }
  const R = 6371; // Earth's radius in km
  const dLat = ((Number(lat2) - Number(lat1)) * Math.PI) / 180;
  const dLon = ((Number(lon2) - Number(lon1)) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((Number(lat1) * Math.PI) / 180) *
      Math.cos((Number(lat2) * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = R * c;
  const meters = Math.round(km * 1000);
  if (meters < 1000) {
    return `${meters} meters`;
  }
  return `${km.toFixed(2)} km`;
}

function SOSRequests() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [volunteerUser] = useState(() => {
    const rawData =
      sessionStorage.getItem("mydata") || localStorage.getItem("mydata");
    if (!rawData) return null;

    try {
      return JSON.parse(rawData);
    } catch (error) {
      console.error("Unable to read volunteer login information:", error);
      return null;
    }
  });

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const womanMarkerRef = useRef(null);
  const volunteerMarkerRef = useRef(null);
  const polylineRef = useRef(null);
  const watchIdRef = useRef(null);
  const socketRef = useRef(null);

  // 2. Fetch SOS Requests from Backend
  const fetchSOSRequests = async () => {
    try {
      const res = await Axios.get("http://localhost:3000/api/sos/all");
      if (res.data && res.data.requests) {
        const formatted = res.data.requests.map((r) => {
          const createdAt = new Date(r.createdAt);
          const timeStr = createdAt.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          const dateStr = createdAt.toLocaleDateString([], {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });

          return {
            id: r._id,
            displayId: `SOS-${r._id.slice(-4).toUpperCase()}`,
            user: r.womanName || "Anonymous User",
            email: r.womanEmail || "",
            phone: r.womanPhone || "Not provided",
            emergency: r.emergencyType || "Emergency Assistance",
            location: r.womanAddress || "Current GPS Location",
            time: timeStr,
            date: dateStr,
            priority: r.priority || "High",
            status: r.status || "Pending",
            rejectedByVolunteerIds: r.rejectedByVolunteerIds || [],
            locationShared: Boolean(r.volunteerLocationShared),
            distance: r.distance || "Pending location",
            womanLat: r.womanLat || 22.3072,
            womanLng: r.womanLng || 73.1812,
            volunteerLat: r.volunteerLat || null,
            volunteerLng: r.volunteerLng || null,
            volunteerName: r.volunteerName || null,
            volunteerPhone: r.volunteerPhone || null,
            volunteerId: r.volunteerId ? String(r.volunteerId) : null,
            description:
              "The user has triggered an SOS and is requesting immediate volunteer assistance.",
          };
        });

        const currentVolunteerId = String(volunteerUser?.user_id || "");

        const visibleRequests = formatted.filter((item) => {
          const rejectedByMe = (item.rejectedByVolunteerIds || []).some(
            (id) => String(id) === currentVolunteerId,
          );
          if (rejectedByMe) return false;
          if (item.status === "Pending") return true;
          if (["Approved", "Active"].includes(item.status)) {
            return item.volunteerId === currentVolunteerId;
          }
          return false;
        });
        setRequests(visibleRequests);

        // Check for targetSosId from Emergency Alert Banner or notification
        const targetId = localStorage.getItem("targetSosId");
        if (targetId) {
          const match = visibleRequests.find((item) => item.id === targetId);
          if (match) {
            setSelectedRequest(match);
            localStorage.removeItem("targetSosId");
            setTimeout(() => {
              const el = document.getElementById("volunteer-live-map-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }, 300);
          }
        } else if (selectedRequest) {
          // Keep selected request updated if currently opened
          const updatedSelected = visibleRequests.find(
            (item) => item.id === selectedRequest.id,
          );
          if (updatedSelected) {
            setSelectedRequest(updatedSelected);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching SOS alerts:", err);
    }
  };

  // 3. Socket.IO Real-Time Connection (Replaced Polling)
  useEffect(() => {
    const initialFetch = window.setTimeout(() => {
      fetchSOSRequests();
    }, 0);

    const socket = io("http://localhost:3000", {
      transports: ["polling", "websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("⚡ SafeHer Volunteer Portal connected to Socket.IO");
      socket.emit("join_volunteers");
      if (selectedRequest?.id) {
        socket.emit("join_sos", selectedRequest.id);
      }
    });

    // 1. New SOS Alert incoming from Woman
    socket.on("new_sos_alert", (newAlert) => {
      fetchSOSRequests();
      Swal.fire({
        icon: "warning",
        title: "🚨 NEW SOS ALERT!",
        text: `Emergency from ${newAlert.womanName || "A Woman in distress"}. Check your queue!`,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 5000,
      });
    });

    // 2. SOS Updated (Status / Distance / Location)
    socket.on("sos_updated", () => {
      fetchSOSRequests();
    });

    // 3. Woman's Live Location moving in real-time
    socket.on("woman_location_updated", (data) => {
      setSelectedRequest((prev) => {
        if (!prev || prev.id !== data.sosId) return prev;
        const dist =
          data.distance ||
          (prev.volunteerLat && prev.volunteerLng
            ? computeDistance(
                data.womanLat,
                data.womanLng,
                prev.volunteerLat,
                prev.volunteerLng,
              )
            : prev.distance);

        return {
          ...prev,
          womanLat: data.womanLat,
          womanLng: data.womanLng,
          distance: dist,
        };
      });
    });

    // 4. Volunteer's location updated
    socket.on("volunteer_location_updated", (data) => {
      setSelectedRequest((prev) => {
        if (!prev || prev.id !== data.sosId) return prev;
        return {
          ...prev,
          volunteerLat: data.volunteerLat,
          volunteerLng: data.volunteerLng,
          distance: data.distance || prev.distance,
          status: data.status || prev.status,
        };
      });
    });

    // 5. Dismissed / Rejected
    socket.on("sos_rejected", ({ sosId, volunteerId }) => {
      if (
        volunteerUser?.user_id &&
        String(volunteerUser.user_id) === String(volunteerId)
      ) {
        setRequests((prev) => prev.filter((request) => request.id !== sosId));
        setSelectedRequest((prev) => (prev?.id === sosId ? null : prev));
      }
    });

    return () => {
      window.clearTimeout(initialFetch);
      socket.disconnect();
    };
  }, []);

  // Join SOS room when selectedRequest changes
  useEffect(() => {
    if (selectedRequest?.id && socketRef.current) {
      socketRef.current.emit("join_sos", selectedRequest.id);
    }
  }, [selectedRequest?.id]);

  // 4. Leaflet Map Rendering
  useEffect(() => {
    if (!selectedRequest || !mapContainerRef.current) return;
    const L = window.L;
    if (!L) return;

    const wLat = selectedRequest.womanLat || 22.3072;
    const wLng = selectedRequest.womanLng || 73.1812;

    // Default volunteer coordinates (if not yet set, place near woman for demo)
    const vLat = selectedRequest.volunteerLat || wLat + 0.009;
    const vLng = selectedRequest.volunteerLng || wLng + 0.008;

    // Initialize Map
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([wLat, wLng], 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Custom Woman Icon (Red pulse)
    const womanIcon = L.divIcon({
      className: "custom-leaflet-marker",
      html: `
        <div style="position:relative;display:flex;align-items:center;justify-content:center;width:44px;height:44px;">
          <div style="position:absolute;width:100%;height:100%;background:rgba(239,68,68,0.35);border-radius:50%;animation:sosPulseRing 1.8s infinite;"></div>
          <div style="width:34px;height:34px;background:#ef4444;border:3px solid #ffffff;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(239,68,68,0.5);font-size:16px;">
            👩
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    // Custom Volunteer Icon (Green pulse)
    const volunteerIcon = L.divIcon({
      className: "custom-leaflet-marker",
      html: `
        <div style="position:relative;display:flex;align-items:center;justify-content:center;width:44px;height:44px;">
          <div style="position:absolute;width:100%;height:100%;background:rgba(16,185,129,0.35);border-radius:50%;animation:sosPulseRing 1.8s infinite;"></div>
          <div style="width:34px;height:34px;background:#10b981;border:3px solid #ffffff;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(16,185,129,0.5);font-size:16px;">
            🚶
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    // Update / Set Woman Marker
    const womanCoords = [wLat, wLng];
    if (!womanMarkerRef.current) {
      womanMarkerRef.current = L.marker(womanCoords, { icon: womanIcon })
        .addTo(map)
        .bindPopup(
          `<b>Woman's Location (Distress)</b><br/><b>User:</b> ${selectedRequest.user}<br/>📍 ${selectedRequest.location}`,
        );
    } else {
      womanMarkerRef.current.setLatLng(womanCoords);
    }

    // If request is Approved/Active or volunteer coords exist, show Volunteer marker
    if (
      selectedRequest.status === "Approved" ||
      selectedRequest.status === "Active" ||
      selectedRequest.volunteerLat
    ) {
      const volCoords = [vLat, vLng];

      if (!volunteerMarkerRef.current) {
        volunteerMarkerRef.current = L.marker(volCoords, {
          icon: volunteerIcon,
        })
          .addTo(map)
          .bindPopup(
            `<b>You (Volunteer)</b><br/>Heading towards ${selectedRequest.user}`,
          );
      } else {
        volunteerMarkerRef.current.setLatLng(volCoords);
      }

      // Draw dashed route line
      if (!polylineRef.current) {
        polylineRef.current = L.polyline([womanCoords, volCoords], {
          color: "#2563eb",
          weight: 4,
          dashArray: "6, 8",
          opacity: 0.85,
        }).addTo(map);
      } else {
        polylineRef.current.setLatLngs([womanCoords, volCoords]);
      }

      // Fit bounds to display both markers nicely
      try {
        map.fitBounds([womanCoords, volCoords], {
          padding: [50, 50],
          maxZoom: 16,
        });
      } catch (error) {
        console.warn("Unable to fit the SOS map to both locations:", error);
      }
    } else {
      // Pending state: Center on Woman
      if (volunteerMarkerRef.current) {
        map.removeLayer(volunteerMarkerRef.current);
        volunteerMarkerRef.current = null;
      }
      if (polylineRef.current) {
        map.removeLayer(polylineRef.current);
        polylineRef.current = null;
      }
      map.setView(womanCoords, 15);
    }

    // Ensure map tiles calculate correct container dimensions without grey areas
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);
  }, [selectedRequest]);

  // Clean map on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // =========================================
  // APPROVE SOS (Captures Volunteer GPS & updates DB)
  // =========================================
  const approveSOS = (id) => {
    const reqItem = requests.find((r) => r.id === id);
    if (!reqItem) return;

    Swal.fire({
      title: "Approve SOS Request?",
      text: `Do you want to respond to ${reqItem.user}'s emergency alert and share your live location?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#15803d",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Approve & Respond",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (!result.isConfirmed) return;

      Swal.fire({
        title: "Fetching Your GPS Location...",
        text: "Acquiring your current position...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const sendApproval = (volLat, volLng) => {
        Axios.put(`http://localhost:3000/api/sos/approve/${id}`, {
          volunteerId: volunteerUser?.user_id || "VOL-101",
          volunteerName: volunteerUser?.name || "Komal Volunteer",
          volunteerEmail: volunteerUser?.email || "volunteer@safeher.com",
          volunteerPhone: volunteerUser?.contact_no || "+91 98765 43210",
          volunteerPhoto: volunteerUser?.profile_photo || "",
          volunteerLat: volLat,
          volunteerLng: volLng,
        })
          .then((res) => {
            Swal.fire({
              icon: "success",
              title: "SOS Approved!",
              text: "You are assigned to this emergency. Live distance tracking is now active.",
              confirmButtonColor: "#15803d",
            });

            // Update local state
            const updated = {
              ...reqItem,
              status: "Approved",
              locationShared: true,
              volunteerLat: volLat,
              volunteerLng: volLng,
              distance:
                res.data.sos?.distance ||
                (volLat && volLng
                  ? computeDistance(
                      reqItem.womanLat,
                      reqItem.womanLng,
                      volLat,
                      volLng,
                    )
                  : "Location syncing..."),
            };

            setRequests((prev) =>
              prev.map((item) => (item.id === id ? updated : item)),
            );
            setSelectedRequest(updated);

            // Auto scroll to map
            setTimeout(() => {
              const el = document.getElementById("volunteer-live-map-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }, 300);
          })
          .catch((err) => {
            Swal.fire({
              icon: "error",
              title: "Approval Failed",
              text:
                err.response?.data?.message || "Failed to approve SOS request.",
            });
          });
      };

      getAccurateLocation(volunteerUser)
        .then((loc) => {
          sendApproval(loc.lat, loc.lng);
        })
        .catch((err) => {
          console.warn("Volunteer GPS fallback error:", err);
          sendApproval(null, null);
        });
    });
  };

  // =========================================
  // REJECT SOS
  // =========================================
  const rejectSOS = async (id) => {
    const result = await Swal.fire({
      title: "Reject SOS Request?",
      text: "This dismisses the request only from your queue. Other volunteers can still respond.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Reject",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    const volunteerId = volunteerUser?.user_id;
    if (!volunteerId) {
      await Swal.fire({
        icon: "error",
        title: "Volunteer Login Required",
        text: "Please sign in again before dismissing an SOS request.",
      });
      return;
    }

    try {
      await Axios.put(`http://localhost:3000/api/sos/reject/${id}`, {
        volunteerId: String(volunteerId),
      });

      setRequests((prev) => prev.filter((item) => item.id !== id));
      setSelectedRequest((prev) => (prev?.id === id ? null : prev));

      await Swal.fire({
        icon: "success",
        title: "Request Dismissed",
        text: "This SOS remains Pending and available to other volunteers.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Could Not Cancel Request",
        text:
          error.response?.data?.message ||
          "The SOS request could not be dismissed. Please try again.",
      });
    }
  };

  // =========================================
  // SHARE LIVE LOCATION (Continuous broadcast)
  // =========================================
  const shareLiveLocation = (id) => {
    const reqItem = requests.find((item) => item.id === id);
    if (!reqItem) return;

    if (isBroadcasting) {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsBroadcasting(false);
      Swal.fire({
        icon: "info",
        title: "Location Broadcasting Stopped",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    setIsBroadcasting(true);
    Swal.fire({
      icon: "success",
      title: "Live Location Broadcasting Started!",
      text: "Your moving coordinates will be sent to the woman user in real-time.",
      timer: 2000,
      showConfirmButton: false,
    });

    setSelectedRequest({
      ...reqItem,
      status: "Active",
      locationShared: true,
    });

    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          // 1. Emit live location via Socket.IO for 0-latency instant delivery
          if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit("update_volunteer_location", {
              sosId: id,
              volunteerLat: lat,
              volunteerLng: lng,
            });
          }

          // 2. Persist update in database via API
          Axios.put(
            `http://localhost:3000/api/sos/update-volunteer-location/${id}`,
            { volunteerLat: lat, volunteerLng: lng },
          )
            .then((res) => {
              const updatedDist =
                res.data.sos?.distance ||
                computeDistance(reqItem.womanLat, reqItem.womanLng, lat, lng);
              setSelectedRequest((prev) =>
                prev
                  ? {
                      ...prev,
                      volunteerLat: lat,
                      volunteerLng: lng,
                      distance: updatedDist,
                      status: "Active",
                    }
                  : null,
              );
            })
            .catch(() => {});
        },
        (err) => console.warn("Watch position error:", err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
      );
    }
  };

  // =========================================
  // RESOLVE SOS
  // =========================================
  const resolveSOS = async (id) => {
    const result = await Swal.fire({
      title: "Resolve SOS?",
      text: "Confirm that assistance for this emergency is complete.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Resolve",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    const volunteerId = volunteerUser?._id || volunteerUser?.user_id;

    if (!volunteerId) {
      Swal.fire(
        "Error",
        "Volunteer ID not found. Please log in again.",
        "error",
      );
      return;
    }

    try {
      const response = await Axios.put(
        `http://localhost:3000/api/sos/resolve/${id}`,
        { volunteerId },
      );

      // Stop live location sharing if it is running
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      setIsBroadcasting(false);

      // Remove the resolved SOS from the active requests list
      setRequests((prev) => prev.filter((item) => item.id !== id));

      // Clear the selected request/map
      setSelectedRequest(null);

      Swal.fire("Resolved", response.data.message, "success");
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to resolve SOS.",
        "error",
      );
    }
  };

  // =========================================
  // STYLES
  // =========================================
  const getStatusStyle = (status) => {
    const stylesMap = {
      Pending: { background: "#fff7ed", color: "#c2410c" },
      Approved: { background: "#eff6ff", color: "#2563eb" },
      Active: { background: "#dcfce7", color: "#15803d" },
      Cancelled: { background: "#f3f4f6", color: "#6b7280" },
      Resolved: { background: "#ecfdf5", color: "#047857" },
    };

    return {
      ...(stylesMap[status] || stylesMap.Pending),
      padding: "5px 12px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: "700",
      display: "inline-block",
    };
  };

  const styles = {
    page: {
      padding: "30px",
      background: "#f8f9fc",
      minHeight: "100vh",
      fontFamily: "'Inter', sans-serif",
    },
    header: {
      marginBottom: "25px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "15px",
    },
    title: {
      margin: "0",
      fontSize: "28px",
      fontWeight: "800",
      color: "#1f2937",
    },
    subtitle: {
      marginTop: "6px",
      color: "#6b7280",
      fontSize: "14px",
    },
    tableContainer: {
      background: "#ffffff",
      borderRadius: "12px",
      border: "1px solid #e5e7eb",
      overflow: "hidden",
      boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
    },
    tableHeader: {
      padding: "20px 24px",
      borderBottom: "1px solid #e5e7eb",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    tableTitle: {
      margin: "0",
      fontSize: "18px",
      fontWeight: "700",
      color: "#1f2937",
    },
    tableSubtitle: {
      margin: "4px 0 0",
      fontSize: "12px",
      color: "#9ca3af",
    },
    tableWrapper: {
      width: "100%",
      overflowX: "auto",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: "1050px",
    },
    th: {
      padding: "14px 18px",
      textAlign: "left",
      fontSize: "11px",
      fontWeight: "700",
      color: "#6b7280",
      background: "#f9fafb",
      borderBottom: "1px solid #e5e7eb",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    td: {
      padding: "16px 18px",
      fontSize: "13px",
      color: "#374151",
      borderBottom: "1px solid #f1f2f4",
    },
    id: {
      fontWeight: "700",
      color: "#1f2937",
    },
    approveButton: {
      border: "none",
      background: "#15803d",
      color: "#ffffff",
      padding: "7px 14px",
      borderRadius: "6px",
      fontSize: "12px",
      fontWeight: "700",
      cursor: "pointer",
      marginRight: "6px",
    },
    rejectButton: {
      border: "none",
      background: "#fee2e2",
      color: "#b91c1c",
      padding: "7px 12px",
      borderRadius: "6px",
      fontSize: "12px",
      fontWeight: "600",
      cursor: "pointer",
    },
    shareButton: {
      border: "none",
      background: isBroadcasting ? "#ea580c" : "#2563eb",
      color: "#ffffff",
      padding: "7px 14px",
      borderRadius: "6px",
      fontSize: "12px",
      fontWeight: "700",
      cursor: "pointer",
    },
    viewButton: {
      border: "none",
      background: "#f0fdf4",
      color: "#15803d",
      padding: "7px 14px",
      borderRadius: "6px",
      fontSize: "12px",
      fontWeight: "700",
      cursor: "pointer",
    },
    liveSection: {
      marginTop: "30px",
      display: "grid",
      gridTemplateColumns: "340px 1fr",
      gap: "24px",
    },
    detailCard: {
      background: "#ffffff",
      borderRadius: "12px",
      border: "1px solid #e5e7eb",
      overflow: "hidden",
      boxShadow: "0 4px 15px rgba(0,0,0,0.04)",
    },
    detailHeader: {
      padding: "18px 20px",
      borderBottom: "1px solid #e5e7eb",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    detailTitle: {
      margin: "0",
      fontSize: "17px",
      fontWeight: "700",
      color: "#1f2937",
    },
    detailBody: {
      padding: "20px",
    },
    userName: {
      fontSize: "19px",
      fontWeight: "800",
      color: "#1f2937",
      marginBottom: "4px",
    },
    requestId: {
      fontSize: "12px",
      color: "#9ca3af",
      marginBottom: "16px",
    },
    detailRow: {
      display: "flex",
      justifyContent: "space-between",
      padding: "11px 0",
      borderBottom: "1px solid #f1f2f4",
      gap: "10px",
      fontSize: "13px",
    },
    detailLabel: {
      color: "#6b7280",
    },
    detailValue: {
      fontWeight: "700",
      color: "#1f2937",
      textAlign: "right",
    },
    resolveButton: {
      width: "100%",
      border: "none",
      background: "#15803d",
      color: "#ffffff",
      padding: "12px",
      borderRadius: "8px",
      marginTop: "20px",
      fontWeight: "700",
      fontSize: "14px",
      cursor: "pointer",
    },
    mapCard: {
      background: "#ffffff",
      borderRadius: "12px",
      border: "1px solid #e5e7eb",
      overflow: "hidden",
      boxShadow: "0 4px 15px rgba(0,0,0,0.04)",
    },
    mapHeader: {
      padding: "18px 20px",
      borderBottom: "1px solid #e5e7eb",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
  };

  // Render Action Button
  const renderAction = (request) => {
    if (request.status === "Pending") {
      return (
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            style={{
              ...styles.approveButton,
              whiteSpace: "nowrap",
              padding: "7px 12px",
              fontSize: "12px",
            }}
            onClick={() => approveSOS(request.id)}
            title="Accept SOS, share location and open live map"
          >
            ✓ Accept & Open Map
          </button>
          <button
            style={styles.rejectButton}
            onClick={() => rejectSOS(request.id)}
            title="Reject request"
          >
            ✕ Reject
          </button>
        </div>
      );
    }

    if (request.status === "Approved" || request.status === "Active") {
      return (
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            style={{
              ...styles.viewButton,
              whiteSpace: "nowrap",
              padding: "7px 12px",
              fontSize: "12px",
            }}
            onClick={() => {
              setSelectedRequest(request);
              setTimeout(() => {
                const el = document.getElementById(
                  "volunteer-live-map-section",
                );
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }, 200);
            }}
            title="View Live Tracking Map & Distance"
          >
            🗺️ View Map
          </button>
          <button
            style={{
              ...styles.shareButton,
              whiteSpace: "nowrap",
              padding: "7px 10px",
              fontSize: "11px",
            }}
            onClick={() => shareLiveLocation(request.id)}
            title="Broadcast live GPS coordinates"
          >
            {isBroadcasting ? "🛑 Stop GPS" : "📍 Share GPS"}
          </button>
        </div>
      );
    }

    if (request.status === "Resolved") {
      return <span style={getStatusStyle("Resolved")}>Completed</span>;
    }
    if (request.status === "Cancelled") {
      return <span style={getStatusStyle("Cancelled")}>Dismissed</span>;
    }
  };

  return (
    <div style={styles.page}>
      <style>
        {`
          @keyframes sosPulseRing {
            0% { transform: scale(0.9); opacity: 1; }
            50% { transform: scale(1.4); opacity: 0.3; }
            100% { transform: scale(1.6); opacity: 0; }
          }
          .custom-leaflet-marker {
            background: transparent !important;
            border: none !important;
          }
        `}
      </style>

      {/* ============PAGE HEADER================ */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>SOS Emergency Requests</h1>
          <p style={styles.subtitle}>
            Review live distress alerts from women users, approve requests, and
            share your live location with real-time distance tracking.
          </p>
        </div>

        <button
          onClick={fetchSOSRequests}
          style={{
            background: "#ffffff",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            padding: "8px 16px",
            fontWeight: "600",
            fontSize: "13px",
            cursor: "pointer",
            color: "#374151",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <i className="fa-solid fa-arrows-rotate"></i>
          Refresh Alerts
        </button>
      </div>

      {/* ==========EMERGENCY REQUEST TABLE============= */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <div>
            <h2 style={styles.tableTitle}>Active Incoming Requests</h2>
            <p style={styles.tableSubtitle}>
              Live alerts synced with SafeHer Women-User portal
            </p>
          </div>

          <span
            style={{
              background: "#dcfce7",
              color: "#15803d",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "700",
            }}
          >
            ● Live Socket.IO Active
          </span>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>SOS ID</th>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Location</th>
                <th style={styles.th}>Time</th>
                <th style={styles.th}>Priority</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Distance</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>

            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#64748b",
                    }}
                  >
                    <div style={{ fontSize: "28px", marginBottom: "8px" }}>
                      🛡️
                    </div>
                    <strong>No active SOS emergencies right now.</strong>
                    <div style={{ fontSize: "12px", marginTop: "4px" }}>
                      When a woman user activates the SOS button, it will appear
                      here instantly.
                    </div>
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr
                    key={request.id}
                    style={{
                      background:
                        selectedRequest?.id === request.id
                          ? "#f0fdf4"
                          : "#ffffff",
                    }}
                  >
                    <td style={{ ...styles.td, ...styles.id }}>
                      {request.displayId}
                    </td>

                    <td style={styles.td}>
                      <strong>{request.user}</strong>
                    </td>

                    <td style={styles.td}>
                      {request.phone !== "Not provided" ? (
                        <a
                          href={`tel:${request.phone}`}
                          style={{ color: "#2563eb", textDecoration: "none" }}
                        >
                          {request.phone}
                        </a>
                      ) : (
                        <span style={{ color: "#9ca3af" }}>-</span>
                      )}
                    </td>

                    <td style={styles.td}>📍 {request.location}</td>

                    <td style={styles.td}>{request.time}</td>

                    <td style={styles.td}>
                      <span
                        style={{
                          background:
                            request.priority === "High" ? "#fee2e2" : "#fef3c7",
                          color:
                            request.priority === "High" ? "#b91c1c" : "#b45309",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: "700",
                        }}
                      >
                        {request.priority}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <span style={getStatusStyle(request.status)}>
                        {request.status}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <strong style={{ color: "#15803d" }}>
                        {request.distance || "-"}
                      </strong>
                    </td>

                    <td style={styles.td}>{renderAction(request)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================
          LIVE LOCATION & MAP TRACKING SECTION
      ========================================= */}
      {selectedRequest && (
        <div id="volunteer-live-map-section" style={styles.liveSection}>
          {/* DETAIL CARD */}
          <div style={styles.detailCard}>
            <div style={styles.detailHeader}>
              <h2 style={styles.detailTitle}>Distress Details</h2>
              <span style={getStatusStyle(selectedRequest.status)}>
                {selectedRequest.status}
              </span>
            </div>

            <div style={styles.detailBody}>
              <h3 style={styles.userName}>{selectedRequest.user}</h3>
              <div style={styles.requestId}>
                Request ID: {selectedRequest.displayId}
              </div>

              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Emergency Type</span>
                <span style={styles.detailValue}>
                  {selectedRequest.emergency}
                </span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Location</span>
                <span style={styles.detailValue}>
                  {selectedRequest.location}
                </span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Phone</span>
                <span style={styles.detailValue}>{selectedRequest.phone}</span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Triggered Time</span>
                <span style={styles.detailValue}>{selectedRequest.time}</span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Live Distance</span>
                <span
                  style={{
                    ...styles.detailValue,
                    color: "#15803d",
                    fontSize: "15px",
                  }}
                >
                  {selectedRequest.distance}
                </span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Status</span>
                <span style={getStatusStyle(selectedRequest.status)}>
                  {selectedRequest.status}
                </span>
              </div>

              {/* Action buttons */}
              {selectedRequest.status === "Approved" ||
              selectedRequest.status === "Active" ? (
                <>
                  <button
                    style={{
                      ...styles.shareButton,
                      width: "100%",
                      padding: "12px",
                      marginTop: "16px",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                    onClick={() => shareLiveLocation(selectedRequest.id)}
                  >
                    {isBroadcasting
                      ? "🛑 Stop Sharing Location"
                      : "📡 Broadcast Live GPS Coordinates"}
                  </button>

                  <button
                    style={styles.resolveButton}
                    onClick={() => resolveSOS(selectedRequest.id)}
                  >
                    ✓ Mark SOS as Resolved
                  </button>
                </>
              ) : selectedRequest.status === "Pending" ? (
                <button
                  style={{
                    ...styles.approveButton,
                    width: "100%",
                    padding: "12px",
                    marginTop: "16px",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                  onClick={() => approveSOS(selectedRequest.id)}
                >
                  ✓ Approve & Respond to SOS
                </button>
              ) : null}

              {/* Direct Google Maps Directions link */}
              {selectedRequest.womanLat && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedRequest.womanLat},${selectedRequest.womanLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "block",
                    textAlign: "center",
                    marginTop: "12px",
                    color: "#2563eb",
                    fontSize: "13px",
                    fontWeight: "600",
                    textDecoration: "none",
                  }}
                >
                  <i className="fa-solid fa-arrow-up-right-from-square me-1"></i>
                  Open in Google Maps Directions
                </a>
              )}
            </div>
          </div>

          {/* ============= LIVE LOCATION LEAFLET MAP ============= */}
          <div style={styles.mapCard}>
            <div style={styles.mapHeader}>
              <div>
                <h2 style={styles.detailTitle}>Live GPS Tracking & Route</h2>
                <small style={{ color: "#6b7280" }}>
                  Real-time distance calculated via Haversine formula
                </small>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#dcfce7",
                  color: "#15803d",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontSize: "11px",
                  fontWeight: "700",
                }}
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: "#16a34a",
                    animation: "sosPulseRing 1.5s infinite",
                  }}
                ></span>
                LIVE RADAR ACTIVE
              </div>
            </div>

            {/* REAL LEAFLET MAP CONTAINER */}
            <div style={{ position: "relative" }}>
              <div
                ref={mapContainerRef}
                style={{
                  height: "440px",
                  width: "100%",
                  background: "#f1f5f9",
                }}
              />

              {/* FLOATING DISTANCE HUD BOX */}
              <div
                style={{
                  position: "absolute",
                  right: "15px",
                  bottom: "15px",
                  background: "#ffffff",
                  padding: "12px 18px",
                  borderRadius: "10px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
                  zIndex: 1000,
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: "700",
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "2px",
                  }}
                >
                  LIVE DISTANCE
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "800",
                    color: "#15803d",
                  }}
                >
                  {selectedRequest.distance}
                </div>
              </div>

              {/* MAP LEGEND */}
              <div
                style={{
                  position: "absolute",
                  left: "15px",
                  bottom: "15px",
                  background: "#ffffff",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
                  zIndex: 1000,
                  fontSize: "12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    fontWeight: "700",
                    color: "#374151",
                    marginBottom: "6px",
                    fontSize: "11px",
                  }}
                >
                  MAP LEGEND
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "4px",
                  }}
                >
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: "#ef4444",
                    }}
                  ></span>
                  <span>Woman's Location</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: "#10b981",
                    }}
                  ></span>
                  <span>Your Location (Volunteer)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SOSRequests;
