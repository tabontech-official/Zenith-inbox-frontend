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
import CompanyProfile from "./pages/CompanyProfile";
import AdminAIConfig from "./Admin/AdminAIConfig";
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
import Pricing from "./pages/Pricing";
import ProductPage from "./pages/ProductPage";
import DevelopersPage from "./pages/DevelopersPage";
import FoldLandingPage from "./Reviews/Foldreviews";
import AdminUserEmails from "./Admin/AdminUserEmails";
import VerifyTwoFactor from "./Auth/VerifyTwoFactor";
import Terms from "./pages/Terms";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AdminLandingPage from "./Admin/AdminLandingPage";
import AdminScriptsPage from "./pages/Script";
import DynamicScripts from "./pages/DynamicScripts";
import FooterLinksPage from "./pages/FooterLinksPage";
import AdminProductPage from "./Admin/AdminProductPage";
import Security from "./pages/Security";

function App() {
  return (
    <UserProvider>
      <Router>
        <DynamicScripts />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/reviews" element={<FoldLandingPage />} />
          <Route path="/resources" element={<FooterLinksPage />} />
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
            path="/pricing"
            element={
              <PublicRoute>
                <Pricing />
              </PublicRoute>
            }
          />
          <Route
            path="/developer"
            element={
              <PublicRoute>
                <DevelopersPage />
              </PublicRoute>
            }
          />
          <Route
            path="/product"
            element={
              <PublicRoute>
                <ProductPage />
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
            path="/dashboard"
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
            path="/security"
            element={
              <ProtectedRoute>
                <Security />
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
          <Route path="/verify-2fa" element={<VerifyTwoFactor />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />

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
            path="/dashboard/email/:id"
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
          <Route
            path="/company-profile"
            element={
              <ProtectedRoute>
                <CompanyProfile />
              </ProtectedRoute>
            }
          />
          {/* Admin Routing */}
          <Route
            path="/admin/ai-config"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminAIConfig />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/product-page"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminProductPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pages/scripts"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminScriptsPage />
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
            path="/admin/pages/landing-page"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminLandingPage />
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
          <Route path="/admin/email/:userId" element={<AdminUserEmails />} />
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
