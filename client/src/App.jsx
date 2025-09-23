// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppShell from "./ui/AppShell";

// Import pages (no .jsx extension, case-sensitive)
import Home from "./pages/Home";
import BreathingPage from "./pages/BreathingPage";
import BilateralPage from "./pages/BilateralPage";
import SafetyPlanPage from "./pages/SafetyPlanPage";
import JournalPage from "./pages/JournalPage";
import WorksheetsPage from "./pages/WorksheetsPage";

function App() {
  return (
    <Router>
      <AppShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/breathing" element={<BreathingPage />} />
          <Route path="/bilateral" element={<BilateralPage />} />
          <Route path="/safety-plan" element={<SafetyPlanPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/worksheets" element={<WorksheetsPage />} />
        </Routes>
      </AppShell>
    </Router>
  );
}

export default App;