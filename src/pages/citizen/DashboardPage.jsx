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

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const q = query(
        collection(db, "complaints"),
        where("userId", "==", auth.currentUser.uid),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComplaints(data);
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
    <div style={{ minHeight: "100vh", backgroundColor: "#f0fdf4", padding: "2rem" }}>

      {/* Navbar */}
      <div style={{ background: "white", padding: "1rem 2rem", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
        <h1 style={{ color: "#16a34a", margin: 0 }}>🏙️ CiviAI</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => navigate("/map")} style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
            🗺️ Map
          </button>
          <button onClick={handleLogout} style={{ backgroundColor: "#fee2e2", color: "#dc2626", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
            Logout
          </button>
        </div>
      </div>

      {/* Welcome */}
      <div style={{ background: "white", padding: "2rem", borderRadius: "16px", marginBottom: "2rem", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
        <h2 style={{ margin: 0, color: "#111827" }}>Welcome, {auth.currentUser?.displayName}! 👋</h2>
        <p style={{ color: "#6b7280", marginTop: "8px" }}>Track your reported civic issues</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Total",    value: total,    bg: "#eff6ff", text: "#1d4ed8" },
          { label: "Resolved", value: resolved, bg: "#f0fdf4", text: "#16a34a" },
          { label: "Pending",  value: pending,  bg: "#fefce8", text: "#ca8a04" },
        ].map(stat => (
          <div key={stat.label} style={{ background: stat.bg, padding: "1.5rem", borderRadius: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "32px", fontWeight: "700", color: stat.text }}>{stat.value}</div>
            <div style={{ color: stat.text, marginTop: "4px", fontSize: "14px" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "2rem" }}>
        <button
          onClick={() => navigate("/submit-complaint")}
          style={{ backgroundColor: "#16a34a", color: "white", border: "none", padding: "14px 28px", borderRadius: "12px", fontSize: "16px", fontWeight: "600", cursor: "pointer" }}
        >
          + Report New Issue
        </button>
        <button
          onClick={() => navigate("/map")}
          style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", padding: "14px 28px", borderRadius: "12px", fontSize: "16px", fontWeight: "600", cursor: "pointer" }}
        >
          🗺️ View Map
        </button>
      </div>

      {/* Complaints List */}
      <div style={{ background: "white", padding: "1.5rem", borderRadius: "16px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
        <h3 style={{ margin: "0 0 1rem", color: "#111827" }}>My Complaints</h3>

        {loading ? (
          <p style={{ textAlign: "center", color: "#9ca3af" }}>Loading...</p>
        ) : complaints.length === 0 ? (
          <p style={{ textAlign: "center", color: "#9ca3af", padding: "2rem" }}>No complaints yet!</p>
        ) : (
          complaints.map(c => (
            <div key={c.id} style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1rem", marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div>
                  <h4 style={{ margin: "0 0 4px", color: "#111827" }}>{c.title}</h4>
                  <p style={{ margin: "0 0 4px", color: "#6b7280", fontSize: "14px" }}>{c.description}</p>
                  <p style={{ margin: 0, color: "#9ca3af", fontSize: "12px" }}>📍 {c.location || "No location"}</p>
                </div>
                <span style={{ backgroundColor: statusColor[c.status]?.bg || "#f3f4f6", color: statusColor[c.status]?.text || "#374151", padding: "4px 12px", borderRadius: "99px", fontSize: "12px", fontWeight: "600", whiteSpace: "nowrap" }}>
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