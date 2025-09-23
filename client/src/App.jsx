// client/src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./ui/AppShell.jsx";
import Home from "./pages/Home.jsx";

// Your existing tools
import Breathe from "./components/Breathe.jsx";
import BLS from "./components/BLS.jsx";
import Journal from "./components/Journal.jsx";
import SafetyPlan from "./components/SafetyPlan.jsx";
import Mood from "./components/Mood.jsx";
import Effectiveness from "./components/Effectiveness.jsx";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/breathe" element={<Breathe />} />
        <Route path="/bls" element={<BLS />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/safety" element={<SafetyPlan />} />
        <Route path="/mood" element={<Mood />} />
        <Route path="/effectiveness" element={<Effectiveness />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}