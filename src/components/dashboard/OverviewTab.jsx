import React, { useMemo, useEffect, useState } from "react";
import axios from "axios";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import LoadingError from "../layout/LoadingError";
import Loader from "../layout/Loader";
import {
  Users,
  Heart,
  Calendar,
  AlertCircle,
  Bed,
  Users2,
} from "lucide-react";

export default function OverviewTab() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // MAIN DATA STATES
  const [overview, setOverview] = useState({});
  const [departments, setDepartments] = useState([]);
  const [genderDemo, setGenderDemo] = useState([]);
  const [ageDemo, setAgeDemo] = useState([]);
  const [insuranceDemo, setInsuranceDemo] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [activities, setActivities] = useState([]);

  const [selectedDemo, setSelectedDemo] = useState("gender");

  const API = "https://healthcare-backend-szmd.onrender.com/api";

  // ================= FETCH ALL DATA ================
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        const [
          overviewRes,
          deptRes,
          genderRes,
          ageRes,
          insuranceRes,
          vitalsRes,
          actRes,
        ] = await Promise.all([
          axios.get(`${API}/overview`),
          axios.get(`${API}/departments`),
          axios.get(`${API}/demographics/gender`),
          axios.get(`${API}/demographics/age`),
          axios.get(`${API}/demographics/insurance`),
          axios.get(`${API}/vitals`),
          axios.get(`${API}/activities/recent`),
        ]);

        setOverview(overviewRes.data || {});
        setDepartments(deptRes.data || []);
        setGenderDemo(genderRes.data || []);
        setAgeDemo(ageRes.data || []);
        setInsuranceDemo(insuranceRes.data || []);
        setVitals(vitalsRes.data || []);
        setActivities(actRes.data || []);

        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch overview data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // ========== BED OCCUPANCY COLOR (Option D) ==========
  const getBedColor = (rate) => {
    const r = Number(rate);
    if (r > 85) return "text-red-600";
    if (r >= 70) return "text-yellow-600";
    return "text-green-600";
  };

  const getBedBg = (rate) => {
    const r = Number(rate);
    if (r > 85) return "bg-red-100";
    if (r >= 70) return "bg-yellow-100";
    return "bg-green-100";
  };

  // ========== DEPARTMENT CHART ==========
  const deptChartOptions = useMemo(() => {
    const names = departments.map((d) => d.name || "Unknown");
    const patients = departments.map((d) => d.totalPatients || 0);
    const staff = departments.map((d) => {
      const s = d.staff || {};
      return (s.doctors || 0) + (s.nurses || 0) + (s.support || 0);
    });

    return {
      chart: { type: "column", backgroundColor: "transparent", height: 250 },
      title: { text: "" },
      xAxis: { categories: names },
      yAxis: { title: { text: "Count" } },
      plotOptions: { column: { borderRadius: 5, groupPadding: 0.05 } },
      series: [
        { name: "Patients", data: patients, color: "#3b82f6" },
        { name: "Staff", data: staff, color: "#10b981" },
      ],
      credits: { enabled: false },
    };
  }, [departments]);

  // ========== DEMOGRAPHICS ==========
  const demographicData =
    selectedDemo === "gender"
      ? genderDemo
      : selectedDemo === "age"
      ? ageDemo
      : insuranceDemo;

  const demoChartOptions = useMemo(() => {
    const processed = demographicData.map((item) => ({
      name: item.label || item.gender || item.type || "Unknown",
      y: Number(item.percentage) || 0,
    }));

    return {
      chart: { type: "pie", backgroundColor: "transparent", height: 320 },
      title: { text: "" },
      series: [
        {
          name: "Patients",
          innerSize: "40%",
          data: processed,
        },
      ],
      credits: { enabled: false },
    };
  }, [demographicData]);

  if (loading) return <Loader />;
  if (error) return <LoadingError message={error} />;

  // ========== UI STARTS HERE ==========
  return (
    <div className="space-y-8">

      {/* ========== SIX DYNAMIC CARDS ========== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          label="Total Patients"
          value={overview.total_patients}
          icon={Users}
          color="from-blue-600 to-blue-400"
        />

        <StatCard
          label="Active Patients"
          value={overview.active_patients}
          icon={Heart}
          color="from-emerald-600 to-emerald-400"
        />

        <StatCard
          label="Appointments"
          value={overview.total_appointments}
          icon={Calendar}
          color="from-purple-600 to-purple-400"
        />

        <StatCard
          label="Critical Alerts"
          value={overview.critical_alerts}
          icon={AlertCircle}
          color="from-red-600 to-red-400"
        />

        <StatCard
          label="Bed Occupancy"
          value={`${Number(overview.bed_occupancy_rate).toFixed(0)}%`}
          icon={Bed}
          color="from-yellow-500 to-yellow-300"
          extraClass={`${getBedBg(overview.bed_occupancy_rate)} ${getBedColor(
            overview.bed_occupancy_rate
          )} font-bold`}
        />

        <StatCard
          label="Staff On Duty"
          value={overview.staff_on_duty}
          icon={Users2}
          color="from-sky-500 to-blue-300"
        />
      </div>

      {/* ========== CHARTS ROW 1 ========== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Department Overview" chart={deptChartOptions} />

        <div className="bg-white rounded-xl shadow-md border p-5">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
            <h3 className="text-lg font-bold">Patient Demographics</h3>
            <select
              className="border rounded-lg px-3 py-2 text-sm"
              value={selectedDemo}
              onChange={(e) => setSelectedDemo(e.target.value)}
            >
              <option value="gender">By Gender</option>
              <option value="age">By Age</option>
              <option value="insurance">By Insurance</option>
            </select>
          </div>

          <HighchartsReact highcharts={Highcharts} options={demoChartOptions} />
        </div>
      </div>

      {/* ========== CHARTS ROW 2 ========== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <VitalsTable vitals={vitals} />
        <ActivitiesList activities={activities} />
      </div>
    </div>
  );
}

/* ========== COMPONENTS BELOW ========== */

function StatCard({ label, value, icon: Icon, color, extraClass }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-3 flex flex-col">
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-500">{label}</p>
        <div className={`p-2 rounded bg-gradient-to-r ${color} text-white`}>
          <Icon size={14} />
        </div>
      </div>

      <h3
        className={`text-lg font-bold mt-1 ${
          extraClass ? extraClass : "text-gray-900"
        }`}
      >
        {value}
      </h3>
    </div>
  );
}

function ChartCard({ title, chart }) {
  return (
    <div className="bg-white rounded-xl shadow-md border p-5">
      <h3 className="text-lg font-bold mb-4">{title}</h3>
      <HighchartsReact highcharts={Highcharts} options={chart} />
    </div>
  );
}

function VitalsTable({ vitals }) {
  return (
    <div className="bg-white rounded-xl shadow-md border p-6">
      <h3 className="text-xl font-bold mb-4">Vital Signs Monitoring</h3>

      <div className="overflow-x-auto">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-2 text-left">Patient</th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">HR</th>
              <th className="p-2 text-left">BP</th>
              <th className="p-2 text-left">Temp</th>
              <th className="p-2 text-left">O₂</th>
            </tr>
          </thead>

          <tbody>
            {vitals.map((v, i) => (
              <tr key={i} className="border-b">
                <td className="p-2">{v.patientName}</td>
                <td className="p-2">
                  {new Date(v.lastUpdated).toLocaleDateString("en-IN")}
                </td>
                <td className="p-2">{v.heartRate}</td>
                <td className="p-2">{v.bloodPressure}</td>
                <td className="p-2">{v.temperature}°F</td>
                <td className="p-2">{v.oxygenSaturation}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActivitiesList({ activities }) {
  return (
    <div className="bg-white rounded-xl shadow-md border p-6">
      <h3 className="text-xl font-bold mb-4">Recent Activities</h3>

      {activities.map((a) => (
        <div key={a.id} className="border-b py-3 flex items-start gap-3">
          <div
            className={`p-2 rounded ${
              a.priority === "High"
                ? "bg-red-100 text-red-700"
                : a.priority === "Medium"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            <Calendar size={18} />
          </div>

          <div className="flex-1">
            <p className="font-semibold text-sm">
              {a.type}: {a.message}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(a.timestamp).toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
