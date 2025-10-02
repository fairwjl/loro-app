// client/src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppShell from "./ui/AppShell";

import Home from "./pages/Home.jsx";
import BreathingPage from "./pages/BreathingPage.jsx";
import BilateralPage from "./pages/BilateralPage.jsx";
import SafetyPlanPage from "./pages/SafetyPlanPage.jsx";
import ReflectionsPage from "./pages/ReflectionsPage.jsx";
import JournalPage from "./pages/JournalPage.jsx";
import WorksheetsPage from "./pages/WorksheetsPage.jsx";
import SymptomTrackingPage from "./pages/SymptomTrackingPage.jsx";
import MusicPage from "./pages/MusicPage.jsx";

function App() {
  return (
    <Router>
      <AppShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/breathing" element={<BreathingPage />} />
          <Route path="/bilateral" element={<BilateralPage />} />
          <Route path="/safety-plan" element={<SafetyPlanPage />} />
          <Route path="/reflections" element={<ReflectionsPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/worksheets" element={<WorksheetsPage />} />
          <Route path="/symptoms" element={<SymptomTrackingPage />} />
          <Route path="/music" element={<MusicPage />} />
        </Routes>
      </AppShell>
    </Router>
  );
}

export default App;