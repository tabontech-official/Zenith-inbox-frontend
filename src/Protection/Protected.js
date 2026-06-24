
import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserContext } from "../component/UserContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useContext(UserContext);
  const location = useLocation();

  if (loading) return null;

  // 🔐 Not logged in
  if (!user) return <Navigate to="/login" replace />;

  // 👑 Admin routes
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const setup = user?.setup || {};
  const steps = setup.steps || [];

  // ✅ BACKEND FIELD
  const setupCompleted = setup.completed === true;

  // ✅ All skipped case
  const allStepsSkipped =
    steps.length > 0 && steps.every((s) => s.status === "skipped");

  const allowOrganization = setupCompleted || allStepsSkipped;
  const isSetupPage = location.pathname.startsWith("/setup");

  // 🔓 User intent override
  const params = new URLSearchParams(location.search);
  const forceWizard = params.get("force") === "true";

  // 🧙 Setup required
  if (!allowOrganization && !isSetupPage) {
    return <Navigate to="/setup" replace />;
  }

  // 🚫 Block wizard if setup done (unless forced)
  if (allowOrganization && isSetupPage && !forceWizard) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
