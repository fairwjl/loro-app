// client/src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppShell from "./ui/AppShell";

// NOTE: no ".jsx" extensions in these imports
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
          <Route path="/breathing" element={<BreathingPage />} />
          <Route path="/bilateral" element={<BilateralPage />} />
          <Route path="/worksheets" element={<WorksheetsPage />} />
          <Route path="/safety" element={<SafetyPlanPage />} />
          <Route path="/journal" element={<JournalPage />} />
          {/* catch-all: send unknown routes to Home (optional) */}
          <Route path="*" element={<Home />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}