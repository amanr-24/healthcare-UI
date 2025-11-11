import React from "react";
import { Routes, Route } from "react-router-dom";
import HealthCareDashboard from "./components/HealthCareDashboard";

// ✅ Add your page imports here (make sure file names match)
import AppointmentsPage from "./pages/AppointmentsPage";
import PatientsPage from "./pages/PatientsPage";
import ReportsPage from "./pages/ReportsPage";
import SchedulePage from "./pages/SchedulePage";

export default function App() {
  return (
    <Routes>
      {/* Default Dashboard Page */}
      <Route path="/" element={<HealthCareDashboard />} />

      {/* ✅ These pages make your navigation links work */}
      <Route path="/appointments" element={<AppointmentsPage />} />
      <Route path="/patients" element={<PatientsPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/schedule" element={<SchedulePage />} />
    </Routes>
  );
}
