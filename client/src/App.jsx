// client/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./ui/AppShell.jsx";

// Import pages using the exact filenames you have
import Home from "./pages/Home.jsx";
import Breathing from "./pages/BreathingPage.jsx";
import Bilateral from "./pages/BilateralPage.jsx";
import SafetyPlan from "./pages/SafetyPlanPage.jsx";
import Journal from "./pages/JournalPage.jsx";
import Worksheets from "./pages/WorksheetsPage.jsx";

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