import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import LoadingError from "./components/layout/LoadingError";

// Dashboard pages
import OverviewTab from "./components/dashboard/OverviewTab";
import DepartmentTab from "./components/dashboard/DepartmentTab";
import AppointmentTab from "./components/dashboard/AppointmentTab";
import FinancialTab from "./components/dashboard/FinancialTab";
import InventoryTab from "./components/dashboard/InventoryTab";
import PatientTab from "./components/dashboard/PatientTab";
import StaffTab from "./components/dashboard/StaffTab";
import VitalsTab from "./components/dashboard/VitalsTab";

export default function App() {
  const location = useLocation();

  // get path like "/appointments" → "appointments"
  const currentPath = location.pathname.replace("/", "") || "overview";

  // Sidebar states
  const [open, setOpen] = useState(true);
  const [active, setActive] = useState(currentPath);

  // Sync active state whenever the URL changes
  useEffect(() => {
    setActive(currentPath);
  }, [currentPath]);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        open={open}
        setOpen={setOpen}
        active={active}
        onSelect={(id) => setActive(id)}
      />

      {/* Main content */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          open ? "ml-72" : "ml-20"
        }`}
      >
        <Topbar />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50">
          <Routes>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<OverviewTab />} />
            <Route path="/departments" element={<DepartmentTab />} />
            <Route path="/appointments" element={<AppointmentTab />} />
            <Route path="/financials" element={<FinancialTab />} />
            <Route path="/inventory" element={<InventoryTab />} />
            <Route path="/patients" element={<PatientTab />} />
            <Route path="/staff" element={<StaffTab />} />
            <Route path="/vitals" element={<VitalsTab />} />

            {/* 404 Fallback */}
            <Route
              path="*"
              element={
                <LoadingError
                  error="404 - Page Not Found"
                  message="The page you are looking for doesn't exist."
                />
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}
