// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppShell from "./ui/AppShell.jsx";

// NOTE: Your folder is "Pages" (capital P) — keep this exact casing.
import Home from "./Pages/Home.jsx";
import BreathingPage from "./Pages/BreathingPage.jsx";
import BilateralPage from "./Pages/BilateralPage.jsx";
import SafetyPlanPage from "./Pages/SafetyPlanPage.jsx";
import JournalPage from "./Pages/JournalPage.jsx";
import WorksheetsPage from "./Pages/WorksheetsPage.jsx";

export default function App() {
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