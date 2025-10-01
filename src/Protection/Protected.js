import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../component/UserContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg font-semibold text-purple-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
