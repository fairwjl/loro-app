// client/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./ui/AppShell.jsx";

// Import pages using the exact filenames you have
import Home from "./pages/Home";
import BreathingPage from "./pages/BreathingPage";
import BilateralPage from "./pages/BilateralPage";
import WorksheetsPage from "./pages/WorksheetsPage";
import SafetyPlanPage from "./pages/SafetyPlanPage";
import JournalPage from "./pages/JournalPage";

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Navigate to="/" replace />} />

          <Route path="/breathing" element={<Breathing />} />
          <Route path="/bilateral" element={<Bilateral />} />
          <Route path="/safety-plan" element={<SafetyPlan />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/worksheets" element={<Worksheets />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}