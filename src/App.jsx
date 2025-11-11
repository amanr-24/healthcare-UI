import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import LoadingError from "./components/layout/LoadingError";

// ✅ Import all dashboard pages
import OverviewTab from "./components/dashboard/OverviewTab";
import DepartmentTab from "./components/dashboard/DepartmentTab";
import AppointmentTab from "./components/dashboard/AppointmentTab";
import FinancialTab from "./components/dashboard/FinancialTab";
import InventoryTab from "./components/dashboard/InventoryTab";
import PatientTab from "./components/dashboard/PatientTab";
import StaffTab from "./components/dashboard/StaffTab";
import VitalsTab from "./components/dashboard/VitalsTab";

export default function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-50 text-gray-900">
        {/* ✅ Sidebar */}
        <Sidebar />

        {/* ✅ Main Content Area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Topbar */}
          <Topbar />

          {/* Main Page Content */}
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

              {/* Fallback route */}
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
    </Router>
  );
}
