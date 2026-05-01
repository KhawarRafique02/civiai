import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { collection, getDocs, doc, getDoc, updateDoc, orderBy, query } from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import toast from "react-hot-toast";

const statusColor = {
  "Submitted":    { bg: "#f3f4f6", text: "#374151" },
  "Under Review": { bg: "#fefce8", text: "#ca8a04" },
  "In Progress":  { bg: "#eff6ff", text: "#1d4ed8" },
  "Resolved":     { bg: "#f0fdf4", text: "#16a34a" },
};

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);
  const [filter, setFilter] = useState("All");

  const fetchComplaints = async () => {
    try {
      const q = query(collection(db, "complaints"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setComplaints(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      toast.error("Error loading complaints");
    }
    setLoading(false);
  };

  useEffect(() => {
    const checkAdmin = async () => {
      const user = auth.currentUser;
      if (!user) { navigate("/login"); return; }
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (!docSnap.exists() || docSnap.data().role !== "admin") {
        toast.error("Access denied!");
        navigate("/dashboard");
        return;
      }
      setChecking(false);
      fetchComplaints();
    };
    checkAdmin();
  }, [navigate]);

  const updateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, "complaints", id), { status: newStatus });
      toast.success("Status updated!");
      fetchComplaints();
    } catch (error) {
      toast.error("Failed to update!");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    toast.success("Logged out!");
    navigate("/login");
  };

  if (checking) return (
    <div style={{ textAlign: "center", marginTop: "4rem", color: "#6b7280" }}>Checking access...</div>
  );

  const filtered = filter === "All" ? complaints : complaints.filter(c => c.status === filter);
  const total      = complaints.length;
  const resolved   = complaints.filter(c => c.status === "Resolved").length;
  const inProgress = complaints.filter(c => c.status === "In Progress").length;
  const pending    = complaints.filter(c => c.status === "Submitted").length;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", padding: "1rem", boxSizing: "border-box" }}>

      {/* Navbar */}
      <div style={{ background: "white", padding: "0.75rem 1rem", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
        <div>
          <h1 style={{ color: "#16a34a", margin: 0, fontSize: "18px" }}>🏙️ CiviAI</h1>
          <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>Admin Panel</p>
        </div>
        <button
          onClick={handleLogout}
          style={{ backgroundColor: "#fee2e2", color: "#dc2626", border: "none", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}
        >
          Logout
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px", marginBottom: "1rem" }}>
        {[
          { label: "Total",       value: total,      bg: "#f5f3ff", text: "#7c3aed" },
          { label: "New",         value: pending,    bg: "#f3f4f6", text: "#374151" },
          { label: "In Progress", value: inProgress, bg: "#eff6ff", text: "#1d4ed8" },
          { label: "Resolved",    value: resolved,   bg: "#f0fdf4", text: "#16a34a" },
        ].map(stat => (
          <div key={stat.label} style={{ background: stat.bg, padding: "1rem", borderRadius: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "28px", fontWeight: "700", color: stat.text }}>{stat.value}</div>
            <div style={{ color: stat.text, marginTop: "2px", fontSize: "13px" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "1rem", flexWrap: "wrap" }}>
        {["All", "Submitted", "Under Review", "In Progress", "Resolved"].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", cursor: "pointer", fontWeight: "600", fontSize: "12px", backgroundColor: filter === status ? "#16a34a" : "white", color: filter === status ? "white" : "#374151" }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Complaints — CARD layout for mobile */}
      {loading ? (
        <p style={{ textAlign: "center", color: "#9ca3af" }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <p style={{ textAlign: "center", color: "#9ca3af" }}>No complaints found!</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.map(c => (
            <div key={c.id} style={{ background: "white", borderRadius: "12px", padding: "1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #e5e7eb" }}>

              {/* Top row - title + status */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                <h3 style={{ margin: 0, fontSize: "15px", color: "#111827", fontWeight: "600", flex: 1 }}>{c.title}</h3>
                <span style={{ backgroundColor: statusColor[c.status]?.bg, color: statusColor[c.status]?.text, padding: "3px 8px", borderRadius: "99px", fontSize: "11px", fontWeight: "600", whiteSpace: "nowrap", flexShrink: 0 }}>
                  {c.status}
                </span>
              </div>

              {/* Details */}
              <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "10px" }}>
                <p style={{ margin: "2px 0" }}>👤 {c.userName || "Unknown"}</p>
                <p style={{ margin: "2px 0" }}>🏷️ {c.category?.replace(/_/g, " ") || "N/A"}</p>
                <p style={{ margin: "2px 0" }}>📍 {c.location || "No location"}</p>
              </div>

              {/* Status Update */}
              <div>
                <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "4px" }}>Update Status:</label>
                <select
                  value={c.status}
                  onChange={e => updateStatus(c.id, e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", cursor: "pointer", backgroundColor: "white", boxSizing: "border-box" }}
                >
                  <option>Submitted</option>
                  <option>Under Review</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                </select>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;