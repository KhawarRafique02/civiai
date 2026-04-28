import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import toast from "react-hot-toast";

// Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const MapPage = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const snapshot = await getDocs(collection(db, "complaints"));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const withLocation = data.filter(c => c.location && c.location.includes(","));
      setComplaints(withLocation);
    } catch (error) {
      toast.error("Error loading map data");
    }
    setLoading(false);
  };

  const parseLocation = (locationStr) => {
    const parts = locationStr.split(",");
    return [parseFloat(parts[0]), parseFloat(parts[1])];
  };

  const statusColor = {
    "Submitted":    "#6b7280",
    "Under Review": "#ca8a04",
    "In Progress":  "#1d4ed8",
    "Resolved":     "#16a34a",
  };

  // Lahore default center
  const defaultCenter = [31.5204, 74.3587];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0fdf4", padding: "2rem" }}>

      {/* Navbar */}
      <div style={{ background: "white", padding: "1rem 2rem", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
        <h1 style={{ color: "#16a34a", margin: 0 }}>🏙️ CiviAI</h1>
        <button
          onClick={() => navigate("/dashboard")}
          style={{ backgroundColor: "#f3f4f6", color: "#374151", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
        >
          ← Back
        </button>
      </div>

      <h2 style={{ color: "#111827", marginBottom: "8px" }}>🗺️ Complaints Map</h2>
      <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
        Showing {complaints.length} complaints with location data
      </p>

      {/* Map */}
      {loading ? (
        <p style={{ textAlign: "center", color: "#9ca3af" }}>Loading map...</p>
      ) : (
        <div style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", height: "500px" }}>
          <MapContainer
            center={defaultCenter}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            {complaints.map(complaint => {
              try {
                const position = parseLocation(complaint.location);
                return (
                  <Marker key={complaint.id} position={position}>
                    <Popup>
                      <div style={{ minWidth: "160px" }}>
                        <strong>{complaint.title}</strong>
                        <br />
                        <span style={{ fontSize: "12px", textTransform: "capitalize" }}>
                          {complaint.category?.replace("_", " ")}
                        </span>
                        <br />
                        <span style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: statusColor[complaint.status] || "#6b7280"
                        }}>
                          ● {complaint.status}
                        </span>
                        <br />
                        <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                          By: {complaint.userName}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                );
              } catch {
                return null;
              }
            })}
          </MapContainer>
        </div>
      )}

      {/* Legend */}
      <div style={{ background: "white", padding: "1rem 1.5rem", borderRadius: "12px", marginTop: "1.5rem", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        <strong style={{ color: "#374151" }}>Legend:</strong>
        {Object.entries(statusColor).map(([status, color]) => (
          <span key={status} style={{ fontSize: "14px", color }}>
            ● {status}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MapPage;