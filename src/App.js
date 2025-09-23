import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./Auth/Login";
import RegisterPage from "./Auth/Register";
import Organization from "./pages/Organization";
import ConnectionsPage from "./pages/Connection";
import BuildScenario from "./pages/BuildScenario";
import Template from "./pages/Template";
import AllScenariosPage from "./pages/OtherScenario";
import ShopifyScenariosPage from "./pages/ShopifyScenario";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/organization" element={<Organization />} />
        <Route path="/connection" element={<ConnectionsPage />} />
        <Route path="/scenarios/others" element={<AllScenariosPage />} />
                <Route path="/scenarios/shopify" element={<ShopifyScenariosPage />} />

        <Route path="/scenarios/add" element={<BuildScenario />} />
        <Route path="/templates" element={<Template />} />
      </Routes>
    </Router>
  );
}

export default App;
