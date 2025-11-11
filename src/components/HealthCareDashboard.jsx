import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Heart,
  Users,
  Calendar,
  Activity,
  Package,
  DollarSign,
  AlertCircle,
  TrendingUp,
  Plus,
  Stethoscope,
} from "lucide-react";

import Sidebar from "./layout/Sidebar";
import Topbar from "./layout/Topbar";
import LoadingError from "./layout/LoadingError";

import OverviewTab from "./dashboard/OverviewTab";
import DepartmentTab from "./dashboard/DepartmentTab";
import PatientTab from "./dashboard/PatientTab";
import StaffTab from "./dashboard/StaffTab";
import AppointmentTab from "./dashboard/AppointmentTab";
import VitalsTab from "./dashboard/VitalsTab";
import InventoryTab from "./dashboard/InventoryTab";
import FinancialTab from "./dashboard/FinancialTab";

import { apiGet } from "../lib/api";

// ✅ Menu Items
const MENU = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "departments", label: "Departments", icon: Heart },
  { id: "patients", label: "Patients", icon: Users },
  { id: "appointments", label: "Appointments", icon: Calendar },
  { id: "staff", label: "Medical Staff", icon: Stethoscope },
  { id: "vitals", label: "Vitals & Alerts", icon: Activity },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "financial", label: "Financial", icon: DollarSign },
];

export default function HealthcareDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});
  const [overviewStats, setOverviewStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [staff, setStaff] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [vitalAlerts, setVitalAlerts] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [demographics, setDemographics] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [financialData, setFinancialData] = useState([]);
  const [deptRevenue, setDeptRevenue] = useState([]);
  const [deptApptCounts, setDeptApptCounts] = useState([]);

  // ✅ API Fetch helper
  const start = async (endpoint, key, setter, mapper = (x) => x) => {
    setLoading((p) => ({ ...p, [key]: true }));
    setError((p) => ({ ...p, [key]: null }));
    try {
      const data = await apiGet(endpoint);
      setter(mapper(data));
    } catch (e) {
      console.error(`Error fetching ${key}`, e);
      setError((p) => ({ ...p, [key]: e.message || "Failed" }));
    } finally {
      setLoading((p) => ({ ...p, [key]: false }));
    }
  };

  // ✅ Initial Data Load
  useEffect(() => {
    start("/overview", "overview", setOverviewStats);

    start("/departments", "departments", setDepartments, (data) =>
      (Array.isArray(data) ? data : []).map((d) => ({
        department_id: d.id ?? d.department_id,
        name: d.name ?? "Department",
        total_patients: d.total_patients ?? 0,
        capacity: d.capacity ?? 0,
        current_occupancy: d.current_occupancy ?? 0,
        staff: d.staff ?? {},
        department_head: d.department_head ?? "N/A",
        total_staff:
          (d.staff?.doctors || 0) +
          (d.staff?.nurses || 0) +
          (d.staff?.support || 0),
      }))
    );

    start("/patients/active", "patients", setPatients);
    start("/staff", "staff", setStaff);
    start("/appointments", "appointments", setAppointments);
    start("/vitals", "vitals", setVitalAlerts);
    start("/activities/recent", "activities", setRecentActivities);
    start("/demographics", "demographics", setDemographics);
    start("/inventory", "inventory", setInventory);
    start("/financial", "financial", setFinancialData);
    start("/financial/department", "deptRevenue", setDeptRevenue);
  }, []);

  // ✅ Department Revenue with names
  const deptRevenueNamed = useMemo(() => {
    if (!deptRevenue?.length || !departments?.length) return [];
    return deptRevenue.map((r) => {
      const d = departments.find(
        (x) => String(x.department_id) === String(r.department_id)
      );
      return {
        department: d?.name || `Dept ${r.department_id}`,
        revenue: r.revenue || 0,
      };
    });
  }, [deptRevenue, departments]);

  // ✅ Appointment counts per department
  useEffect(() => {
    if (!departments?.length) return;
    (async () => {
      const out = [];
      for (const d of departments) {
        try {
          const a1 = await apiGet(`/departments/${d.department_id}/appointments`);
          const list = Array.isArray(a1) ? a1 : a1?.data || [];
          out.push({ name: d.name, appointments: list.length });
        } catch {
          out.push({ name: d.name, appointments: 0 });
        }
      }
      setDeptApptCounts(out);
    })();
  }, [departments]);

  // ✅ Financial Summary
  const financialSummary = useMemo(() => {
    const rev = financialData.reduce(
      (s, r) => s + (parseFloat(r.revenue) || 0),
      0
    );
    const exp = financialData.reduce(
      (s, r) => s + (parseFloat(r.expenses) || 0),
      0
    );
    const net = rev - exp;
    const margin = rev > 0 ? ((net / rev) * 100).toFixed(1) : 0;
    return { totalRevenue: rev, totalExpenses: exp, netProfit: net, margin };
  }, [financialData]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        items={MENU}
        active={activeTab}
        onSelect={setActiveTab}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      <div
        className={`flex-1 flex flex-col overflow-hidden ${
          sidebarOpen ? "ml-72" : "ml-24"
        } transition-all duration-300`}
      >
        <Topbar />

        <div className="flex-1 overflow-auto p-6 md:p-8">
          <LoadingError loading={false} error={null} />

          {activeTab === "overview" && (
            <OverviewTab
              loading={loading}
              error={error}
              overviewStats={overviewStats}
              departments={departments}
              demographics={demographics}
              recentActivities={recentActivities}
              deptRevenue={deptRevenueNamed}
            />
          )}

          {activeTab === "departments" && (
            <DepartmentTab
              loading={loading}
              error={error}
              overviewStats={overviewStats}
              departments={departments}
              deptApptCounts={deptApptCounts}
            />
          )}

          {activeTab === "patients" && (
            <PatientTab
              loading={loading}
              error={error}
              patients={patients}
              setPatients={setPatients}
            />
          )}

          {activeTab === "appointments" && (
            <AppointmentTab
              loading={loading}
              error={error}
              appointments={appointments}
            />
          )}

          {activeTab === "staff" && (
            <StaffTab loading={loading} error={error} staff={staff} />
          )}

          {activeTab === "vitals" && (
            <VitalsTab
              loading={loading}
              error={error}
              vitalAlerts={vitalAlerts}
            />
          )}

          {activeTab === "inventory" && (
            <InventoryTab
              loading={loading.inventory}
              error={error.inventory}
              inventory={inventory}
            />
          )}

          {activeTab === "financial" && (
            <FinancialTab
              loading={loading.financial}
              error={error.financial}
              financialData={financialData}
              summary={financialSummary}
            />
          )}
        </div>
      </div>
    </div>
  );
}
