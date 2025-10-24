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

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

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
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
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
