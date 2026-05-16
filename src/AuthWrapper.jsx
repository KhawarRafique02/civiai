import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./services/firebase";

const AuthWrapper = ({ children }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f0fdf4",
        flexDirection: "column",
        gap: "16px"
      }}>
        <div style={{
          width: "48px",
          height: "48px",
          border: "4px solid #bbf7d0",
          borderTop: "4px solid #16a34a",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite"
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: "#16a34a", fontWeight: "600", fontSize: "16px", margin: 0 }}>
          🏙️ CiviAI
        </p>
      </div>
    );
  }

  return children;
};

export default AuthWrapper;