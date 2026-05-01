import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import toast from "react-hot-toast";

const statusColor = {
  "Submitted":    { bg: "#f3f4f6", text: "#374151" },
  "Under Review": { bg: "#fefce8", text: "#ca8a04" },
  "In Progress":  { bg: "#eff6ff", text: "#1d4ed8" },
  "Resolved":     { bg: "#f0fdf4", text: "#16a34a" },
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try {
      const q = query(
        collection(db, "complaints"),
        where("userId", "==", auth.currentUser.uid),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      setComplaints(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      toast.error("Error loading complaints");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    toast.success("Logged out!");
    navigate("/login");
  };

  const total    = complaints.length;
  const resolved = complaints.filter(c => c.status === "Resolved").length;
  const pending  = complaints.filter(c => c.status !== "Resolved").length;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0fdf4", padding: "1rem", boxSizing: "border-box" }}>

      {/* Navbar */}
      <div style={{ background: "white", padding: "0.75rem 1rem", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
        <h1 style={{ color: "#16a34a", margin: 0, fontSize: "20px" }}>🏙️ CiviAI</h1>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => navigate("/map")}
            style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}
          >
            🗺️ Map
          </button>
          <button
            onClick={handleLogout}
            style={{ backgroundColor: "#fee2e2", color: "#dc2626", border: "none", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Welcome */}
      <div style={{ background: "white", padding: "1rem", borderRadius: "16px", marginBottom: "1rem", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
        <h2 style={{ margin: 0, color: "#111827", fontSize: "18px" }}>Welcome, {auth.currentUser?.displayName}! 👋</h2>
        <p style={{ color: "#6b7280", marginTop: "4px", marginBottom: 0, fontSize: "14px" }}>Track your reported civic issues</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "1rem" }}>
        {[
          { label: "Total",    value: total,    bg: "#eff6ff", text: "#1d4ed8" },
          { label: "Resolved", value: resolved, bg: "#f0fdf4", text: "#16a34a" },
          { label: "Pending",  value: pending,  bg: "#fefce8", text: "#ca8a04" },
        ].map(stat => (
          <div key={stat.label} style={{ background: stat.bg, padding: "1rem 0.5rem", borderRadius: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "28px", fontWeight: "700", color: stat.text }}>{stat.value}</div>
            <div style={{ color: stat.text, marginTop: "2px", fontSize: "12px" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "1rem", flexWrap: "wrap" }}>
        <button
          onClick={() => navigate("/submit-complaint")}
          style={{ flex: 1, backgroundColor: "#16a34a", color: "white", border: "none", padding: "14px", borderRadius: "12px", fontSize: "15px", fontWeight: "600", cursor: "pointer", minWidth: "150px" }}
        >
          + Report New Issue
        </button>
        <button
          onClick={() => navigate("/map")}
          style={{ flex: 1, backgroundColor: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", padding: "14px", borderRadius: "12px", fontSize: "15px", fontWeight: "600", cursor: "pointer", minWidth: "150px" }}
        >
          🗺️ View Map
        </button>
      </div>

      {/* Complaints List */}
      <div style={{ background: "white", padding: "1rem", borderRadius: "16px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
        <h3 style={{ margin: "0 0 1rem", color: "#111827", fontSize: "16px" }}>My Complaints</h3>

        {loading ? (
          <p style={{ textAlign: "center", color: "#9ca3af" }}>Loading...</p>
        ) : complaints.length === 0 ? (
          <p style={{ textAlign: "center", color: "#9ca3af", padding: "1rem" }}>No complaints yet!</p>
        ) : (
          complaints.map(c => (
            <div key={c.id} style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "0.75rem", marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ margin: "0 0 4px", color: "#111827", fontSize: "14px", fontWeight: "600" }}>{c.title}</h4>
                  <p style={{ margin: "0 0 4px", color: "#6b7280", fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.description}</p>
                  <p style={{ margin: 0, color: "#9ca3af", fontSize: "12px" }}>📍 {c.location || "No location"}</p>
                </div>
                <span style={{ backgroundColor: statusColor[c.status]?.bg || "#f3f4f6", color: statusColor[c.status]?.text || "#374151", padding: "4px 8px", borderRadius: "99px", fontSize: "11px", fontWeight: "600", whiteSpace: "nowrap", flexShrink: 0 }}>
                  {c.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DashboardPage;