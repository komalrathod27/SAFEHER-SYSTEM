import { useState, useEffect, useRef } from "react";
import Axios from "axios";
import Swal from "sweetalert2";
import { io } from "socket.io-client";
import {
  getAccurateLocation,
  reverseGeocode,
} from "../utils/geoService";

// Precise Haversine distance calculator
function computeDistanceMeters(lat1, lon1, lat2, lon2) {
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
  const coordinates = [lat1, lon1, lat2, lon2].map(Number);
  if (
    coordinates.some((value) => !Number.isFinite(value)) ||
    Math.abs(coordinates[0]) > 90 ||
    Math.abs(coordinates[2]) > 90 ||
    Math.abs(coordinates[1]) > 180 ||
    Math.abs(coordinates[3]) > 180
  ) {
    return null;
  }
  [lat1, lon1, lat2, lon2] = coordinates;
  const R = 6371000;
  const dLat = ((Number(lat2) - Number(lat1)) * Math.PI) / 180;
  const dLon = ((Number(lon2) - Number(lon1)) * Math.PI) / 180;
  const rawA =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((Number(lat1) * Math.PI) / 180) *
      Math.cos((Number(lat2) * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const a = Math.min(1, Math.max(0, rawA));
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function computeDistance(lat1, lon1, lat2, lon2) {
  const meters = computeDistanceMeters(lat1, lon1, lat2, lon2);
  if (meters === null) return null;
  if (meters < 1000) {
    return `${Math.round(meters)} meters`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

function SOSTracking() {
  const [user, setUser] = useState(null);
  const [activeSos, setActiveSos] = useState(null);
  const [volunteerTrustScore, setVolunteerTrustScore] = useState(null);
  const [volunteerBadges, setVolunteerBadges] = useState([]);
  const [showVolunteerDetails, setShowVolunteerDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sharingLocation, setSharingLocation] = useState(true);
  const [distanceText, setDistanceText] = useState("");
  const [geoError, setGeoError] = useState("");

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const womanMarkerRef = useRef(null);
  const volunteerMarkerRef = useRef(null);
  const polylineRef = useRef(null);
  const watchIdRef = useRef(null);
  const socketRef = useRef(null);
  const latestWomanPositionRef = useRef(null);
  const currentWomanAddressRef = useRef("");
  const lastReverseGeocodeRef = useRef({
    lat: null,
    lng: null,
    requestedAt: 0,
  });

  const applySosUpdate = (updatedSos, notifyResolved = false) => {
    if (!updatedSos?._id) return;

    setActiveSos((prev) => {
      if (!prev || String(prev._id) !== String(updatedSos._id)) return prev;
      if (
        ["Resolved", "Cancelled"].includes(prev.status) &&
        !["Resolved", "Cancelled"].includes(updatedSos.status)
      ) {
        return prev;
      }

      if (
        notifyResolved &&
        updatedSos.status === "Resolved" &&
        prev.status !== "Resolved"
      ) {
        Swal.fire({
          icon: "success",
          title: "Emergency Resolved",
          text: "Volunteer has marked this emergency as safely resolved.",
          timer: 3000,
          showConfirmButton: false,
        });
      }
      return updatedSos;
    });
  };

  // 1. Check Login
  useEffect(() => {
    const rawData = localStorage.getItem("mydata");
    if (!rawData) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to access Emergency SOS live tracking.",
        confirmButtonColor: "#e11d48",
      }).then(() => {
        window.location.href = "/login";
      });
      return;
    }

    try {
      const parsed = JSON.parse(rawData);
      setUser(parsed);
      fetchActiveSOS(parsed.user_id, parsed.token);
    } catch {
      localStorage.removeItem("mydata");
      window.location.href = "/login";
    }
  }, []);

  // 2. Fetch Active SOS from backend
  const fetchActiveSOS = async (womanId, token) => {
    try {
      const res = await Axios.get(
        `http://localhost:3000/api/sos/active/${womanId}`,
        {
          headers: { Authorization: `Bearer ${token || ""}` },
        },
      );
      if (res.data.active && res.data.sos) {
        const sos = res.data.sos;
        latestWomanPositionRef.current = {
          lat: Number(sos.womanLat),
          lng: Number(sos.womanLng),
          accuracy: Number(sos.womanAccuracy),
        };
        currentWomanAddressRef.current = sos.womanAddress || "";
        lastReverseGeocodeRef.current = {
          lat: Number(sos.womanLat),
          lng: Number(sos.womanLng),
          requestedAt: Date.now(),
        };
        // If status just became Approved, notify woman
        setActiveSos((prev) => {
          if (
            prev &&
            prev.status === "Pending" &&
            (sos.status === "Approved" || sos.status === "Active")
          ) {
            Swal.fire({
              icon: "success",
              title: "Volunteer Accepted!",
              text: `${sos.volunteerName || "A verified volunteer"} has accepted your SOS and is heading to your live location.`,
              timer: 3500,
              showConfirmButton: false,
            });
          }
          return sos;
        });
        localStorage.setItem("activeSosId", sos._id);
      } else {
        setActiveSos(null);
        localStorage.removeItem("activeSosId");
      }
    } catch (err) {
      console.error("Error fetching active SOS:", err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Socket.IO Real-Time Connection & Live Updates (Replaced Polling)
  useEffect(() => {
    let sessionToken = "";
    try {
      sessionToken =
        JSON.parse(localStorage.getItem("mydata") || "null")?.token || "";
    } catch (error) {
      console.error("Unable to read woman session for live tracking:", error);
    }

    const socket = io("http://localhost:3000", {
      transports: ["websocket", "polling"],
      auth: { token: sessionToken },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("⚡ SafeHer Woman Portal connected to Socket.IO");
    });

    // Real-time volunteer live location broadcast
    socket.on("volunteer_location_updated", (data) => {
      setActiveSos((prev) => {
        if (!prev || prev._id !== data.sosId) return prev;
        const dist =
          data.distance ||
          computeDistance(
            prev.womanLat,
            prev.womanLng,
            data.volunteerLat,
            data.volunteerLng,
          );
        return {
          ...prev,
          volunteerLat: data.volunteerLat,
          volunteerLng: data.volunteerLng,
          volunteerAccuracy:
            data.volunteerAccuracy ??
            data.sos?.volunteerAccuracy ??
            prev.volunteerAccuracy,
          distance: dist,
          status: data.status || prev.status,
        };
      });
    });

    socket.on("woman_location_updated", (data) => {
      setActiveSos((prev) => {
        if (!prev || prev._id !== data.sosId) return prev;
        return {
          ...prev,
          womanLat: data.womanLat,
          womanLng: data.womanLng,
          womanAccuracy: data.womanAccuracy ?? prev.womanAccuracy,
          womanAddress:
            data.womanAddress || data.sos?.womanAddress || prev.womanAddress,
          distance: data.distance || prev.distance,
        };
      });
      currentWomanAddressRef.current =
        data.womanAddress ||
        data.sos?.womanAddress ||
        currentWomanAddressRef.current;
    });

    // Real-time volunteer acceptance
    socket.on("sos_approved", (updatedSos) => {
      setActiveSos((prev) => {
        if (!prev || prev._id !== updatedSos._id) return prev;
        Swal.fire({
          icon: "success",
          title: "Volunteer Accepted!",
          text: `${updatedSos.volunteerName || "A verified volunteer"} has accepted your SOS and is heading to your live location.`,
          timer: 3500,
          showConfirmButton: false,
        });
        return updatedSos;
      });
    });

    socket.on("sos_resolved", (updatedSos) => {
      applySosUpdate(updatedSos, true);
    });

    // Handle status changes too, for server paths that only emit this event.
    socket.on("sos_status_changed", (updatedSos) => {
      applySosUpdate(updatedSos, true);
    });

    // General updates
    socket.on("sos_updated", (updatedSos) => {
      applySosUpdate(updatedSos);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Join SOS Room whenever active SOS changes
  useEffect(() => {
    const socket = socketRef.current;
    if (!activeSos?._id || !socket) return;

    const sosId = String(activeSos._id);
    const joinRoomAndSync = () => {
      socket.emit("join_sos", sosId, (result) => {
        if (result?.error) {
          console.error("Failed to subscribe to SOS updates:", result.error);
          return;
        }

        Axios.get(`http://localhost:3000/api/sos/details/${sosId}`, {
          headers: {
            Authorization: `Bearer ${user?.token || ""}`,
          },
        })
          .then((res) => applySosUpdate(res.data, true))
          .catch((error) => {
            console.error(
              "Failed to sync SOS status after joining room:",
              error,
            );
          });
      });
    };

    socket.on("connect", joinRoomAndSync);
    if (socket.connected) joinRoomAndSync();

    return () => {
      socket.off("connect", joinRoomAndSync);
      if (socket.connected) {
        socket.emit("leave_sos", sosId);
      }
    };
  }, [activeSos?._id]);

  // 4. Continuously watch and sync woman's live location via Socket.IO & API
  useEffect(() => {
    if (
      !activeSos ||
      activeSos.status === "Resolved" ||
      activeSos.status === "Cancelled"
    ) {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      return;
    }

    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        let latitude = pos.coords.latitude;
        let longitude = pos.coords.longitude;
        const accuracy = pos.coords.accuracy;
        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude) ||
          !Number.isFinite(accuracy) ||
          accuracy < 0 ||
          latitude < -90 ||
          latitude > 90 ||
          longitude < -180 ||
          longitude > 180
        ) {
          console.warn("Invalid GPS coordinates received.");
          return;
        }
        const address = currentWomanAddressRef.current || "Live GPS Location";
        latestWomanPositionRef.current = {
          lat: latitude,
          lng: longitude,
          accuracy,
        };

        // 1. Emit live location via Socket.IO for 0-latency instant delivery
        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.emit("update_woman_location", {
            sosId: activeSos._id,
            womanLat: latitude,
            womanLng: longitude,
            womanAccuracy: accuracy,
            womanAddress: address,
          });
        }

        // 2. Persist update in database via API
        Axios.put(
          `http://localhost:3000/api/sos/update-woman-location/${activeSos._id}`,
          {
            womanLat: latitude,
            womanLng: longitude,
            womanAccuracy: accuracy,
            womanAddress: address,
          },
          {
            headers: {
              Authorization: `Bearer ${user?.token || ""}`,
            },
          },
        ).catch((error) => {
          console.error("Failed to persist woman's live GPS location:", error);
        });

        const previousGeocode = lastReverseGeocodeRef.current;
        const movedMeters =
          previousGeocode.lat == null || previousGeocode.lng == null
            ? Number.POSITIVE_INFINITY
            : computeDistanceMeters(
                previousGeocode.lat,
                previousGeocode.lng,
                latitude,
                longitude,
              );
        if (
          movedMeters >= 150 &&
          Date.now() - previousGeocode.requestedAt >= 10000
        ) {
          const requestedAt = Date.now();
          lastReverseGeocodeRef.current = {
            ...previousGeocode,
            requestedAt,
          };
          reverseGeocode(latitude, longitude)
            .then((updatedAddress) => {
              const latestPosition = latestWomanPositionRef.current;
              if (
                !latestPosition ||
                computeDistanceMeters(
                  latitude,
                  longitude,
                  latestPosition.lat,
                  latestPosition.lng,
                ) > 100
              ) {
                return;
              }

              const update = {
                sosId: activeSos._id,
                womanLat: latestPosition.lat,
                womanLng: latestPosition.lng,
                womanAccuracy: latestPosition.accuracy,
                womanAddress: updatedAddress,
              };
              currentWomanAddressRef.current = updatedAddress;
              if (socketRef.current?.connected) {
                socketRef.current.emit("update_woman_location", update);
              }
              Axios.put(
                `http://localhost:3000/api/sos/update-woman-location/${activeSos._id}`,
                update,
                {
                  headers: {
                    Authorization: `Bearer ${user?.token || ""}`,
                  },
                },
              ).catch((error) => {
                console.error("Failed to update SOS address:", error);
              });
              lastReverseGeocodeRef.current = {
                lat: latitude,
                lng: longitude,
                requestedAt,
              };
            })
            .catch((error) => {
              console.error("Failed to resolve updated SOS address:", error);
            });
        }
      },
      (err) => {
        console.warn("Geolocation watch warning:", err.message);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 },
    );

    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [activeSos?._id, activeSos?.status]);

  // 5. Calculate Distance when Coordinates Change
  useEffect(() => {
    if (
      activeSos?.womanLat != null &&
      activeSos?.womanLng != null &&
      activeSos?.volunteerLat != null &&
      activeSos?.volunteerLng != null &&
      Number.isFinite(Number(activeSos.womanLat)) &&
      Number.isFinite(Number(activeSos.womanLng)) &&
      Number.isFinite(Number(activeSos.volunteerLat)) &&
      Number.isFinite(Number(activeSos.volunteerLng))
    ) {
      const dist = computeDistance(
        activeSos.womanLat,
        activeSos.womanLng,
        activeSos.volunteerLat,
        activeSos.volunteerLng,
      );
      setDistanceText(dist || activeSos.distance || "Calculating...");
    } else {
      setDistanceText("");
    }
  }, [activeSos]);

  //Fetch trust score and badges
  useEffect(() => {
    const volunteerId = activeSos?.volunteerId;
    if (!volunteerId) {
      setVolunteerTrustScore(null);
      setVolunteerBadges([]);
      return;
    }

    let cancelled = false;
    const fetchVolunteerStats = async () => {
      try {
        const [trustResponse, badgesResponse] = await Promise.all([
          Axios.get(`http://localhost:3000/api/sos/trust-score/${volunteerId}`),
          Axios.get(
            `http://localhost:3000/api/volunteer-badges/${volunteerId}`,
          ),
        ]);

        if (!cancelled) {
          setVolunteerTrustScore(trustResponse.data);
          setVolunteerBadges(badgesResponse.data.badges || []);
          console.log("Volunteer Trust Score:", trustResponse.data);
          console.log("Volunteer Badges:", badgesResponse.data);
        }
      } catch (error) {
        if (!cancelled) {
          setVolunteerTrustScore(null);
          setVolunteerBadges([]);
          console.error(
            "Error fetching volunteer stats:",
            error.response?.data || error.message,
          );
        }
      }
    };

    fetchVolunteerStats();
    return () => {
      cancelled = true;
    };
  }, [activeSos?.volunteerId]);

  //Badge Priority
  const badgePriority = [
    "trusted-volunteer",
    "emergency-champion",
    "fast-responder",
    "consistent-guardian",
    "helping-hand",
  ];

  const featuredBadge = badgePriority
    .map((key) =>
      volunteerBadges.find((badge) => badge.key === key && badge.earned),
    )
    .find(Boolean);

  // 6. Initialize and Update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const L = window.L;
    if (!L) return;

    const wLat = activeSos?.womanLat ?? null;
    const wLng = activeSos?.womanLng ?? null;

    const hasWomanLocation =
      Number.isFinite(Number(wLat)) &&
      Number.isFinite(Number(wLng)) &&
      wLat !== null &&
      wLng !== null;

    const hasVolunteerLocation =
      activeSos?.volunteerLat != null &&
      activeSos?.volunteerLng != null &&
      Number.isFinite(Number(activeSos.volunteerLat)) &&
      Number.isFinite(Number(activeSos.volunteerLng));

    // Initialize map only when actual woman GPS coordinates exist
    let map = mapInstanceRef.current;

    if (!map) {
      if (!hasWomanLocation) return;

      map = L.map(mapContainerRef.current).setView(
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

    // Custom Woman Icon
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

    // Custom Volunteer Icon
    const volunteerIcon = L.divIcon({
      className: "custom-leaflet-marker",
      html: `
        <div style="position:relative;display:flex;align-items:center;justify-content:center;width:44px;height:44px;">
          <div style="position:absolute;width:100%;height:100%;background:rgba(16,185,129,0.35);border-radius:50%;animation:sosPulseRing 1.8s infinite;"></div>
          <div style="width:34px;height:34px;background:#10b981;border:3px solid #ffffff;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(16,185,129,0.5);font-size:16px;">
            🛡️
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    // Update / Create Woman Marker
    if (activeSos && hasWomanLocation) {
      const womanCoords = [Number(wLat), Number(wLng)];

      if (!womanMarkerRef.current) {
        womanMarkerRef.current = L.marker(womanCoords, { icon: womanIcon })
          .addTo(map)
          .bindPopup(
            `<b>Your Live Location</b><br/>${activeSos.womanName || "You"}`,
          );
      } else {
        womanMarkerRef.current.setLatLng(womanCoords);
      }
    } else if (womanMarkerRef.current) {
      map.removeLayer(womanMarkerRef.current);
      womanMarkerRef.current = null;
    }

    // Update / Create Volunteer Marker
    if (
      activeSos &&
      hasWomanLocation &&
      hasVolunteerLocation &&
      (activeSos.status === "Approved" || activeSos.status === "Active")
    ) {
      const volCoords = [
        Number(activeSos.volunteerLat),
        Number(activeSos.volunteerLng),
      ];
      if (!volunteerMarkerRef.current) {
        volunteerMarkerRef.current = L.marker(volCoords, {
          icon: volunteerIcon,
        })
          .addTo(map)
          .bindPopup(
            `<b>Responding Volunteer:</b> ${activeSos.volunteerName || "Volunteer"}<br/>Status: Heading to you!`,
          );
      } else {
        volunteerMarkerRef.current.setLatLng(volCoords);
      }

      // Polyline connecting Woman and Volunteer
      const womanCoords = [
        Number(activeSos.womanLat),
        Number(activeSos.womanLng),
      ];
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

      // Auto fit bounds to show both markers nicely
      try {
        map.fitBounds([womanCoords, volCoords], {
          padding: [50, 50],
          maxZoom: 16,
        });
      } catch {}
    } else {
      // Remove volunteer marker and line if not approved
      if (volunteerMarkerRef.current) {
        map.removeLayer(volunteerMarkerRef.current);
        volunteerMarkerRef.current = null;
      }
      if (polylineRef.current) {
        map.removeLayer(polylineRef.current);
        polylineRef.current = null;
      }
      if (activeSos && hasWomanLocation) {
        map.setView([activeSos.womanLat, activeSos.womanLng], 15);
      }
    }

    // Ensure map tiles recalculate container size
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);
  }, [activeSos]);

  // Trigger New SOS from this page
  const handleTriggerSOS = () => {
    if (!user) return;

    Swal.fire({
      title: "🚨 ACTIVATE EMERGENCY SOS?",
      text: "Your live GPS coordinates will be immediately sent to verified volunteers nearby.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#4b5563",
      confirmButtonText: "Yes, Activate SOS Now!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (!result.isConfirmed) return;

      Swal.fire({
        title: "Acquiring GPS Location...",
        text: "Please allow location access if prompted.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      getAccurateLocation(user)
        .then(async (loc) => {
          try {
            const res = await Axios.post(
              "http://localhost:3000/api/sos/create",
              {
                womanId: user.user_id,
                womanName: user.fullName,
                womanEmail: user.email,
                womanPhone: user.phoneNumber || "",
                womanLat: loc.lat,
                womanLng: loc.lng,
                womanAccuracy: loc.accuracy,
                womanAddress: loc.address,
                emergencyType: "Emergency SOS - Immediate Help Needed",
              },
              {
                headers: {
                  Authorization: `Bearer ${user?.token || ""}`,
                },
              },
            );

            setActiveSos(res.data.sos);
            latestWomanPositionRef.current = {
              lat: loc.lat,
              lng: loc.lng,
              accuracy: loc.accuracy,
            };
            lastReverseGeocodeRef.current = {
              lat: loc.lat,
              lng: loc.lng,
              requestedAt: Date.now(),
            };
            currentWomanAddressRef.current = loc.address;
            localStorage.setItem("activeSosId", res.data.sos._id);

            Swal.fire({
              icon: "success",
              title: "SOS Alert Broadcasted!",
              text: `Your live location (${loc.address}) has been shared. Device-reported accuracy: ±${Math.round(loc.accuracy)} m.`,
              confirmButtonColor: "#2563eb",
            });
          } catch (err) {
            Swal.fire({
              icon: "error",
              title: "Failed to Send SOS",
              text:
                err.response?.data?.message ||
                "Server error while triggering SOS.",
            });
          }
        })
        .catch((error) => {
          Swal.close();
          Swal.fire({
            icon: "error",
            title: "Unable to Get GPS Location",
            text:
              error.code === 1
                ? "Location permission is denied. Please allow location access in your browser settings and try again."
                : error.code === 3
                  ? "Your device could not get GPS location in time. Please move near a window or outdoors and try again."
                  : error.message ||
                    "Please enable device location and try again.",
            confirmButtonColor: "#dc2626",
          });
        });
    });
  };

  // Resolve / I am Safe
  const handleResolveSOS = () => {
    if (!activeSos) return;

    Swal.fire({
      title: "Are you safe now?",
      text: "This will conclude the active emergency alert and stop volunteer tracking.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, I Am Safe",
      cancelButtonText: "Keep Active",
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await Axios.put(
            `http://localhost:3000/api/sos/resolve/${activeSos._id}`,
            { womanId: user?.user_id || user?._id },
            {
              headers: {
                Authorization: `Bearer ${user?.token || ""}`,
              },
            },
          );
          Swal.fire({
            icon: "success",
            title: "SOS Resolved",
            text: "Glad you are safe! The emergency alert has been closed.",
            confirmButtonColor: "#16a34a",
          });
          setActiveSos(null);
          localStorage.removeItem("activeSosId");
        } catch {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to resolve SOS alert.",
          });
        }
      }
    });
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            className="spinner-border text-danger"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          ></div>
          <p style={{ marginTop: "15px", color: "#64748b", fontWeight: "600" }}>
            Loading Emergency SOS System...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "40px 15px 80px",
      }}
    >
      <style>
        {`
          @keyframes sosPulseRing {
            0% { transform: scale(0.9); opacity: 1; }
            50% { transform: scale(1.4); opacity: 0.3; }
            100% { transform: scale(1.6); opacity: 0; }
          }
          @keyframes sosBlink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
          .custom-leaflet-marker {
            background: transparent !important;
            border: none !important;
          }
        `}
      </style>

      <div className="container" style={{ maxWidth: "1150px" }}>
        {/* ================= TOP HEADER ================= */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "24px 30px",
            boxShadow: "0 4px 20px rgba(15,23,42,0.06)",
            marginBottom: "24px",
            border: "1px solid #e2e8f0",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "15px",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "6px",
              }}
            >
              <span
                style={{
                  background:
                    activeSos?.status === "Resolved"
                      ? "#dcfce7"
                      : activeSos?.status === "Cancelled"
                        ? "#f1f5f9"
                        : activeSos
                          ? "#fee2e2"
                          : "#f1f5f9",
                  color:
                    activeSos?.status === "Resolved"
                      ? "#15803d"
                      : activeSos?.status === "Cancelled"
                        ? "#475569"
                        : activeSos
                          ? "#dc2626"
                          : "#475569",
                  fontWeight: "700",
                  fontSize: "12px",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background:
                      activeSos?.status === "Resolved"
                        ? "#16a34a"
                        : activeSos
                          ? "#dc2626"
                          : "#94a3b8",
                    animation:
                      activeSos &&
                      !["Resolved", "Cancelled"].includes(activeSos.status)
                        ? "sosBlink 1.2s infinite"
                        : "none",
                  }}
                ></span>
                {activeSos?.status === "Resolved"
                  ? "SOS STATUS: RESOLVED"
                  : activeSos?.status === "Cancelled"
                    ? "SOS STATUS: CANCELLED"
                    : activeSos
                      ? "SOS STATUS: ACTIVE"
                      : "SOS STATUS: STANDBY"}
              </span>

              {activeSos && (
                <span
                  style={{
                    background: ["Approved", "Active", "Resolved"].includes(
                      activeSos.status,
                    )
                      ? "#dcfce7"
                      : activeSos.status === "Cancelled"
                        ? "#f1f5f9"
                        : "#fef3c7",
                    color: ["Approved", "Active", "Resolved"].includes(
                      activeSos.status,
                    )
                      ? "#15803d"
                      : activeSos.status === "Cancelled"
                        ? "#475569"
                        : "#b45309",
                    fontWeight: "700",
                    fontSize: "12px",
                    padding: "4px 12px",
                    borderRadius: "20px",
                  }}
                >
                  {activeSos.status === "Resolved"
                    ? "✓ Emergency Resolved"
                    : activeSos.status === "Cancelled"
                      ? "Emergency Cancelled"
                      : activeSos.status === "Approved" ||
                          activeSos.status === "Active"
                        ? "✓ Volunteer Assigned & Responding"
                        : "⏳ Waiting for Nearby Volunteer"}
                </span>
              )}
            </div>

            <h1
              style={{
                fontSize: "26px",
                fontWeight: "800",
                color: "#0f172a",
                margin: "0",
              }}
            >
              Live Emergency SOS & Volunteer Tracking
            </h1>
            <p
              style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}
            >
              Real-time GPS location sharing with verified SafeHer volunteers
              and live straight-line distance calculation.
            </p>
          </div>

          <div>
            {!activeSos ? (
              <button
                onClick={handleTriggerSOS}
                style={{
                  background:
                    "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  color: "#ffffff",
                  border: "none",
                  padding: "14px 28px",
                  borderRadius: "12px",
                  fontWeight: "700",
                  fontSize: "16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  boxShadow: "0 8px 20px rgba(220,38,38,0.35)",
                }}
              >
                <i className="fa-solid fa-triangle-exclamation"></i>
                Activate SOS Alert Now
              </button>
            ) : !["Resolved", "Cancelled"].includes(activeSos.status) ? (
              <button
                onClick={handleResolveSOS}
                style={{
                  background: "#16a34a",
                  color: "#ffffff",
                  border: "none",
                  padding: "13px 24px",
                  borderRadius: "12px",
                  fontWeight: "700",
                  fontSize: "15px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 6px 16px rgba(22,163,74,0.3)",
                }}
              >
                <i className="fa-solid fa-circle-check"></i>I Am Safe (Resolve
                Alert)
              </button>
            ) : null}
          </div>
        </div>

        {activeSos?.status === "Resolved" && (
          <div
            role="status"
            style={{
              background: "#f0fdf4",
              border: "1px solid #86efac",
              borderRadius: "12px",
              color: "#166534",
              fontWeight: "700",
              marginBottom: "24px",
              padding: "16px 20px",
            }}
          >
            Emergency resolved. The volunteer has marked this SOS as safely
            handled.
          </div>
        )}

        {activeSos?.status === "Cancelled" && (
          <div
            role="status"
            style={{
              background: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderRadius: "12px",
              color: "#475569",
              fontWeight: "700",
              marginBottom: "24px",
              padding: "16px 20px",
            }}
          >
            This emergency alert has been cancelled.
          </div>
        )}

        {/* ================= MAIN CONTENT ================= */}
        {activeSos ? (
          <div className="row g-4">
            {/* LEFT COLUMN: Map & Distance */}
            <div className="col-lg-8">
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(15,23,42,0.06)",
                  border: "1px solid #e2e8f0",
                }}
              >
                {/* Map Header with Distance HUD */}
                <div
                  style={{
                    padding: "16px 20px",
                    background: "#ffffff",
                    borderBottom: "1px solid #e2e8f0",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        background: "#fee2e2",
                        color: "#dc2626",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                      }}
                    >
                      <i className="fa-solid fa-map-location-dot"></i>
                    </div>
                    <div>
                      <h6
                        style={{
                          margin: "0",
                          fontWeight: "700",
                          color: "#0f172a",
                        }}
                      >
                        Interactive Live Tracking Map
                      </h6>
                      <small style={{ color: "#64748b" }}>
                        Live updates every 3 seconds
                      </small>
                    </div>
                  </div>

                  {/* PROMINENT DISTANCE BADGE */}
                  <div
                    style={{
                      background: distanceText ? "#ecfdf5" : "#fef3c7",
                      border: `1px solid ${distanceText ? "#a7f3d0" : "#fde68a"}`,
                      borderRadius: "10px",
                      padding: "8px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <i
                      className={`fa-solid ${distanceText ? "fa-route" : "fa-clock"}`}
                      style={{
                        color: distanceText ? "#059669" : "#d97706",
                        fontSize: "18px",
                      }}
                    ></i>
                    <div>
                      <div
                        style={{
                          fontSize: "10px",
                          fontWeight: "700",
                          color: distanceText ? "#047857" : "#b45309",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        DISTANCE TO VOLUNTEER
                      </div>
                      <div
                        style={{
                          fontSize: "17px",
                          fontWeight: "800",
                          color: distanceText ? "#065f46" : "#92400e",
                        }}
                      >
                        {distanceText || "Waiting for volunteer approval"}
                      </div>
                      <small style={{ color: "#64748b" }}>
                        Straight-line GPS distance
                      </small>
                    </div>
                  </div>
                </div>

                {/* Leaflet Map DOM Container */}
                <div
                  ref={mapContainerRef}
                  style={{
                    height: "460px",
                    width: "100%",
                    background: "#e2e8f0",
                    position: "relative",
                  }}
                />

                {/* Map Footer Legend */}
                <div
                  style={{
                    padding: "14px 20px",
                    background: "#f8fafc",
                    borderTop: "1px solid #e2e8f0",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "13px",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "20px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "7px",
                      }}
                    >
                      <span
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          background: "#ef4444",
                          display: "inline-block",
                        }}
                      ></span>
                      <strong style={{ color: "#334155" }}>
                        Your GPS Location (Distress)
                      </strong>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "7px",
                      }}
                    >
                      <span
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          background: "#10b981",
                          display: "inline-block",
                        }}
                      ></span>
                      <strong style={{ color: "#334155" }}>
                        Volunteer Live Location
                      </strong>
                    </div>
                  </div>

                  <span style={{ color: "#64748b", fontSize: "12px" }}>
                    Coordinates:{" "}
                    {activeSos.womanLat != null && activeSos.womanLng != null
                      ? `${Number(activeSos.womanLat).toFixed(6)}, ${Number(activeSos.womanLng).toFixed(6)}`
                      : "Location unavailable"}
                  </span>
                  {activeSos.womanAccuracy != null && (
                    <span style={{ color: "#64748b", fontSize: "12px" }}>
                      Device-reported GPS accuracy: ±
                      {Math.round(activeSos.womanAccuracy)} m
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Emergency Status & Volunteer Details */}
            <div className="col-lg-4">
              {/* Volunteer Details Card */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "16px",
                  padding: "24px",
                  boxShadow: "0 4px 20px rgba(15,23,42,0.06)",
                  border: "1px solid #e2e8f0",
                  marginBottom: "24px",
                }}
              >
                <h5
                  style={{
                    fontWeight: "700",
                    color: "#0f172a",
                    marginBottom: "16px",
                  }}
                >
                  <i className="fa-solid fa-user-shield text-primary me-2"></i>
                  Volunteer Assistance
                </h5>

                {activeSos.volunteerName ? (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "14px",
                        background: "#f0fdf4",
                        borderRadius: "12px",
                        border: "1px solid #bbf7d0",
                        marginBottom: "16px",
                      }}
                    >
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          background: "#16a34a",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "20px",
                          fontWeight: "700",
                        }}
                      >
                        {activeSos.volunteerName.charAt(0)}
                      </div>
                      <div>
                        <h6
                          style={{
                            margin: "0",
                            fontWeight: "700",
                            color: "#14532d",
                            fontSize: "16px",
                          }}
                        >
                          {activeSos.volunteerName}
                        </h6>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#16a34a",
                            fontWeight: "600",
                          }}
                        >
                          ✓ Verified SafeHer Volunteer
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        fontSize: "13px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "6px 0",
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      >
                        <span style={{ color: "#64748b" }}>Status</span>
                        <span style={{ color: "#15803d", fontWeight: "700" }}>
                          {activeSos.status === "Approved" ||
                          activeSos.status === "Active"
                            ? "Heading to your location"
                            : activeSos.status}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "6px 0",
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      >
                        <span style={{ color: "#64748b" }}>
                          Straight-line distance
                        </span>
                        <span style={{ color: "#0f172a", fontWeight: "700" }}>
                          {distanceText ||
                            activeSos.distance ||
                            "Location syncing..."}
                        </span>
                      </div>

                      {activeSos.volunteerPhone && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "6px 0",
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          <span style={{ color: "#64748b" }}>Contact</span>
                          <a
                            href={`tel:${activeSos.volunteerPhone}`}
                            style={{
                              color: "#2563eb",
                              fontWeight: "700",
                              textDecoration: "none",
                            }}
                          >
                            <i className="fa-solid fa-phone me-1"></i>
                            {activeSos.volunteerPhone}
                          </a>
                        </div>
                      )}
                    </div>

                    {activeSos.volunteerPhone && (
                      <a
                        href={`tel:${activeSos.volunteerPhone}`}
                        style={{
                          display: "block",
                          width: "100%",
                          textAlign: "center",
                          background: "#2563eb",
                          color: "#ffffff",
                          padding: "12px",
                          borderRadius: "10px",
                          marginTop: "16px",
                          fontWeight: "700",
                          textDecoration: "none",
                        }}
                      >
                        <i className="fa-solid fa-phone me-2"></i>
                        Call Responding Volunteer
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowVolunteerDetails(true)}
                      style={{
                        display: "block",
                        width: "100%",
                        marginTop: "12px",
                        padding: "11px 14px",
                        borderRadius: "10px",
                        border: "1px solid #bbf7d0",
                        background: "#f0fdf4",
                        color: "#166534",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      <i className="fa-solid fa-id-card me-2"></i>
                      View Volunteer Profile
                    </button>

                    {showVolunteerDetails && (
                      <div
                        role="presentation"
                        onClick={(event) => {
                          if (event.target === event.currentTarget) {
                            setShowVolunteerDetails(false);
                          }
                        }}
                        style={{
                          position: "fixed",
                          inset: 0,
                          zIndex: 2000,
                          background: "rgba(15, 23, 42, 0.65)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "18px",
                          overflowY: "auto",
                        }}
                      >
                        <div
                          role="dialog"
                          aria-modal="true"
                          aria-labelledby="volunteer-profile-title"
                          style={{
                            width: "100%",
                            maxWidth: "560px",
                            maxHeight: "90vh",
                            overflowY: "auto",
                            background: "#ffffff",
                            borderRadius: "20px",
                            boxShadow: "0 24px 70px rgba(0,0,0,0.25)",
                          }}
                        >
                          <div
                            style={{
                              padding: "22px 24px",
                              background:
                                "linear-gradient(135deg, #14532d, #16a34a)",
                              color: "#ffffff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "12px",
                              borderRadius: "20px 20px 0 0",
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  opacity: 0.85,
                                  fontWeight: "700",
                                  letterSpacing: "1px",
                                }}
                              >
                                SAFEHER VOLUNTEER
                              </div>
                              <h4
                                id="volunteer-profile-title"
                                style={{
                                  margin: "5px 0 0",
                                  fontSize: "22px",
                                  fontWeight: "800",
                                }}
                              >
                                Volunteer Profile
                              </h4>
                            </div>
                            <button
                              type="button"
                              aria-label="Close volunteer profile"
                              onClick={() => setShowVolunteerDetails(false)}
                              style={{
                                width: "36px",
                                height: "36px",
                                border: "1px solid rgba(255,255,255,0.45)",
                                borderRadius: "50%",
                                background: "rgba(255,255,255,0.15)",
                                color: "#ffffff",
                                fontSize: "22px",
                                cursor: "pointer",
                              }}
                            >
                              ×
                            </button>
                          </div>

                          <div style={{ padding: "24px" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "14px",
                                marginBottom: "22px",
                              }}
                            >
                              <div
                                style={{
                                  width: "58px",
                                  height: "58px",
                                  flexShrink: 0,
                                  borderRadius: "50%",
                                  background: "#dcfce7",
                                  color: "#166534",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "24px",
                                  fontWeight: "800",
                                }}
                              >
                                {(activeSos.volunteerName || "V")
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                              <div>
                                <h5
                                  style={{
                                    margin: "0 0 5px",
                                    color: "#0f172a",
                                    fontWeight: "800",
                                  }}
                                >
                                  {activeSos.volunteerName}
                                </h5>
                                <div
                                  style={{ fontSize: "13px", color: "#64748b" }}
                                >
                                  Volunteer performance overview
                                </div>
                              </div>
                            </div>

                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  "repeat(auto-fit, minmax(140px, 1fr))",
                                gap: "12px",
                              }}
                            >
                              {[
                                {
                                  label: "Resolved SOS",
                                  value:
                                    volunteerTrustScore?.performance
                                      ?.resolvedRequests ??
                                    volunteerTrustScore?.resolvedCount ??
                                    volunteerTrustScore?.successfulResolutions ??
                                    volunteerTrustScore?.totalResolved ??
                                    "—",
                                  icon: "fa-circle-check",
                                  color: "#15803d",
                                  background: "#f0fdf4",
                                },
                                {
                                  label: "Trust Score",
                                  value:
                                    volunteerTrustScore?.trustScore ??
                                    volunteerTrustScore?.score ??
                                    "—",
                                  suffix:
                                    volunteerTrustScore?.trustScore != null ||
                                    volunteerTrustScore?.score != null
                                      ? "/100"
                                      : "",
                                  icon: "fa-shield-heart",
                                  color: "#2563eb",
                                  background: "#eff6ff",
                                },
                                {
                                  label: "Avg. Response Time",
                                  value:
                                    volunteerTrustScore?.performance
                                      ?.averageResponseTime ??
                                    volunteerTrustScore?.averageResponseTime ??
                                    volunteerTrustScore?.avgResponseTime ??
                                    "—",
                                  suffix:
                                    volunteerTrustScore?.performance
                                      ?.averageResponseTime != null ||
                                    volunteerTrustScore?.averageResponseTime !=
                                      null ||
                                    volunteerTrustScore?.avgResponseTime != null
                                      ? " min"
                                      : "",
                                  icon: "fa-stopwatch",
                                  color: "#b45309",
                                  background: "#fffbeb",
                                },
                              ].map((stat) => (
                                <div
                                  key={stat.label}
                                  style={{
                                    padding: "16px 14px",
                                    borderRadius: "14px",
                                    background: stat.background,
                                    border: "1px solid #e2e8f0",
                                  }}
                                >
                                  <i
                                    className={`fa-solid ${stat.icon}`}
                                    style={{
                                      color: stat.color,
                                      fontSize: "18px",
                                    }}
                                  ></i>
                                  <div
                                    style={{
                                      marginTop: "12px",
                                      color: "#0f172a",
                                      fontSize: "23px",
                                      fontWeight: "800",
                                      lineHeight: 1.2,
                                    }}
                                  >
                                    {stat.value}
                                    {stat.suffix || ""}
                                  </div>
                                  <div
                                    style={{
                                      marginTop: "6px",
                                      color: "#64748b",
                                      fontSize: "12px",
                                      fontWeight: "600",
                                    }}
                                  >
                                    {stat.label}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div
                              style={{
                                marginTop: "18px",
                                padding: "16px",
                                borderRadius: "14px",
                                border: "1px solid #bbf7d0",
                                background: "#f0fdf4",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "11px",
                                  color: "#15803d",
                                  fontWeight: "800",
                                  letterSpacing: "0.8px",
                                }}
                              >
                                EARNED BADGE
                              </div>
                              {featuredBadge ? (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    marginTop: "10px",
                                  }}
                                >
                                  <span style={{ fontSize: "30px" }}>🏅</span>
                                  <div>
                                    <div
                                      style={{
                                        color: "#166534",
                                        fontSize: "16px",
                                        fontWeight: "800",
                                      }}
                                    >
                                      {featuredBadge.name}
                                    </div>
                                    <div
                                      style={{
                                        color: "#4b5563",
                                        fontSize: "13px",
                                        marginTop: "3px",
                                      }}
                                    >
                                      {featuredBadge.requirement}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  style={{
                                    color: "#4b5563",
                                    fontSize: "13px",
                                    marginTop: "8px",
                                  }}
                                >
                                  No earned badge yet. The volunteer can earn
                                  badges by helping resolve SOS requests.
                                </div>
                              )}
                            </div>

                            <p
                              style={{
                                margin: "16px 0 0",
                                color: "#64748b",
                                fontSize: "12px",
                                lineHeight: 1.5,
                              }}
                            >
                              These figures are loaded from SafeHer volunteer
                              statistics. A dash means that value was not
                              returned by the server.
                            </p>

                            <button
                              type="button"
                              onClick={() => setShowVolunteerDetails(false)}
                              style={{
                                width: "100%",
                                marginTop: "20px",
                                padding: "12px",
                                border: "none",
                                borderRadius: "10px",
                                background: "#14532d",
                                color: "#ffffff",
                                fontWeight: "700",
                                cursor: "pointer",
                              }}
                            >
                              Close Profile
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "20px 10px" }}>
                    <div
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "50%",
                        background: "#fef3c7",
                        color: "#d97706",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 12px",
                        fontSize: "24px",
                      }}
                    >
                      <i className="fa-solid fa-tower-broadcast"></i>
                    </div>
                    <h6
                      style={{
                        fontWeight: "700",
                        color: "#1e293b",
                        marginBottom: "6px",
                      }}
                    >
                      Searching for Volunteers
                    </h6>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#64748b",
                        margin: "0",
                      }}
                    >
                      Your alert has been broadcasted. Nearby volunteers will
                      see your live location and approve the request
                      immediately.
                    </p>
                  </div>
                )}
              </div>

              {/* Emergency Helplines Quick Access */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "16px",
                  padding: "24px",
                  boxShadow: "0 4px 20px rgba(15,23,42,0.06)",
                  border: "1px solid #e2e8f0",
                }}
              >
                <h5
                  style={{
                    fontWeight: "700",
                    color: "#0f172a",
                    marginBottom: "14px",
                  }}
                >
                  <i className="fa-solid fa-phone-volume text-danger me-2"></i>
                  Emergency Helplines
                </h5>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <a
                    href="tel:112"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      background: "#f8fafc",
                      borderRadius: "8px",
                      textDecoration: "none",
                      color: "#1e293b",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    <span>National Emergency</span>
                    <strong style={{ color: "#dc2626" }}>112</strong>
                  </a>

                  <a
                    href="tel:1091"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      background: "#f8fafc",
                      borderRadius: "8px",
                      textDecoration: "none",
                      color: "#1e293b",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    <span>Women Helpline</span>
                    <strong style={{ color: "#dc2626" }}>1091</strong>
                  </a>

                  <a
                    href="tel:100"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      background: "#f8fafc",
                      borderRadius: "8px",
                      textDecoration: "none",
                      color: "#1e293b",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    <span>Police Control</span>
                    <strong style={{ color: "#dc2626" }}>100</strong>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ================= NO ACTIVE SOS (STANDBY STATE) ================= */
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "60px 30px",
              textAlign: "center",
              boxShadow: "0 8px 30px rgba(15,23,42,0.06)",
              border: "1px solid #e2e8f0",
              maxWidth: "700px",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                background: "#fee2e2",
                color: "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "40px",
                margin: "0 auto 24px",
              }}
            >
              <i className="fa-solid fa-shield-heart"></i>
            </div>

            <h2
              style={{
                fontWeight: "800",
                color: "#0f172a",
                marginBottom: "12px",
              }}
            >
              SafeHer Emergency SOS Standby
            </h2>

            <p
              style={{
                color: "#64748b",
                fontSize: "16px",
                lineHeight: "1.6",
                marginBottom: "30px",
              }}
            >
              If you feel unsafe or are in danger, activate the SOS button
              below. SafeHer will automatically fetch your live GPS coordinates,
              alert verified volunteers in your area, and calculate live
              straight-line distance between the reported GPS coordinates.
            </p>

            <button
              onClick={handleTriggerSOS}
              style={{
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                color: "#ffffff",
                border: "none",
                padding: "18px 40px",
                borderRadius: "14px",
                fontWeight: "800",
                fontSize: "18px",
                cursor: "pointer",
                boxShadow: "0 10px 25px rgba(220,38,38,0.4)",
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <i className="fa-solid fa-triangle-exclamation"></i>
              TRIGGER EMERGENCY SOS NOW
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SOSTracking;
