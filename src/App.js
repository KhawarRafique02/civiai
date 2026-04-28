import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import DashboardPage from "./pages/citizen/DashboardPage";
import SubmitComplaintPage from "./pages/citizen/SubmitComplaintPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import MapPage from "./pages/citizen/MapPage";

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login"            element={<LoginPage />} />
        <Route path="/signup"           element={<SignupPage />} />
        <Route path="/dashboard"        element={<DashboardPage />} />
        <Route path="/submit-complaint" element={<SubmitComplaintPage />} />
        <Route path="/admin"            element={<AdminDashboardPage />} />
        <Route path="/map"              element={<MapPage />} />
        <Route path="/"                 element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;