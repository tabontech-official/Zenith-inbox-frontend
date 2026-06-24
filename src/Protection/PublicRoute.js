// import React, { useContext } from "react";
// import { Navigate } from "react-router-dom";
// import { UserContext } from "../component/UserContext";

// const PublicRoute = ({ children }) => {
//   const { user, loading } = useContext(UserContext);

//   if (loading) return null;

//   if (user) {
//     const hasSkippedOrIncomplete = user?.setup?.steps?.some(
//       (s) => s.status === "skipped" || s.status === "incomplete"
//     );
//     const wizardCompleted = !hasSkippedOrIncomplete;

//     if (!wizardCompleted) {
//       const nextStep =
//         user?.setup?.steps?.find(
//           (s) => s.status === "skipped" || s.status === "incomplete"
//         )?.step || 1;

//       return <Navigate to={`/setup?step=${nextStep}`} replace />;
//     }

//     return <Navigate to="/organization" replace />;
//   }

//   return children;
// };

// export default PublicRoute;
import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserContext } from "../component/UserContext";

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(UserContext);
  const location = useLocation();

  if (loading) return null;

  // sirf in pages par redirect chahiye jab user login ho
  const authPages = ["/login", "/register"];

  if (user && authPages.includes(location.pathname)) {
    const hasSkippedOrIncomplete = user?.setup?.steps?.some(
      (s) => s.status === "skipped" || s.status === "incomplete"
    );

    const wizardCompleted = !hasSkippedOrIncomplete;

    if (!wizardCompleted) {
      const nextStep =
        user?.setup?.steps?.find(
          (s) => s.status === "skipped" || s.status === "incomplete"
        )?.step || 1;

      return <Navigate to={`/setup?step=${nextStep}`} replace />;
    }

    return <Navigate to="/dashboard" replace />;
  }

  // baqi sab public routes allow
  return children;
};

export default PublicRoute;
