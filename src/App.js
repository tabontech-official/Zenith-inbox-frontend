// import React from "react";
// import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// import { Toaster } from "react-hot-toast";
// import LandingPage from "./pages/LandingPage";
// import LoginPage from "./Auth/Login";
// import RegisterPage from "./Auth/Register";
// import Organization from "./pages/Organization";
// import ConnectionsPage from "./pages/Connection";
// import BuildScenario from "./pages/BuildScenario";
// import Template from "./pages/Template";
// import ShopifyScenariosPage from "./pages/ShopifyScenario";
// import OthersScenariosPage from "./pages/OtherScenario";
// import AllScenariosPage from "./pages/AllScenario";
// import { UserProvider } from "./component/UserContext";
// import EmailDetailPage from "./pages/EmailDetailPage";

// function App() {
//   return (
//     <UserProvider>
//       <Router>
//         <Routes>
//           <Route path="/" element={<LandingPage />} />
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/register" element={<RegisterPage />} />
//           <Route path="/organization" element={<Organization />} />
//           <Route path="/connection" element={<ConnectionsPage />} />

//           <Route path="/scenarios/others" element={<OthersScenariosPage />} />
//           <Route path="/scenarios/others/:id" element={<OthersScenariosPage />} />
//           <Route path="/scenarios/shopify" element={<ShopifyScenariosPage />} />
//           <Route path="/scenarios/shopify/:id" element={<ShopifyScenariosPage />} />
//           <Route path="/scenarios/add" element={<BuildScenario />} />
//           <Route path="/scenarios/all" element={<AllScenariosPage />} />
//           <Route path="/organization/email/:id" element={<EmailDetailPage />} />

//           <Route path="/templates" element={<Template />} />
//         </Routes>

//         {/* Toasts */}
//         <Toaster position="top-right" reverseOrder={false} />
//       </Router>
//     </UserProvider>
//   );
// }

// export default App;
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./Auth/Login";
import RegisterPage from "./Auth/Register";
import Organization from "./pages/Organization";
import ConnectionsPage from "./pages/Connection";
import BuildScenario from "./pages/BuildScenario";
import Template from "./pages/Template";
import ShopifyScenariosPage from "./pages/ShopifyScenario";
import OthersScenariosPage from "./pages/OtherScenario";
import AllScenariosPage from "./pages/AllScenario";
import { UserProvider } from "./component/UserContext";
import EmailDetailPage from "./pages/EmailDetailPage";
import ProtectedRoute from "./Protection/Protected";
import SetupPage from "./pages/SetupPage";
import SetupFlow from "./pages/SetupPage";
import Inbox from "./pages/Inbox";
import MailhookSetupGuide from "./pages/MailhookSetupGuide";
import Profile from "./pages/Profile";
import ResetPassword from "./Auth/ResetPassword";
import ForgotPassword from "./Auth/ForgotPassword";
import LoginVerify from "./Auth/LoginVerify";
import AdminDashboard from "./Admin/AdminDashboard";
import AdminUsers from "./Admin/AdminUsers";
import AdminConnections from "./Admin/AdminConnections";
import AdminUserActivity from "./Admin/AdminUserActivity";
import AdminEmailTracking from "./Admin/AdminEmailTracking";
import AdminScenarioStats from "./Admin/ScenarioStats";
import AdminTemplateUsage from "./Admin/AdminTemplateUsage";
import AdminTemplate from "./Admin/AdminTemplate";
import PublicRoute from "./Protection/PublicRoute";
import Custom from "./pages/CustomTemplate";
import TalkToSales from "./pages/TalkToSales";

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
           <Route
            path="/talk-to-sales"
            element={
              <PublicRoute>
                <TalkToSales />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/organization"
            element={
              <ProtectedRoute>
                <Organization />
              </ProtectedRoute>
            }
          />
          <Route
            path="/connection"
            element={
              <ProtectedRoute>
                <ConnectionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scenarios/others"
            element={
              <ProtectedRoute>
                <OthersScenariosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inbox"
            element={
              <ProtectedRoute>
                <Inbox />
              </ProtectedRoute>
            }
          />
          <Route
            path="/setup"
            element={
              <ProtectedRoute>
                <SetupFlow />
              </ProtectedRoute>
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/login-verify/:token" element={<LoginVerify />} />

          <Route
            path="/scenarios/others/:id"
            element={
              <ProtectedRoute>
                <OthersScenariosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pages/mailhook/instruction"
            element={
              <ProtectedRoute>
                <MailhookSetupGuide />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scenarios/shopify"
            element={
              <ProtectedRoute>
                <ShopifyScenariosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scenarios/shopify/:id"
            element={
              <ProtectedRoute>
                <ShopifyScenariosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scenarios/add"
            element={
              <ProtectedRoute>
                <BuildScenario />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scenarios/all"
            element={
              <ProtectedRoute>
                <AllScenariosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organization/email/:id"
            element={
              <ProtectedRoute>
                <EmailDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/templates"
            element={
              <ProtectedRoute>
                <Template />
              </ProtectedRoute>
            }
          />
           <Route
            path="/templates/general"
            element={
              <ProtectedRoute>
                <Custom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          {/* Admin Routing */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/connections"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminConnections />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/reports/user-activity"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminUserActivity />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/reports/email-tracking"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminEmailTracking />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/reports/scenarios"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminScenarioStats />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/reports/templates"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminTemplateUsage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/templates/:userId"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminTemplate />
              </ProtectedRoute>
            }
          />
        </Routes>

        <Toaster
          position="top-right"
          containerStyle={{
            top: "70px",
          }}
          toastOptions={{
            duration: 4000,
            style: {
              background: "#fff",
              color: "#333",
              border: "1px solid #e5e7eb",
              padding: "12px 16px",
              borderRadius: "8px",
            },
          }}
        />
      </Router>
    </UserProvider>
  );
}

export default App;
// import React from "react";

// export default function App() {
//   return (
//     <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black overflow-hidden">

//       {/* ⚪ Neon Gray Bubble (clockwise) */}
//       <div className="absolute w-[500px] h-[500px] flex items-center justify-center animate-spin-slow">
//         <div
//           className="absolute rounded-full blur-3xl"
//           style={{
//             width: "220px",
//             height: "220px",
//             transform: "translateX(180px)",
//             background:
//               "radial-gradient(circle, rgba(200,200,200,0.4), rgba(80,80,80,0.1))",
//             boxShadow: "0 0 60px 20px rgba(200,200,200,0.3)",
//             animation: "pulse 5s ease-in-out infinite",
//           }}
//         />
//       </div>

//       {/* 🟢 Neon Bubble (counter-clockwise) */}
//       <div className="absolute w-[600px] h-[600px] flex items-center justify-center animate-spin-reverse-slow">
//         <div
//           className="absolute rounded-full blur-3xl"
//           style={{
//             width: "280px",
//             height: "280px",
//             transform: "translateX(-200px)",
//             background:
//               "radial-gradient(circle, rgba(57,255,20,0.4), rgba(0,255,255,0.1))",
//             boxShadow: "0 0 80px 30px rgba(0,255,255,0.25)",
//             animation: "pulse 6s ease-in-out infinite",
//           }}
//         />
//       </div>

//       {/* 💳 Card */}
//       <div className="relative z-10 bg-white/5 backdrop-blur-md p-10 rounded-2xl shadow-2xl border border-white/10 text-center max-w-sm">
//         <h1 className="text-4xl font-bold text-white mb-3 tracking-wide">
//           Neon Bubble Card ⚡
//         </h1>
//         <p className="text-gray-300">
//           Two glowing neon bubbles circulate smoothly behind this glass card.
//         </p>
//       </div>

//       {/* 🎬 Inline Keyframes */}
//       <style>{`
//         @keyframes pulse {
//           0%, 100% { transform: scale(1); opacity: 0.8; }
//           50% { transform: scale(1.15); opacity: 1; }
//         }

//         @keyframes spin-slow {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }

//         @keyframes spin-reverse-slow {
//           from { transform: rotate(360deg); }
//           to { transform: rotate(0deg); }
//         }

//         .animate-spin-slow {
//           animation: spin-slow 25s linear infinite;
//         }

//         .animate-spin-reverse-slow {
//           animation: spin-reverse-slow 30s linear infinite;
//         }
//       `}</style>
//     </div>
//   );
// }
