// import React from "react";
// import { Navigate } from "react-router-dom";

// const ProtectedRoute = ({ children }) => {
//   const userId = localStorage.getItem("userid");

//   if (!userId) {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;
import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserContext } from "../component/UserContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useContext(UserContext);
  const location = useLocation();

  if (loading) return null;

  // Not logged in → go to login
  if (!user) return <Navigate to="/login" replace />;

  // If adminOnly route → user.role must be admin
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/organization" replace />;
  }

  return children;
};

export default ProtectedRoute;
