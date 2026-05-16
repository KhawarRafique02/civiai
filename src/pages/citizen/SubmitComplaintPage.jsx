import React, { useState, useRef } from "react";
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
  const [aiStep, setAiStep] = useState("");
  const galleryRef = useRef(null);
  const cameraRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setCategory("");
    setAiStep("");
  };

  const detectWithAI = async () => {
    if (!imageFile) { toast.error("Please upload an image first!"); return; }
    setAiLoading(true);

    // Step animations
    setAiStep("📤 Uploading image...");
    await new Promise(r => setTimeout(r, 800));
    setAiStep("🔍 Scanning image...");
    await new Promise(r => setTimeout(r, 900));
    setAiStep("🤖 AI analyzing...");

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      const response = await fetch("https://civiai-ai-production.up.railway.app/detect", {
        method: "POST", body: formData,
      });
      const data = await response.json();
      setAiStep("✅ Detection complete!");
      await new Promise(r => setTimeout(r, 600));
      setCategory(data.category);
      toast.success("AI Detected: " + data.label);
    } catch (error) {
      setAiStep("❌ Connection failed!");
      toast.error("Could not connect to AI server!");
    }
    setAiLoading(false);
    setTimeout(() => setAiStep(""), 2000);
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

      {/* Spinner style */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .ai-spinner { width:40px; height:40px; border:4px solid #bbf7d0; border-top:4px solid #16a34a; border-radius:50%; animation:spin 0.8s linear infinite; margin:0 auto 10px; }
        .ai-pulse { animation:pulse 1.2s ease-in-out infinite; }
      `}</style>

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

          {/* Image Upload — Camera + Gallery */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", fontSize: "14px" }}>Upload Photo</label>

            {/* Hidden inputs */}
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
            <input
              ref={galleryRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />

            {/* Buttons */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
              <button
                type="button"
                onClick={() => cameraRef.current.click()}
                style={{ flex: 1, padding: "12px", backgroundColor: "#f0fdf4", color: "#16a34a", border: "2px solid #86efac", borderRadius: "10px", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}
              >
                📷 Take Photo
              </button>
              <button
                type="button"
                onClick={() => galleryRef.current.click()}
                style={{ flex: 1, padding: "12px", backgroundColor: "#eff6ff", color: "#1d4ed8", border: "2px solid #93c5fd", borderRadius: "10px", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}
              >
                🖼️ Gallery
              </button>
            </div>

            {/* Preview */}
            {imagePreview && (
              <div style={{ position: "relative" }}>
                <img
                  src={imagePreview}
                  alt="preview"
                  style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "10px", border: "2px solid #bbf7d0" }}
                />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null); setCategory(""); setAiStep(""); }}
                  style={{ position: "absolute", top: "8px", right: "8px", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer", fontSize: "14px", fontWeight: "700" }}
                >
                  ✕
                </button>
              </div>
            )}

            {!imagePreview && (
              <div style={{ border: "2px dashed #d1d5db", borderRadius: "10px", padding: "2rem", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
                📸 No photo selected yet
              </div>
            )}
          </div>

          {/* AI Button + Animation */}
          <div style={{ marginBottom: "14px" }}>
            <button
              type="button"
              onClick={detectWithAI}
              disabled={aiLoading || !imageFile}
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: aiLoading ? "#f0fdf4" : (!imageFile ? "#f9fafb" : "#f0fdf4"),
                color: !imageFile ? "#9ca3af" : "#16a34a",
                border: `2px solid ${!imageFile ? "#e5e7eb" : "#16a34a"}`,
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: !imageFile ? "not-allowed" : "pointer",
                boxSizing: "border-box",
                transition: "all 0.3s",
              }}
            >
              {aiLoading ? "⏳ Detecting..." : "🤖 Auto-Detect with AI"}
            </button>

            {/* AI Scanning Animation */}
            {aiLoading && (
              <div style={{ marginTop: "12px", backgroundColor: "#f0fdf4", border: "2px solid #86efac", borderRadius: "12px", padding: "1rem", textAlign: "center" }}>
                <div className="ai-spinner" />
                <p className="ai-pulse" style={{ margin: 0, color: "#16a34a", fontWeight: "600", fontSize: "14px" }}>
                  {aiStep}
                </p>
                {/* Scan bar animation */}
                <div style={{ marginTop: "10px", backgroundColor: "#dcfce7", borderRadius: "99px", height: "6px", overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    backgroundColor: "#16a34a",
                    borderRadius: "99px",
                    animation: "pulse 1s ease-in-out infinite",
                    width: aiStep.includes("complete") ? "100%" : aiStep.includes("analyzing") ? "70%" : aiStep.includes("Scanning") ? "40%" : "15%",
                    transition: "width 0.8s ease"
                  }} />
                </div>
              </div>
            )}

            {/* Result after detection */}
            {!aiLoading && aiStep === "" && category && (
              <div style={{ marginTop: "8px", backgroundColor: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", color: "#16a34a", fontWeight: "600" }}>
                ✅ AI Detected: {categories.find(c => c.id === category)?.label}
              </div>
            )}
          </div>

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