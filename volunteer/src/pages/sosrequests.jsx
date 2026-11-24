import { useState, useEffect, useRef } from "react";
import Axios from "axios";
import Swal from "sweetalert2";
import { io } from "socket.io-client";
import { getAccurateLocation } from "../utils/geoService";
import "../volunteer-css/sosrequest.css";

// Straight-line distance between two GPS coordinates
function computeDistance(lat1, lon1, lat2, lon2) {
  const values = [lat1, lon1, lat2, lon2];

  if (
    values.some(
      (value) =>
        value === null ||
        value === undefined ||
        value === "" ||
        !Number.isFinite(Number(value)),
    )
  ) {
    return null;
  }

  lat1 = Number(lat1);
  lon1 = Number(lon1);
  lat2 = Number(lat2);
  lon2 = Number(lon2);

  if (
    Math.abs(lat1) > 90 ||
    Math.abs(lat2) > 90 ||
    Math.abs(lon1) > 180 ||
    Math.abs(lon2) > 180
  ) {
    return null;
  }

  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const rawA =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const a = Math.min(1, Math.max(0, rawA));
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = R * c;
  const meters = Math.round(km * 1000);

  return meters < 1000 ? `${meters} meters` : `${km.toFixed(2)} km`;
}

function getGoogleMapsDirectionsUrl(request) {
  const params = new URLSearchParams({
    api: "1",
    destination: `${Number(request.womanLat)},${Number(request.womanLng)}`,
  });

  const volunteerLat = Number(request.volunteerLat);
  const volunteerLng = Number(request.volunteerLng);
  if (
    request.volunteerLat != null &&
    request.volunteerLng != null &&
    Number.isFinite(volunteerLat) &&
    Number.isFinite(volunteerLng) &&
    Math.abs(volunteerLat) <= 90 &&
    Math.abs(volunteerLng) <= 180
  ) {
    params.set("origin", `${volunteerLat},${volunteerLng}`);
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function SOSRequests() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastingSosId, setBroadcastingSosId] = useState(null);
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
  const lastMapSosIdRef = useRef(null);
  const womanMarkerRef = useRef(null);
  const volunteerMarkerRef = useRef(null);
  const polylineRef = useRef(null);
  const watchIdRef = useRef(null);
  const socketRef = useRef(null);
  const hasReceivedFirstGPSRef = useRef(false);

  // 2. Fetch SOS Requests from Backend
  const fetchSOSRequests = async (manualRefresh = false) => {
    if (manualRefresh) setIsRefreshing(true);

    try {
      const res = await Axios.get("http://localhost:3000/api/sos/all", {
        headers: {
          Authorization: `Bearer ${volunteerUser?.token || ""}`,
        },
      });
      if (!Array.isArray(res.data?.requests)) {
        throw new Error("The SOS alerts response is invalid.");
      }

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
          womanLat: r.womanLat ?? null,
          womanLng: r.womanLng ?? null,
          womanAccuracy: r.womanAccuracy ?? null,
          volunteerLat: r.volunteerLat ?? null,
          volunteerLng: r.volunteerLng ?? null,
          volunteerAccuracy: r.volunteerAccuracy ?? null,
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
      setSelectedRequest((previous) => {
        if (!previous) return previous;
        return visibleRequests.find((item) => item.id === previous.id) || null;
      });

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
      }
    } catch (err) {
      console.error("Error fetching SOS alerts:", err);
      if (manualRefresh) {
        Swal.fire({
          icon: "error",
          title: "Refresh failed",
          text:
            err.response?.data?.message ||
            err.message ||
            "Could not load SOS alerts. Please try again.",
        });
      }
    } finally {
      if (manualRefresh) setIsRefreshing(false);
    }
  };

  // 3. Socket.IO Real-Time Connection (Replaced Polling)
  useEffect(() => {
    const initialFetch = window.setTimeout(() => {
      fetchSOSRequests();
    }, 0);

    const socket = io("http://localhost:3000", {
      transports: ["polling", "websocket"],
      auth: { token: volunteerUser?.token },
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
      const lat = Number(data?.womanLat);
      const lng = Number(data?.womanLng);

      const hasValidLocation =
        data?.womanLat != null &&
        data?.womanLng != null &&
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180;

      if (!hasValidLocation) {
        console.warn("Invalid woman GPS coordinates received:", data);
        return;
      }

      setSelectedRequest((prev) => {
        if (!prev || prev.id !== data.sosId) return prev;

        const hasValidVolunteerLocation =
          prev.volunteerLat != null &&
          prev.volunteerLng != null &&
          Number.isFinite(Number(prev.volunteerLat)) &&
          Number.isFinite(Number(prev.volunteerLng)) &&
          Number(prev.volunteerLat) >= -90 &&
          Number(prev.volunteerLat) <= 90 &&
          Number(prev.volunteerLng) >= -180 &&
          Number(prev.volunteerLng) <= 180;

        const dist =
          data.distance ||
          (hasValidVolunteerLocation
            ? computeDistance(
                lat,
                lng,
                Number(prev.volunteerLat),
                Number(prev.volunteerLng),
              )
            : prev.distance);

        return {
          ...prev,
          womanLat: lat,
          womanLng: lng,
          womanAccuracy:
            data.womanAccuracy ?? data.sos?.womanAccuracy ?? prev.womanAccuracy,
          location:
            data.womanAddress || data.sos?.womanAddress || prev.location,
          distance: dist,
        };
      });
    });

    // 4. Volunteer's location updated
    socket.on("volunteer_location_updated", (data) => {
      const lat = Number(data?.volunteerLat);
      const lng = Number(data?.volunteerLng);

      const hasValidLocation =
        data?.volunteerLat != null &&
        data?.volunteerLng != null &&
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180;

      if (!hasValidLocation) {
        console.warn("Invalid volunteer GPS coordinates received:", data);
        return;
      }

      setSelectedRequest((prev) => {
        if (!prev || prev.id !== data.sosId) return prev;

        return {
          ...prev,
          volunteerLat: lat,
          volunteerLng: lng,
          volunteerAccuracy:
            data.volunteerAccuracy ??
            data.sos?.volunteerAccuracy ??
            prev.volunteerAccuracy,
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

    const wLat = selectedRequest.womanLat;
    const wLng = selectedRequest.womanLng;

    const hasWomanLocation =
      wLat != null &&
      wLng != null &&
      Number.isFinite(Number(wLat)) &&
      Number.isFinite(Number(wLng)) &&
      Number(wLat) >= -90 &&
      Number(wLat) <= 90 &&
      Number(wLng) >= -180 &&
      Number(wLng) <= 180;

    const vLat = selectedRequest.volunteerLat;
    const vLng = selectedRequest.volunteerLng;

    const hasVolunteerLocation =
      vLat != null &&
      vLng != null &&
      Number.isFinite(Number(vLat)) &&
      Number.isFinite(Number(vLng)) &&
      Number(vLat) >= -90 &&
      Number(vLat) <= 90 &&
      Number(vLng) >= -180 &&
      Number(vLng) <= 180;

    const isNewSOS = lastMapSosIdRef.current !== selectedRequest.id;

    // Initialize Map
    // Initialize map only when valid Woman GPS coordinates exist
    if (!mapInstanceRef.current) {
      if (!hasWomanLocation) return;

      const map = L.map(mapContainerRef.current).setView(
        [Number(wLat), Number(wLng)],
        14,
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    if (isNewSOS && hasWomanLocation) {
      map.setView([Number(wLat), Number(wLng)], 14);
      lastMapSosIdRef.current = selectedRequest.id;
    }

    // Remove old markers if the selected SOS has no valid Woman GPS
    if (!hasWomanLocation) {
      if (womanMarkerRef.current) {
        map.removeLayer(womanMarkerRef.current);
        womanMarkerRef.current = null;
      }

      if (volunteerMarkerRef.current) {
        map.removeLayer(volunteerMarkerRef.current);
        volunteerMarkerRef.current = null;
      }

      if (polylineRef.current) {
        map.removeLayer(polylineRef.current);
        polylineRef.current = null;
      }
      return;
    }

    const womanIcon = L.divIcon({
      className: "custom-leaflet-marker",
      html: `
    <div class="sos-marker-wrapper">
      <div class="sos-marker-pulse sos-woman-pulse"></div>
      <div class="sos-marker-icon sos-woman-marker-icon">👩</div>
    </div>
  `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const volunteerIcon = L.divIcon({
      className: "custom-leaflet-marker",
      html: `
    <div class="sos-marker-wrapper">
      <div class="sos-marker-pulse sos-volunteer-pulse"></div>
      <div class="sos-marker-icon sos-volunteer-marker-icon">🚶</div>
    </div>
  `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    // Update / Set Woman Marker using actual GPS coordinates
    const womanCoords = [Number(wLat), Number(wLng)];

    if (!womanMarkerRef.current) {
      womanMarkerRef.current = L.marker(womanCoords, {
        icon: womanIcon,
      })
        .addTo(map)
        .bindPopup(
          `<b>Woman's Location (Distress)</b><br/><b>User:</b> ${selectedRequest.user}<br/>📍 ${selectedRequest.location}`,
        );
    } else {
      womanMarkerRef.current.setLatLng(womanCoords);
      womanMarkerRef.current.setPopupContent(
        `<b>Woman's Location (Distress)</b><br/><b>User:</b> ${selectedRequest.user}<br/>📍 ${selectedRequest.location}`,
      );
    }

    // Show Volunteer marker and route only when actual GPS coordinates exist
    if (
      hasWomanLocation &&
      hasVolunteerLocation &&
      (selectedRequest.status === "Approved" ||
        selectedRequest.status === "Active")
    ) {
      const volCoords = [Number(vLat), Number(vLng)];

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

      // Draw route using actual GPS coordinates
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

      // Fit map to both actual locations
      map.fitBounds([womanCoords, volCoords], {
        padding: [50, 50],
        maxZoom: 16,
      });
    } else {
      // Remove Volunteer marker and route if actual GPS is unavailable
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
    const volunteerId = String(volunteerUser?.user_id || "");

    if (!volunteerId) {
      Swal.fire({
        icon: "error",
        title: "Volunteer Login Required",
        text: "Please log in again before approving an SOS request.",
      });
      return;
    }

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
        text: "Acquiring your current device position...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const sendApproval = (volLat, volLng, accuracy) => {
        const latitude = Number(volLat);
        const longitude = Number(volLng);

        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude) ||
          latitude < -90 ||
          latitude > 90 ||
          longitude < -180 ||
          longitude > 180
        ) {
          Swal.fire({
            icon: "error",
            title: "Invalid GPS Location",
            text: "Valid device GPS coordinates are required to approve this SOS.",
          });
          return;
        }

        Axios.put(
          `http://localhost:3000/api/sos/approve/${id}`,
          {
            volunteerId,
            volunteerName: volunteerUser?.name || "Volunteer",
            volunteerEmail: volunteerUser?.email || "",
            volunteerPhone: volunteerUser?.contact_no || "",
            volunteerPhoto: volunteerUser?.profile_photo || "",
            volunteerLat: latitude,
            volunteerLng: longitude,
            volunteerAccuracy: accuracy,
          },
          {
            headers: {
              Authorization: `Bearer ${volunteerUser?.token || ""}`,
            },
          },
        )
          .then((res) => {
            Swal.fire({
              icon: "success",
              title: "SOS Approved!",
              text: "You are assigned to this emergency. Live distance tracking is now active.",
              confirmButtonColor: "#15803d",
            });

            const updated = {
              ...reqItem,
              status: "Approved",
              locationShared: true,
              volunteerLat: latitude,
              volunteerLng: longitude,
              volunteerAccuracy: accuracy,
              distance:
                res.data.sos?.distance ||
                computeDistance(
                  reqItem.womanLat,
                  reqItem.womanLng,
                  latitude,
                  longitude,
                ) ||
                "Location syncing...",
              volunteerId,
            };

            setRequests((prev) =>
              prev.map((item) => (item.id === id ? updated : item)),
            );

            setSelectedRequest(updated);

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
          if (!loc || loc.lat == null || loc.lng == null) {
            throw new Error("Device GPS coordinates are unavailable.");
          }

          sendApproval(loc.lat, loc.lng, loc.accuracy);
        })
        .catch((err) => {
          console.warn("Volunteer GPS error:", err);

          Swal.fire({
            icon: "error",
            title: "Unable to Get GPS Location",
            text:
              err.code === 1
                ? "Location permission is denied. Please allow location access in your browser settings and try again."
                : err.code === 3
                  ? "Your device could not get GPS location in time. Please move near a window or outdoors and try again."
                  : err.message ||
                    "Please enable device location and try again.",
            confirmButtonColor: "#16a34a",
          });
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
      await Axios.put(
        `http://localhost:3000/api/sos/reject/${id}`,
        { volunteerId: String(volunteerId) },
        {
          headers: {
            Authorization: `Bearer ${volunteerUser?.token || ""}`,
          },
        },
      );

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

    if (isBroadcasting && broadcastingSosId === id) {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsBroadcasting(false);
      setBroadcastingSosId(null);
      hasReceivedFirstGPSRef.current = false;
      Swal.fire({
        icon: "info",
        title: "Location Broadcasting Stopped",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    if (isBroadcasting && broadcastingSosId !== id) {
      Swal.fire({
        icon: "warning",
        title: "GPS Already Sharing",
        text: "Please stop the current SOS location sharing before starting another one.",
        confirmButtonColor: "#15803d",
      });
      return;
    }

    if (!navigator.geolocation) {
      Swal.fire({
        icon: "error",
        title: "GPS Not Supported",
        text: "Your browser does not support device location. Please use a supported browser.",
        confirmButtonColor: "#15803d",
      });
      return;
    }
    hasReceivedFirstGPSRef.current = false;
    setIsBroadcasting(true);
    setBroadcastingSosId(id);
    Swal.fire({
      icon: "info",
      title: "Starting GPS...",
      text: "Waiting for your device's current location.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = pos.coords.accuracy;

          if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng) ||
            !Number.isFinite(accuracy) ||
            accuracy < 0 ||
            lat < -90 ||
            lat > 90 ||
            lng < -180 ||
            lng > 180
          ) {
            console.warn("Invalid volunteer GPS coordinates received.");
            return;
          }
          if (!hasReceivedFirstGPSRef.current) {
            hasReceivedFirstGPSRef.current = true;
            Swal.fire({
              icon: "success",
              title: "Live GPS Started!",
              text: "Your actual device location is now being shared.",
              timer: 1800,
              showConfirmButton: false,
            });
          }
          // 1. Emit live location via Socket.IO for 0-latency instant delivery
          if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit("update_volunteer_location", {
              sosId: id,
              volunteerLat: lat,
              volunteerLng: lng,
              volunteerAccuracy: accuracy,
            });
          }

          // 2. Persist update in database via API
          Axios.put(
            `http://localhost:3000/api/sos/update-volunteer-location/${id}`,
            {
              volunteerLat: lat,
              volunteerLng: lng,
              volunteerAccuracy: accuracy,
            },
            {
              headers: {
                Authorization: `Bearer ${volunteerUser?.token || ""}`,
              },
            },
          )
            .then((res) => {
              setSelectedRequest((prev) => {
                if (prev?.id !== id) return prev;

                return {
                  ...prev,
                  volunteerLat: lat,
                  volunteerLng: lng,
                  volunteerAccuracy: accuracy,
                  distance:
                    res.data.sos?.distance ||
                    computeDistance(prev.womanLat, prev.womanLng, lat, lng) ||
                    "Calculating...",
                  status: "Active",
                };
              });
            })
            .catch((error) => {
              console.error(
                "Volunteer live location API failed:",
                error.response?.data || error.message,
              );
            });
        },
        (err) => {
          console.warn("Watch position error:", err);

          if (!hasReceivedFirstGPSRef.current) {
            if (watchIdRef.current !== null) {
              navigator.geolocation.clearWatch(watchIdRef.current);
              watchIdRef.current = null;
            }

            hasReceivedFirstGPSRef.current = false;
            setIsBroadcasting(false);
            setBroadcastingSosId(null);
            Swal.close();

            Swal.fire({
              icon: "error",
              title: "Unable to Get GPS Location",
              text:
                err.code === 1
                  ? "Location permission is denied. Please allow location access in your browser settings and try again."
                  : err.code === 3
                    ? "Your device could not get GPS location in time. Please try again outdoors or near a window."
                    : err.message ||
                      "Please enable device location and try again.",
              confirmButtonColor: "#15803d",
            });
          }
        },
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
        {
          headers: {
            Authorization: `Bearer ${volunteerUser?.token || ""}`,
          },
        },
      );

      // Stop live location only if this SOS is currently broadcasting
      if (broadcastingSosId === id) {
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }

        setIsBroadcasting(false);
        setBroadcastingSosId(null);
        hasReceivedFirstGPSRef.current = false;
      }

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

  // ====STATUS CLASS===//
  const getStatusClass = (status) => {
    const statusClasses = {
      Pending: "sos-status-pending",
      Approved: "sos-status-approved",
      Active: "sos-status-active",
      Cancelled: "sos-status-cancelled",
      Resolved: "sos-status-resolved",
    };

    return `sos-status ${statusClasses[status] || "sos-status-pending"}`;
  };

  // ===RENDER ACTION BUTTON//
  const renderAction = (request) => {
    if (request.status === "Pending") {
      return (
        <div className="sos-action-group">
          <button
            className="sos-button sos-approve-button"
            onClick={() => approveSOS(request.id)}
            title="Accept SOS, share location and open live map"
          >
            ✓ Accept & Open Map
          </button>

          <button
            className="sos-button sos-reject-button"
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
        <div className="sos-action-group">
          <button
            className="sos-button sos-view-button"
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
            className={`sos-button sos-share-button ${
              isBroadcasting && broadcastingSosId === request.id
                ? "is-broadcasting"
                : ""
            }`}
            onClick={() => shareLiveLocation(request.id)}
            title="Broadcast live GPS coordinates"
          >
            {isBroadcasting && broadcastingSosId === request.id
              ? "🛑 Stop GPS"
              : "📍 Share GPS"}
          </button>
        </div>
      );
    }

    if (request.status === "Resolved") {
      return <span className={getStatusClass("Resolved")}>Completed</span>;
    }

    if (request.status === "Cancelled") {
      return <span className={getStatusClass("Cancelled")}>Dismissed</span>;
    }

    return null;
  };

  // ======JSX=====//
  return (
    <div className="sos-page">
      {/* PAGE HEADER */}
      <div className="sos-header">
        <div>
          <h1 className="sos-title">SOS Emergency Requests</h1>
          <p className="sos-subtitle">
            Review live distress alerts from women users, approve requests, and
            share your live location with real-time distance tracking.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchSOSRequests(true)}
          disabled={isRefreshing}
          aria-busy={isRefreshing}
          className="sos-refresh-button"
        >
          <i
            className={`fa-solid fa-arrows-rotate${
              isRefreshing ? " fa-spin" : ""
            }`}
          ></i>

          {isRefreshing ? "Refreshing..." : "Refresh Alerts"}
        </button>
      </div>

      {/* EMERGENCY REQUEST TABLE */}
      <div className="sos-table-container">
        <div className="sos-table-header">
          <div>
            <h2 className="sos-table-title">Active Incoming Requests</h2>

            <p className="sos-table-subtitle">
              Live alerts synced with SafeHer Women-User portal
            </p>
          </div>

          <span className="sos-live-badge">● Live Socket.IO Active</span>
        </div>

        <div className="sos-table-wrapper">
          <table className="sos-table">
            <thead>
              <tr>
                <th>SOS ID</th>
                <th>User</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Time</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Straight-line distance</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="9" className="sos-empty-cell">
                    <div className="sos-empty-icon">🛡️</div>

                    <strong>No active SOS emergencies right now.</strong>

                    <div className="sos-empty-description">
                      When a woman user activates the SOS button, it will appear
                      here instantly.
                    </div>
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr
                    key={request.id}
                    className={
                      selectedRequest?.id === request.id
                        ? "sos-selected-row"
                        : ""
                    }
                  >
                    <td className="sos-table-id">{request.displayId}</td>

                    <td>
                      <strong>{request.user}</strong>
                    </td>

                    <td>
                      {request.phone !== "Not provided" ? (
                        <a
                          href={`tel:${request.phone}`}
                          className="sos-table-phone"
                        >
                          {request.phone}
                        </a>
                      ) : (
                        <span className="sos-not-provided">-</span>
                      )}
                    </td>

                    <td>📍 {request.location}</td>

                    <td>{request.time}</td>

                    <td>
                      <span
                        className={`sos-priority ${
                          request.priority === "High"
                            ? "sos-priority-high"
                            : "sos-priority-normal"
                        }`}
                      >
                        {request.priority}
                      </span>
                    </td>

                    <td>
                      <span className={getStatusClass(request.status)}>
                        {request.status}
                      </span>
                    </td>

                    <td>
                      <strong className="sos-distance">
                        {request.distance || "-"}
                      </strong>
                    </td>

                    <td>{renderAction(request)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LIVE LOCATION & MAP TRACKING SECTION */}
      {selectedRequest && (
        <div id="volunteer-live-map-section" className="sos-live-section">
          {/* DETAIL CARD */}
          <div className="sos-detail-card">
            <div className="sos-detail-header">
              <h2 className="sos-detail-title">Distress Details</h2>

              <span className={getStatusClass(selectedRequest.status)}>
                {selectedRequest.status}
              </span>
            </div>

            <div className="sos-detail-body">
              <h3 className="sos-user-name">{selectedRequest.user}</h3>

              <div className="sos-request-id">
                Request ID: {selectedRequest.displayId}
              </div>

              <div className="sos-detail-row">
                <span className="sos-detail-label">Emergency Type</span>

                <span className="sos-detail-value">
                  {selectedRequest.emergency}
                </span>
              </div>

              <div className="sos-detail-row">
                <span className="sos-detail-label">Location</span>

                <span className="sos-detail-value">
                  {selectedRequest.location}
                </span>
              </div>

              <div className="sos-detail-row">
                <span className="sos-detail-label">Phone</span>

                <span className="sos-detail-value">
                  {selectedRequest.phone}
                </span>
              </div>

              <div className="sos-detail-row">
                <span className="sos-detail-label">Triggered Time</span>

                <span className="sos-detail-value">{selectedRequest.time}</span>
              </div>

              <div className="sos-detail-row">
                <span className="sos-detail-label">Straight-line distance</span>

                <span className="sos-detail-value sos-detail-distance">
                  {selectedRequest.distance}
                </span>
              </div>

              <div className="sos-detail-row">
                <span className="sos-detail-label">Status</span>

                <span className={getStatusClass(selectedRequest.status)}>
                  {selectedRequest.status}
                </span>
              </div>

              {/* ACTION BUTTONS */}
              {selectedRequest.status === "Approved" ||
              selectedRequest.status === "Active" ? (
                <>
                  <button
                    className={`sos-button sos-share-button sos-detail-share-button ${
                      isBroadcasting && broadcastingSosId === selectedRequest.id
                        ? "is-broadcasting"
                        : ""
                    }`}
                    onClick={() => shareLiveLocation(selectedRequest.id)}
                  >
                    {isBroadcasting && broadcastingSosId === selectedRequest.id
                      ? "🛑 Stop Sharing Location"
                      : "📡 Broadcast Live GPS Coordinates"}
                  </button>

                  <button
                    className="sos-resolve-button"
                    onClick={() => resolveSOS(selectedRequest.id)}
                  >
                    ✓ Mark SOS as Resolved
                  </button>
                </>
              ) : selectedRequest.status === "Pending" ? (
                <button
                  className="sos-button sos-approve-button sos-detail-approve-button"
                  onClick={() => approveSOS(selectedRequest.id)}
                >
                  ✓ Approve & Respond to SOS
                </button>
              ) : null}

              {/* GOOGLE MAPS DIRECTIONS */}
              {selectedRequest.womanLat != null &&
                selectedRequest.womanLng != null &&
                Number.isFinite(Number(selectedRequest.womanLat)) &&
                Number.isFinite(Number(selectedRequest.womanLng)) &&
                Number(selectedRequest.womanLat) >= -90 &&
                Number(selectedRequest.womanLat) <= 90 &&
                Number(selectedRequest.womanLng) >= -180 &&
                Number(selectedRequest.womanLng) <= 180 && (
                  <a
                    href={getGoogleMapsDirectionsUrl(selectedRequest)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sos-google-maps-link"
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square me-1"></i>
                    Open in Google Maps Directions
                  </a>
                )}
            </div>
          </div>

          {/* LIVE LOCATION LEAFLET MAP */}
          <div className="sos-map-card">
            <div className="sos-map-header">
              <div>
                <h2 className="sos-detail-title">Live GPS Tracking</h2>

                <small>
                  Live straight-line distance calculated from GPS coordinates
                </small>
              </div>

              <div className="sos-radar-badge">
                <span className="sos-radar-dot"></span>
                LIVE RADAR ACTIVE
              </div>
            </div>

            {/* MAP CONTAINER */}
            <div className="sos-map-content">
              <div ref={mapContainerRef} className="sos-map-container" />

              {/* FLOATING DISTANCE BOX */}
              <div className="sos-map-hud">
                <div className="sos-map-hud-label">LIVE DISTANCE</div>

                <div className="sos-map-hud-distance">
                  {selectedRequest.distance}
                </div>
              </div>

              {/* MAP LEGEND */}
              <div className="sos-map-legend">
                <div className="sos-map-legend-title">MAP LEGEND</div>

                <div className="sos-map-legend-item">
                  <span className="sos-map-legend-dot sos-woman-dot"></span>
                  <span>Woman's Location</span>
                </div>

                <div className="sos-map-legend-item">
                  <span className="sos-map-legend-dot sos-volunteer-dot"></span>
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
