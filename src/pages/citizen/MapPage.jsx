import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import toast from "react-hot-toast";

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
    const fetchComplaints = async () => {
      try {
        const snapshot = await getDocs(collection(db, "complaints"));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setComplaints(data.filter(c => c.location && c.location.includes(",")));
      } catch (error) {
        toast.error("Error loading map data");
      }
      setLoading(false);
    };
    fetchComplaints();
  }, []);

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

  const defaultCenter = [31.5204, 74.3587];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0fdf4", padding: "1rem", boxSizing: "border-box" }}>

      {/* Navbar */}
      <div style={{ background: "white", padding: "0.75rem 1rem", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
        <h1 style={{ color: "#16a34a", margin: 0, fontSize: "20px" }}>🏙️ CiviAI</h1>
        <button
          onClick={() => navigate("/dashboard")}
          style={{ backgroundColor: "#f3f4f6", color: "#374151", border: "none", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}
        >
          ← Back
        </button>
      </div>

      {/* Header */}
      <div style={{ marginBottom: "1rem" }}>
        <h2 style={{ color: "#111827", margin: "0 0 4px", fontSize: "18px" }}>🗺️ Complaints Map</h2>
        <p style={{ color: "#6b7280", margin: 0, fontSize: "14px" }}>
          {complaints.length} complaints with location data
        </p>
      </div>

      {/* Map */}
      {loading ? (
        <p style={{ textAlign: "center", color: "#9ca3af" }}>Loading map...</p>
      ) : (
        <div style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", height: "60vh", minHeight: "300px" }}>
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
                      <div style={{ minWidth: "140px", fontSize: "13px" }}>
                        <strong>{complaint.title}</strong>
                        <br />
                        <span style={{ textTransform: "capitalize" }}>
                          {complaint.category?.replace(/_/g, " ")}
                        </span>
                        <br />
                        <span style={{ fontWeight: "600", color: statusColor[complaint.status] || "#6b7280" }}>
                          ● {complaint.status}
                        </span>
                        <br />
                        <span style={{ color: "#9ca3af" }}>By: {complaint.userName}</span>
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
      <div style={{ background: "white", padding: "0.75rem 1rem", borderRadius: "12px", marginTop: "1rem", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
        <p style={{ margin: "0 0 8px", fontWeight: "600", fontSize: "13px", color: "#374151" }}>Legend:</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          {Object.entries(statusColor).map(([status, color]) => (
            <span key={status} style={{ fontSize: "13px", color }}>● {status}</span>
          ))}
        </div>
      </div>

    </div>
  );
};

export default MapPage;