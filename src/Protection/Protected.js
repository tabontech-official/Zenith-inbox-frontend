import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserContext } from "../component/UserContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useContext(UserContext);
  const location = useLocation();

  if (loading) return null;

  // 🔐 Not logged in
  if (!user) return <Navigate to="/login" replace />;

  // 👑 Admin routes (SaaS Owner / Platform Admin)
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
