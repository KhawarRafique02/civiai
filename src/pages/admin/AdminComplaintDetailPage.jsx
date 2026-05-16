import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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

const statusColor = {
  "Submitted":    { bg: "#f3f4f6", text: "#374151" },
  "Under Review": { bg: "#fefce8", text: "#ca8a04" },
  "In Progress":  { bg: "#eff6ff", text: "#1d4ed8" },
  "Resolved":     { bg: "#f0fdf4", text: "#16a34a" },
};

const AdminComplaintDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const docSnap = await getDoc(doc(db, "complaints", id));
        if (docSnap.exists()) {
          setComplaint({ id: docSnap.id, ...docSnap.data() });
        } else {
          toast.error("Complaint not found!");
          navigate("/admin");
        }
      } catch (error) {
        toast.error("Error loading complaint");
      }
      setLoading(false);
    };
    fetchComplaint();
  }, [id, navigate]);

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await updateDoc(doc(db, "complaints", id), { status: newStatus });
      setComplaint(prev => ({ ...prev, status: newStatus }));
      toast.success("Status updated!");
    } catch (error) {
      toast.error("Failed to update!");
    }
    setUpdating(false);
  };

  const parseLocation = (locationStr) => {
    const parts = locationStr.split(",");
    return [parseFloat(parts[0]), parseFloat(parts[1])];
  };

  const hasLocation = complaint?.location && complaint.location.includes(",");

  if (loading) return (
    <div style={{ textAlign: "center", marginTop: "4rem", color: "#6b7280" }}>Loading...</div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", padding: "1rem", boxSizing: "border-box" }}>

      {/* Navbar */}
      <div style={{ background: "white", padding: "0.75rem 1rem", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
        <div>
          <h1 style={{ color: "#16a34a", margin: 0, fontSize: "18px" }}>🏙️ CiviAI</h1>
          <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>Complaint Detail</p>
        </div>
        <button
          onClick={() => navigate("/admin")}
          style={{ backgroundColor: "#f3f4f6", color: "#374151", border: "none", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}
        >
          ← Back
        </button>
      </div>

      {/* Complaint Info Card */}
      <div style={{ background: "white", borderRadius: "16px", padding: "1.25rem", marginBottom: "1rem", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>

        {/* Title + Status */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "1rem" }}>
          <h2 style={{ margin: 0, fontSize: "18px", color: "#111827", flex: 1 }}>{complaint.title}</h2>
          <span style={{ backgroundColor: statusColor[complaint.status]?.bg, color: statusColor[complaint.status]?.text, padding: "4px 10px", borderRadius: "99px", fontSize: "12px", fontWeight: "600", whiteSpace: "nowrap", flexShrink: 0 }}>
            {complaint.status}
          </span>
        </div>

        {/* Details Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "1rem" }}>
          {[
            { label: "Citizen",   value: complaint.userName || "Unknown", icon: "👤" },
            { label: "Email",     value: complaint.userEmail || "N/A",    icon: "📧" },
            { label: "Category",  value: complaint.category?.replace(/_/g, " ") || "N/A", icon: "🏷️" },
            { label: "Location",  value: complaint.location || "No location", icon: "📍" },
          ].map(item => (
            <div key={item.label} style={{ backgroundColor: "#f9fafb", borderRadius: "10px", padding: "10px" }}>
              <p style={{ margin: "0 0 2px", fontSize: "11px", color: "#9ca3af", fontWeight: "600", textTransform: "uppercase" }}>{item.icon} {item.label}</p>
              <p style={{ margin: 0, fontSize: "13px", color: "#111827", fontWeight: "500", wordBreak: "break-all" }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Description */}
        {complaint.description && (
          <div style={{ backgroundColor: "#f9fafb", borderRadius: "10px", padding: "10px", marginBottom: "1rem" }}>
            <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#9ca3af", fontWeight: "600", textTransform: "uppercase" }}>📝 Description</p>
            <p style={{ margin: 0, fontSize: "13px", color: "#374151", lineHeight: "1.6" }}>{complaint.description}</p>
          </div>
        )}

        {/* Image */}
        {complaint.imageUrl && (
          <div style={{ marginBottom: "1rem" }}>
            <p style={{ margin: "0 0 6px", fontSize: "11px", color: "#9ca3af", fontWeight: "600", textTransform: "uppercase" }}>📸 Photo</p>
            <img
              src={complaint.imageUrl}
              alt="Complaint"
              style={{ width: "100%", maxHeight: "250px", objectFit: "cover", borderRadius: "10px" }}
            />
          </div>
        )}

        {/* Status Update */}
        <div>
          <p style={{ margin: "0 0 6px", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>Update Status:</p>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {["Submitted", "Under Review", "In Progress", "Resolved"].map(status => (
              <button
                key={status}
                onClick={() => updateStatus(status)}
                disabled={updating || complaint.status === status}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  cursor: complaint.status === status ? "default" : "pointer",
                  fontWeight: "600",
                  fontSize: "12px",
                  backgroundColor: complaint.status === status ? "#16a34a" : "white",
                  color: complaint.status === status ? "white" : "#374151",
                  opacity: updating ? 0.6 : 1,
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map Section */}
      {hasLocation ? (
        <div style={{ background: "white", borderRadius: "16px", padding: "1rem", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
          <h3 style={{ margin: "0 0 0.75rem", fontSize: "15px", color: "#111827" }}>🗺️ Complaint Location</h3>
          <div style={{ borderRadius: "12px", overflow: "hidden", height: "300px" }}>
            <MapContainer
              center={parseLocation(complaint.location)}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              <Marker position={parseLocation(complaint.location)}>
                <Popup>
                  <div style={{ fontSize: "13px" }}>
                    <strong>{complaint.title}</strong><br />
                    <span style={{ textTransform: "capitalize" }}>{complaint.category?.replace(/_/g, " ")}</span><br />
                    <span style={{ color: statusColor[complaint.status]?.text, fontWeight: "600" }}>● {complaint.status}</span>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      ) : (
        <div style={{ background: "white", borderRadius: "16px", padding: "1.5rem", textAlign: "center", color: "#9ca3af", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
          📍 No location data available for this complaint
        </div>
      )}

    </div>
  );
};

export default AdminComplaintDetailPage;