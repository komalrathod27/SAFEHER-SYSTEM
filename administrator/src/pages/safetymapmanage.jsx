import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";

const safeIcon = new L.DivIcon({
  className: "custom-safety-marker",
  html: `<div style="
    background-color: #16a34a;
    width: 18px;
    height: 18px;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 1px 5px rgba(0,0,0,0.5);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const cautionIcon = new L.DivIcon({
  className: "custom-safety-marker",
  html: `<div style="
    background-color: #dc2626;
    width: 18px;
    height: 18px;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 1px 5px rgba(0,0,0,0.5);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
}

function MapResize() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    let frame;
    const resizeObserver = new ResizeObserver(() => {
      if (container.clientWidth === 0 || container.clientHeight === 0) return;

      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        map.invalidateSize({ pan: false, debounceMoveend: true });
      });
    });

    resizeObserver.observe(container);
    map.invalidateSize({ pan: false, debounceMoveend: true });

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [map]);

  return null;
}

function MapUpdater({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, 15);
    }
  }, [position, map]);

  return null;
}

function SafetyMapManagement() {
  const [safetyAreas, setSafetyAreas] = useState([]);
  const [mapPosition, setMapPosition] = useState(null);
  const [isAreaFormOpen, setIsAreaFormOpen] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [selectedOverviewPosition, setSelectedOverviewPosition] =
    useState(null);

  const safeAreaCount = safetyAreas.filter(
    (area) => area.type === "Safe",
  ).length;

  const cautionAreaCount = safetyAreas.filter(
    (area) => area.type === "Caution",
  ).length;

  useEffect(() => {
    displaySafetyAreas();
  }, []);

  const displaySafetyAreas = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/getsafetyareas");
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to load safety areas.");
      }
      const areas = Array.isArray(result) ? result : result.data;
      if (!Array.isArray(areas)) {
        throw new Error("Invalid safety areas data received.");
      }
      setSafetyAreas(areas);
    } catch (error) {
      console.error("Display Safety Areas Error:", error);
    }
  };

  function viewSafetyArea(id) {
    const area = safetyAreas.find((item) => item.areaId === id);

    if (!area) {
      Swal.fire({
        icon: "warning",
        title: "Area Not Found",
        text: "The selected safety area could not be found.",
      });
      return;
    }

    const latitude = Number(area.latitude);
    const longitude = Number(area.longitude);

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
        title: "Invalid Coordinates",
        text: "This safety area's location cannot be displayed on the map.",
      });
      return;
    }

    setSelectedOverviewPosition([latitude, longitude]);
    setTimeout(() => {
      document.getElementById("safetyMapOverview")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }

  function editSafetyArea(id) {
    const area = safetyAreas.find((item) => item.areaId === id);
    if (!area) {
      Swal.fire({
        icon: "warning",
        title: "Area Not Found",
        text: "The selected safety area could not be found.",
      });
      return;
    }
    document.getElementById("areaFormTitle").innerText = "Edit Safety Area";
    document.getElementById("areaId").value = area.areaId;
    document.getElementById("areaLocation").value = area.location;
    document.getElementById("areaType").value = area.type;
    document.getElementById("areaDescription").value = area.description;

    setMapPosition(
      area.latitude != null && area.longitude != null
        ? [Number(area.latitude), Number(area.longitude)]
        : null,
    );

    setIsAreaFormOpen(true);
  }

  function addSafetyArea() {
    setMapPosition(null);
    document.getElementById("areaFormTitle").innerText = "Add Area";
    document.getElementById("areaId").value = "";
    document.getElementById("areaLocation").value = "";
    document.getElementById("areaType").value = "Safe";
    document.getElementById("areaDescription").value = "";
    setIsAreaFormOpen(true);
  }

  async function searchAreaLocation() {
    const location = document.getElementById("areaLocation").value.trim();
    if (!location) {
      Swal.fire({
        icon: "warning",
        title: "Enter a Location",
        text: "Enter a location to search for it on the map.",
      });
      return;
    }

    setIsSearchingLocation(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(location)}`,
      );
      if (!response.ok) {
        throw new Error(`Location search failed with status ${response.status}.`);
      }

      const results = await response.json();
      const result = results[0];
      const latitude = Number(result?.lat);
      const longitude = Number(result?.lon);

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        await Swal.fire({
          icon: "info",
          title: "Location Not Found",
          text: "Try a more specific location, then select the exact point on the map.",
        });
        return;
      }

      setMapPosition([latitude, longitude]);
    } catch (error) {
      console.error("Search Area Location Error:", error);
      await Swal.fire({
        icon: "error",
        title: "Location Search Failed",
        text: "Unable to search for this location. Please try again.",
      });
    } finally {
      setIsSearchingLocation(false);
    }
  }

  function closeAreaForm() {
    setIsAreaFormOpen(false);
  }

  const saveSafetyArea = async () => {
    const location = document.getElementById("areaLocation").value.trim();
    const type = document.getElementById("areaType").value;
    const description = document.getElementById("areaDescription").value.trim();

    if (!location || !description) {
      Swal.fire({
        icon: "warning",
        title: "Required Fields",
        text: "Please enter both location and description.",
      });
      return;
    }

    if (!["Safe", "Caution"].includes(type)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Area Type",
        text: "Please select either Safe or Caution.",
      });
      return;
    }

    if (
      !mapPosition ||
      !Number.isFinite(mapPosition[0]) ||
      !Number.isFinite(mapPosition[1]) ||
      mapPosition[0] < -90 ||
      mapPosition[0] > 90 ||
      mapPosition[1] < -180 ||
      mapPosition[1] > 180
    ) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Location",
        text: "Please select a valid location on the map.",
      });
      return;
    }

    try {
      const areaId = document.getElementById("areaId").value;
      const url = areaId
        ? `http://localhost:3000/api/editsafetyarea/${encodeURIComponent(areaId)}`
        : "http://localhost:3000/api/addsafetyarea";

      const response = await fetch(url, {
        method: areaId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location,
          type,
          description,
          latitude: mapPosition[0],
          longitude: mapPosition[1],
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        await Swal.fire({
          icon: "error",
          title: "Operation Failed",
          text: result.message || "Unable to save the safety area.",
        });
        return;
      }

      await Swal.fire({
        icon: "success",
        title: areaId ? "Area Updated!" : "Area Added!",
        text:
          result.message ||
          (areaId
            ? "Safety area updated successfully."
            : "Safety area added successfully."),
        timer: 1800,
        showConfirmButton: false,
      });

      closeAreaForm();
      await displaySafetyAreas();
    } catch (error) {
      console.error("Save Safety Area Error:", error);
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Unable to connect to the server. Please try again.",
      });
    }
  };

  const deleteSafetyArea = async (areaId) => {
    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Delete Safety Area?",
      text: "This action cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
    });

    if (!confirmation.isConfirmed) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/deletesafetyarea/${encodeURIComponent(areaId)}`,
        { method: "DELETE" },
      );

      const result = await response.json();

      if (!response.ok) {
        await Swal.fire({
          icon: "error",
          title: "Delete Failed",
          text: result.message || "Unable to delete safety area.",
        });
        return;
      }

      await Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: result.message || "Safety area deleted successfully.",
        timer: 1800,
        showConfirmButton: false,
      });

      await displaySafetyAreas();
    } catch (error) {
      console.error("Delete Safety Area Error:", error);

      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Unable to connect to the server. Please try again.",
      });
    }
  };

  return (
    <div className="content-wrapper">
      {/* Page Header */}
      <div className="row">
        <div className="col-md-12 grid-margin">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="font-weight-bold mb-0">Safety Map Management</h4>

              <p className="text-muted mb-0">
                Manage safe and caution locations displayed on the Women’s
                Safety Map.
              </p>
            </div>

            <button className="btn btn-primary" onClick={addSafetyArea}>
              <i className="mdi mdi-plus mr-1"></i>
              Add Area
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row">
        <div className="col-md-6 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <p className="card-title text-muted">Safe Areas</p>
              <h3>{String(safeAreaCount).padStart(2, "0")}</h3>
              <p className="text-success mb-0">Locations classified as safe</p>
            </div>
          </div>
        </div>

        <div className="col-md-6 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <p className="card-title text-muted">Caution Areas</p>
              <h3>{String(cautionAreaCount).padStart(2, "0")}</h3>
              <p className="text-warning mb-0">Areas requiring caution</p>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Map Overview */}
      <div className="row" id="safetyMapOverview">
        <div className="col-md-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
                <div>
                  <h4 className="card-title mb-1">Safety Map Overview</h4>
                  <p className="text-muted mb-0">
                    View all saved safe and caution locations.
                  </p>
                </div>

                <div className="d-flex align-items-center mt-2">
                  <span className="mr-3">
                    <span
                      style={{
                        display: "inline-block",
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: "#16a34a",
                        marginRight: "6px",
                      }}
                    />
                    Safe
                  </span>

                  <span>
                    <span
                      style={{
                        display: "inline-block",
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: "#dc2626",
                        marginRight: "6px",
                      }}
                    />
                    Caution
                  </span>
                </div>
              </div>

              <div
                style={{
                  height: "400px",
                  width: "100%",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "1px solid #ddd",
                }}
              >
                <MapContainer
                  center={[22.3072, 73.1812]}
                  zoom={12}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapUpdater position={selectedOverviewPosition} />

                  {safetyAreas.map((area) => {
                      const latitude = Number(area.latitude);
                      const longitude = Number(area.longitude);

                      if (
                        !Number.isFinite(latitude) ||
                        !Number.isFinite(longitude) ||
                        latitude < -90 ||
                        latitude > 90 ||
                        longitude < -180 ||
                        longitude > 180
                      ) {
                        return null;
                      }

                      return (
                        <Marker
                          key={area._id || area.areaId}
                          position={[latitude, longitude]}
                          icon={area.type === "Safe" ? safeIcon : cautionIcon}
                        >
                          <Popup>
                            <strong>{area.location}</strong>
                            <br />
                            Type: {area.type}
                            <br />
                            {area.description}
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                marginTop: "12px",
                              }}
                            >
                              <button
                                type="button"
                                className="btn btn-sm btn-info"
                                onClick={() => viewSafetyArea(area.areaId)}
                              >
                                View
                              </button>

                              <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                onClick={() => editSafetyArea(area.areaId)}
                              >
                                Edit
                              </button>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}

                  <MapResize />
                </MapContainer>
              </div>

              <p className="text-muted mt-2 mb-0">
                Total locations: {safetyAreas.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Areas Table */}
      <div className="row">
        <div className="col-md-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="card-title mb-0">Safety Areas</h4>

                <span className="text-muted">
                  Manage locations shown on the Safety Map
                </span>
              </div>

              <div className="table-responsive">
                <table
                  className="table table-hover"
                  style={{
                    width: "100%",
                    minWidth: "760px",
                    tableLayout: "fixed",
                  }}
                >
                  <colgroup>
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "17%" }} />
                    <col style={{ width: "13%" }} />
                    <col style={{ width: "44%" }} />
                    <col style={{ width: "16%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Location</th>
                      <th>Type</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {safetyAreas.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center">
                          No safety areas have been added yet.
                        </td>
                      </tr>
                    ) : (
                      safetyAreas.map((area, index) => (
                        <tr key={area._id || area.areaId}>
                          <td
                            style={{
                              verticalAlign: "middle",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {area.areaId || `SA-${index + 1}`}
                          </td>
                          <td
                            style={{
                              verticalAlign: "middle",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {area.location}
                          </td>
                          <td style={{ verticalAlign: "middle" }}>
                            <span
                              className={
                                area.type === "Safe"
                                  ? "safe-badge"
                                  : "caution-badge"
                              }
                            >
                              {area.type}
                            </span>
                          </td>
                          <td
                            style={{
                              verticalAlign: "middle",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {area.description}
                          </td>
                          <td
                            style={{
                              verticalAlign: "middle",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "flex-start",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <button
                                type="button"
                                className="btn btn-sm btn-info"
                                style={{ width: "68px", padding: "7px 0" }}
                                onClick={() => viewSafetyArea(area.areaId)}
                              >
                                View
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                style={{ width: "68px", padding: "7px 0" }}
                                onClick={() => editSafetyArea(area.areaId)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                style={{ width: "68px", padding: "7px 0" }}
                                onClick={() => deleteSafetyArea(area.areaId)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <div
        id="areaFormModal"
        style={{
          display: isAreaFormOpen ? "flex" : "none",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1050,
        }}
      >
        <div
          className="card"
          style={{
            width: "600px",
            maxWidth: "90%",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 id="areaFormTitle" className="card-title mb-0">
                Add Area
              </h4>

              <button
                type="button"
                aria-label="Close area form"
                title="Close"
                onClick={closeAreaForm}
                style={{
                  width: "36px",
                  height: "36px",
                  padding: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: "0 0 36px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "50%",
                  background: "#f8fafc",
                  color: "#475569",
                  fontSize: "24px",
                  lineHeight: 1,
                  cursor: "pointer",
                }}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <input type="hidden" id="areaId" />

            <div className="form-group">
              <label>Type</label>
              <select id="areaType" className="form-control">
                <option value="Safe">Safe</option>
                <option value="Caution">Caution</option>
              </select>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                id="areaDescription"
                className="form-control"
                rows="3"
                placeholder="Enter area description"
              />
            </div>

            <div className="form-group">
              <label>Enter Location</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  id="areaLocation"
                  className="form-control"
                  placeholder="e.g. Green Park, Vadodara"
                  style={{ flex: 1, minWidth: 0 }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      searchAreaLocation();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={searchAreaLocation}
                  disabled={isSearchingLocation}
                >
                  {isSearchingLocation ? "Searching..." : "Search"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Select Exact Location</label>
              <div
                style={{
                  height: "220px",
                  width: "100%",
                  minWidth: 0,
                  boxSizing: "border-box",
                  display: "block",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "1px solid #ddd",
                }}
              >
                {isAreaFormOpen && (
                  <MapContainer
                    center={[22.3072, 73.1812]}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      attribution="&copy; OpenStreetMap contributors"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {safetyAreas.map((area) => (
                      <Marker
                        key={area._id || area.areaId}
                        position={[
                          Number(area.latitude),
                          Number(area.longitude),
                        ]}
                        icon={area.type === "Safe" ? safeIcon : cautionIcon}
                      >
                        <Popup>
                          <strong>{area.location}</strong>
                          <br />
                          Type: {area.type}
                          <br />
                          {area.description}
                        </Popup>
                      </Marker>
                    ))}
                    <MapResize />
                    <MapUpdater position={mapPosition} />
                    <LocationPicker
                      position={mapPosition}
                      setPosition={setMapPosition}
                    />
                  </MapContainer>
                )}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "20px",
                flexWrap: "wrap",
                marginBottom: "15px",
              }}
            >
              <div>
                <strong>Latitude:</strong>{" "}
                {mapPosition ? mapPosition[0].toFixed(6) : "Not selected"}
              </div>
              <div>
                <strong>Longitude:</strong>{" "}
                {mapPosition ? mapPosition[1].toFixed(6) : "Not selected"}
              </div>
            </div>

            <div className="text-right mt-4">
              <button
                type="button"
                className="btn btn-light mr-2"
                onClick={closeAreaForm}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={saveSafetyArea}
              >
                Save Area
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SafetyMapManagement;
