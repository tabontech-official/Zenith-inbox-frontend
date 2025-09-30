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

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/organization" element={<Organization />} />
          <Route path="/connection" element={<ConnectionsPage />} />

          {/* Scenarios */}
          <Route path="/scenarios/others" element={<OthersScenariosPage />} />
          <Route path="/scenarios/others/:id" element={<OthersScenariosPage />} />
          <Route path="/scenarios/shopify" element={<ShopifyScenariosPage />} />
          <Route path="/scenarios/shopify/:id" element={<ShopifyScenariosPage />} />
          <Route path="/scenarios/add" element={<BuildScenario />} />
          <Route path="/scenarios/all" element={<AllScenariosPage />} />

          {/* Templates */}
          <Route path="/templates" element={<Template />} />
        </Routes>

        {/* Toasts */}
        <Toaster position="top-right" reverseOrder={false} />
      </Router>
    </UserProvider>
  );
}

export default App;
