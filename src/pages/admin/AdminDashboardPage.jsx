import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { collection, getDocs, doc, updateDoc, orderBy, query } from "firebase/firestore";
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
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const q = query(collection(db, "complaints"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComplaints(data);
    } catch (error) {
      toast.error("Error loading complaints");
    }
    setLoading(false);
  };

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

  const filtered = filter === "All" ? complaints : complaints.filter(c => c.status === filter);

  const total      = complaints.length;
  const resolved   = complaints.filter(c => c.status === "Resolved").length;
  const inProgress = complaints.filter(c => c.status === "In Progress").length;
  const pending    = complaints.filter(c => c.status === "Submitted").length;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", padding: "2rem" }}>

      {/* Navbar */}
      <div style={{ background: "white", padding: "1rem 2rem", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
        <h1 style={{ color: "#16a34a", margin: 0 }}>🏙️ CiviAI — Admin Panel</h1>
        <button onClick={handleLogout} style={{ backgroundColor: "#fee2e2", color: "#dc2626", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
          Logout
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Total",       value: total,      bg: "#f5f3ff", text: "#7c3aed" },
          { label: "New",         value: pending,    bg: "#f3f4f6", text: "#374151" },
          { label: "In Progress", value: inProgress, bg: "#eff6ff", text: "#1d4ed8" },
          { label: "Resolved",    value: resolved,   bg: "#f0fdf4", text: "#16a34a" },
        ].map(stat => (
          <div key={stat.label} style={{ background: stat.bg, padding: "1.5rem", borderRadius: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "32px", fontWeight: "700", color: stat.text }}>{stat.value}</div>
            <div style={{ color: stat.text, marginTop: "4px", fontSize: "14px" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "1.5rem" }}>
        {["All", "Submitted", "Under Review", "In Progress", "Resolved"].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #e5e7eb", cursor: "pointer", fontWeight: "600", fontSize: "13px", backgroundColor: filter === status ? "#16a34a" : "white", color: filter === status ? "white" : "#374151" }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Complaints Table */}
      <div style={{ background: "white", borderRadius: "16px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", overflow: "hidden" }}>
        {loading ? (
          <p style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>No complaints found!</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Citizen", "Title", "Category", "Location", "Status", "Update"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: "600", color: "#374151" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "12px 16px", fontWeight: "500" }}>{c.userName || "Unknown"}</td>
                  <td style={{ padding: "12px 16px" }}>{c.title}</td>
                  <td style={{ padding: "12px 16px", textTransform: "capitalize" }}>{c.category?.replace("_", " ")}</td>
                  <td style={{ padding: "12px 16px", color: "#6b7280", fontSize: "12px" }}>{c.location || "N/A"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ backgroundColor: statusColor[c.status]?.bg, color: statusColor[c.status]?.text, padding: "4px 10px", borderRadius: "99px", fontSize: "12px", fontWeight: "600" }}>
                      {c.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <select
                      value={c.status}
                      onChange={e => updateStatus(c.id, e.target.value)}
                      style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px", cursor: "pointer" }}
                    >
                      <option>Submitted</option>
                      <option>Under Review</option>
                      <option>In Progress</option>
                      <option>Resolved</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;