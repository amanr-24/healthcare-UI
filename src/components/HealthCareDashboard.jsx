import React, { useEffect, useMemo, useState } from "react";
import { BarChart3, Heart, Users, Calendar, Activity, Package, DollarSign } from "lucide-react";
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


const MENU = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "departments", label: "Departments", icon: Heart },
  { id: "patients", label: "Patients", icon: Users },
  { id: "appointments", label: "Appointments", icon: Calendar },
  { id: "staff", label: "Medical Staff", icon: Activity },
  { id: "vitals", label: "Vitals & Alerts", icon: Activity },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "financial", label: "Financial", icon: DollarSign },
];

export default function HealthCareDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // loading & error per key
  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});

  // data
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

  // initial load
  useEffect(() => {
    start("/overview", "overview", setOverviewStats);

    start("/departments", "departments", setDepartments, (data) => {
      const arr = Array.isArray(data) ? data : [];
      return arr.map((d) => ({
        department_id: d.id ?? d.department_id ?? d.departmentId,
        name: d.name ?? d.code ?? "Department",
        total_patients:
          d.total_patients ??
          d.totalPatients ??
          0,
        capacity: d.capacity ?? 0,
        current_occupancy: d.current_occupancy ?? d.currentOccupancy ?? 0,
        staff: d.staff ?? {},
        department_head: d.department_head ?? d.head ?? "N/A",
        total_staff:
          (d.staff?.doctors || 0) +
          (d.staff?.nurses || 0) +
          (d.staff?.support || 0),
      }));
    });

    start("/patients/active", "patients", setPatients, (arr) => Array.isArray(arr) ? arr : []);
    start("/staff", "staff", setStaff, (arr) => Array.isArray(arr) ? arr : []);

    start("/appointments", "appointments", setAppointments, (arr) => {
      const data = Array.isArray(arr) ? arr : [];
      // Only appointments with a doctor
      return data
        .filter((a) => a.doctorName && a.doctorName !== "N/A")
        .map((a) => ({
          ...a,
          appointment_id: a.appointment_id || a.id,
        }));
    });

    start("/vitals", "vitals", setVitalAlerts, (arr) => Array.isArray(arr) ? arr : []);
    start("/activities/recent", "activities", setRecentActivities, (arr) => Array.isArray(arr) ? arr : []);

    start("/demographics", "demographics", setDemographics, (data) => {
      // allow either nested byGender or 3 endpoints combined on server
      return data?.byGender
        ? data
        : {
            byGender: data?.gender || [],
            byAge: data?.age || [],
            byInsurance: data?.insurance || [],
          };
    });

    start("/inventory", "inventory", setInventory);
    start("/financial", "financial", setFinancialData, (arr) => Array.isArray(arr) ? arr : []);

    // revenue by department: supports either [{department_id,total_revenue}] or {data:[...]}
    start("/financial/department", "deptRevenue", setDeptRevenue, (res) => {
      const raw = Array.isArray(res) ? res : res?.data || [];
      return raw.map((r) => ({
        department_id: String(r.department_id ?? r.departmentId ?? ""),
        revenue: Number(r.total_revenue ?? r.revenue ?? 0),
      }));
    });
  }, []);

  // map deptRevenue to names once departments loaded
  const deptRevenueNamed = useMemo(() => {
    if (!deptRevenue?.length || !departments?.length) return [];
    return deptRevenue.map((r) => {
      const d = departments.find(
        (x) => String(x.department_id) === String(r.department_id)
      );
      return {
        department: d?.name || (r.department_id ? `Dept ${r.department_id}` : "All Departments"),
        revenue: r.revenue || 0,
      };
    });
  }, [deptRevenue, departments]);

  // fetch appointment counts per department
  useEffect(() => {
    (async () => {
      if (!departments?.length) return;
      const out = [];
      for (const d of departments) {
        try {
          // try correct spelling first
          const a1 = await apiGet(`/departments/${d.department_id}/appointments`);
          const list1 = Array.isArray(a1) ? a1 : (a1?.data || []);
          const count1 = Array.isArray(list1) ? list1.length : 0;

          // if zero, also try the misspelled route (compat)
          let count = count1;
          if (count === 0) {
            try {
              const a2 = await apiGet(`/departments/${d.department_id}/appoinments`);
              const list2 = Array.isArray(a2) ? a2 : (a2?.data || []);
              count = Array.isArray(list2) ? list2.length : 0;
            } catch {
              /* ignore */
            }
          }

          out.push({ name: d.name, appointments: count });
        } catch {
          out.push({ name: d.name, appointments: 0 });
        }
      }
      setDeptApptCounts(out);
    })();
  }, [departments]);

  const financialSummary = useMemo(() => {
    const rev = financialData.reduce((s, r) => s + (parseFloat(r.revenue) || 0), 0);
    const exp = financialData.reduce((s, r) => s + (parseFloat(r.expenses) || 0), 0);
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

      <div className={`flex-1 flex flex-col overflow-hidden ${sidebarOpen ? "ml-72" : "ml-24"} transition-all duration-300`}>
        <Topbar />

        <div className="flex-1 overflow-auto p-8">
          {/* Top-level fetch failure message if needed */}
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
            <PatientTab loading={loading} error={error} patients={patients} setPatients={setPatients} />
          )}

          {activeTab === "appointments" && (
            <AppointmentTab loading={loading} error={error} appointments={appointments} />
          )}

          {activeTab === "staff" && (
            <StaffTab loading={loading} error={error} staff={staff} />
          )}

          {activeTab === "vitals" && (
            <VitalsTab loading={loading} error={error} vitalAlerts={vitalAlerts} />
          )}

         {activeTab === "inventory" && (
  <InventoryTab loading={loading.inventory} error={error.inventory} inventory={inventory} />
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
