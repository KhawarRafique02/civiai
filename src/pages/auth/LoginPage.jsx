import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import toast from "react-hot-toast";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists() && docSnap.data().role === "admin") {
        toast.success("Welcome Admin!");
        navigate("/admin");
      } else {
        toast.success("Login successful!");
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error("Login failed: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f0fdf4",
      padding: "1rem",
      boxSizing: "border-box"
    }}>
      <div style={{
        background: "white",
        padding: "2rem",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        width: "100%",
        maxWidth: "400px",
        boxSizing: "border-box"
      }}>
        <h1 style={{ color: "#16a34a", fontSize: "28px", marginBottom: "4px" }}>CiviAI</h1>
        <p style={{ color: "#6b7280", marginBottom: "24px", fontSize: "14px" }}>Login to your account</p>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "16px", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "16px", boxSizing: "border-box" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "14px", backgroundColor: "#16a34a", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: "pointer" }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "16px", color: "#6b7280", fontSize: "14px" }}>
          Don't have an account?{" "}
          <Link to="/signup" style={{ color: "#16a34a", fontWeight: "600" }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;