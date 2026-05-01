import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import toast from "react-hot-toast";

const categories = [
  { id: "road_damage",     label: "🛣️ Road Damage / Pothole" },
  { id: "garbage",         label: "🗑️ Garbage Overflow" },
  { id: "streetlight",     label: "💡 Broken Streetlight" },
  { id: "water_leakage",   label: "💧 Water Leakage" },
  { id: "sewer_blockage",  label: "🚧 Sewer Blockage" },
  { id: "illegal_dumping", label: "⚠️ Illegal Dumping" },
  { id: "other",           label: "📋 Other Issue" },
];

const SubmitComplaintPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const detectWithAI = async () => {
    if (!imageFile) { toast.error("Please upload an image first!"); return; }
    setAiLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      const response = await fetch("https://civiai-ai-production.up.railway.app/detect", {
        method: "POST", body: formData,
      });
      const data = await response.json();
      setCategory(data.category);
      toast.success("AI Detected: " + data.label);
    } catch (error) {
      toast.error("Could not connect to AI server!");
    }
    setAiLoading(false);
  };

  const getLocation = () => {
    if (!navigator.geolocation) { toast.error("Geolocation not supported"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(`${pos.coords.latitude}, ${pos.coords.longitude}`);
        toast.success("Location captured!");
      },
      () => toast.error("Could not get location")
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category) { toast.error("Please select a category!"); return; }
    setLoading(true);
    try {
      await addDoc(collection(db, "complaints"), {
        title, description, category, location,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName,
        userEmail: auth.currentUser.email,
        status: "Submitted",
        createdAt: serverTimestamp(),
      });
      toast.success("Complaint submitted!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed: " + error.message);
    }
    setLoading(false);
  };

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

      {/* Form */}
      <div style={{ background: "white", padding: "1.25rem", borderRadius: "16px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", maxWidth: "600px", margin: "0 auto", boxSizing: "border-box" }}>
        <h2 style={{ margin: "0 0 1.25rem", color: "#111827", fontSize: "18px" }}>Report an Issue</h2>

        <form onSubmit={handleSubmit}>

          {/* Image Upload */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px" }}>Upload Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ width: "100%", fontSize: "14px", boxSizing: "border-box" }}
            />
            {imagePreview && (
              <img src={imagePreview} alt="preview" style={{ marginTop: "10px", width: "100%", height: "180px", objectFit: "cover", borderRadius: "10px" }} />
            )}
          </div>

          {/* AI Button */}
          <button
            type="button"
            onClick={detectWithAI}
            disabled={aiLoading || !imageFile}
            style={{ width: "100%", padding: "12px", marginBottom: "14px", backgroundColor: "#f0fdf4", color: "#16a34a", border: "2px solid #16a34a", borderRadius: "8px", fontSize: "15px", fontWeight: "600", cursor: "pointer", boxSizing: "border-box" }}
          >
            {aiLoading ? "🤖 AI Detecting..." : "🤖 Auto-Detect with AI"}
          </button>

          {/* Title */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px" }}>Issue Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Big pothole on main road"
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "16px", boxSizing: "border-box" }}
            />
          </div>

          {/* Category */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px" }}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "16px", boxSizing: "border-box", backgroundColor: "white" }}
            >
              <option value="">-- Select Category --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px" }}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe the issue..."
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "16px", boxSizing: "border-box", resize: "vertical" }}
            />
          </div>

          {/* Location */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px" }}>Location</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Tap button to capture location"
                style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", minWidth: 0 }}
              />
              <button
                type="button"
                onClick={getLocation}
                style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", padding: "12px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px", whiteSpace: "nowrap", flexShrink: 0 }}
              >
                📍 Get
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "14px", backgroundColor: "#16a34a", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: "pointer", boxSizing: "border-box" }}
          >
            {loading ? "Submitting..." : "Submit Complaint"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitComplaintPage;