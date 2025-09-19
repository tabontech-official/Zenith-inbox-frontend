import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./Auth/Login";
import RegisterPage from "./Auth/Register";
import Organization from "./pages/Organization";
import ConnectionsPage from "./pages/Connection";
import AllScenariosPage from "./pages/AllScenariosPage ";
import BuildScenario from "./pages/BuildScenario";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/organization" element={<Organization />} />
        <Route path="/connection" element={<ConnectionsPage />} />
        <Route path="/scenarios" element={<AllScenariosPage />} />
        <Route path="/scenarios/add" element={<BuildScenario />} />
      </Routes>
    </Router>
  );
}

export default App;
