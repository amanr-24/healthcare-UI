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
  Activity,
} from "lucide-react";

export default function OverviewTab() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // MAIN DATA STATES
  const [departments, setDepartments] = useState([]);
  const [genderDemographics, setGenderDemographics] = useState([]);
  const [ageDemographics, setAgeDemographics] = useState([]);
  const [insuranceDemographics, setInsuranceDemographics] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [activities, setActivities] = useState([]);

  // SELECTED DEMOGRAPHIC (dropdown)
  const [selectedDemo, setSelectedDemo] = useState("gender");

  // =================== FETCH DATA ===================
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        const [
          deptRes,
          genderRes,
          ageRes,
          insuranceRes,
          vitalsRes,
          actRes,
        ] = await Promise.all([
          axios.get("http://localhost:47815/api/departments"),
          axios.get("http://localhost:47815/api/demographics/gender"),
          axios.get("http://localhost:47815/api/demographics/age"),
          axios.get("http://localhost:47815/api/demographics/insurance"),
          axios.get("http://localhost:47815/api/vitals"),
          axios.get("http://localhost:47815/api/activities/recent"),
        ]);

        setDepartments(deptRes.data || []);
        setGenderDemographics(genderRes.data || []);
        setAgeDemographics(ageRes.data || []);
        setInsuranceDemographics(insuranceRes.data || []);
        setVitals(vitalsRes.data || []);
        setActivities(actRes.data || []);

        setError(null);
      } catch (err) {
        console.log("ERROR:", err);
        setError("Failed to fetch overview data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // =================== DEPARTMENT CHART ===================
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

  // =================== MAKE PIE FUNCTION ===================
  const makePieOptions = (items, height = 320) => {
    if (!items || items.length === 0) {
      return {
        chart: { type: "pie", backgroundColor: "transparent", height },
        title: { text: "" },
        series: [{ data: [] }],
        credits: { enabled: false },
      };
    }

    const processed = items.map((item) => ({
      name: item.label || item.gender || item.type || "Unknown",
      y: Number(item.percentage) || 0,
      color: item.color || undefined,
    }));

    return {
      chart: { type: "pie", backgroundColor: "transparent", height },
      title: { text: "" },

      tooltip: { pointFormat: "<b>{point.y:.1f}%</b>" },

      plotOptions: {
        pie: {
          allowPointSelect: true,
          showInLegend: true,
          borderColor: "#fff",
          borderWidth: 2,

          dataLabels: {
            enabled: true,
            format: "{point.name}: {point.y}%",
            style: {
              fontSize: "12px",
              fontWeight: "600",
              color: "#374151",
            },
            distance: 20,
            connectorColor: "#9CA3AF",
          },
        },
      },

      legend: {
        layout: "horizontal",
        align: "center",
        verticalAlign: "bottom",
        itemStyle: { fontWeight: "600", fontSize: "12px" },
        symbolRadius: 4,
      },

      series: [
        {
          name: "Patients",
          innerSize: "40%", // donut
          data: processed,
        },
      ],

      credits: { enabled: false },
    };
  };

  // =================== SINGLE DROPDOWN-BASED DEMOGRAPHIC ===================
  const selectedDemographicData = useMemo(() => {
    if (selectedDemo === "gender") return genderDemographics;
    if (selectedDemo === "age") return ageDemographics;
    if (selectedDemo === "insurance") return insuranceDemographics;
    return [];
  }, [selectedDemo, genderDemographics, ageDemographics, insuranceDemographics]);

  const demographicChartOptions = useMemo(
    () => makePieOptions(selectedDemographicData),
    [selectedDemographicData]
  );

  // =================== LOADING / ERROR ===================
  if (loading) return <Loader />;
  if (error) return <LoadingError message={error} />;

  // =================== UI RENDER ===================
  return (
    <div className="space-y-8">
      {/* ======= Overview Cards ======= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <CompactCard
          label="Total Patients"
          value="12400"
          trend="+12%"
          trendUp
          icon={Users}
          color="from-blue-600 to-blue-400"
        />
        <CompactCard
          label="Active Patients"
          value="416"
          trend="+8%"
          trendUp
          icon={Heart}
          color="from-emerald-600 to-emerald-400"
        />
        <CompactCard
          label="Appointments"
          value="832"
          trend="+15%"
          trendUp
          icon={Calendar}
          color="from-purple-600 to-purple-400"
        />
        <CompactCard
          label="Critical Alerts"
          value="28"
          trend="-5%"
          trendUp={false}
          icon={AlertCircle}
          color="from-red-600 to-red-400"
        />
        <CompactCard
          label="Bed Occupancy"
          value="85.1%"
          trend="+52"
          trendUp
          icon={Bed}
          color="from-yellow-500 to-yellow-300"
        />
        <CompactCard
          label="Staff On Duty"
          value="120"
          trend="+45"
          trendUp
          icon={Users2}
          color="from-sky-500 to-blue-300"
        />
      </div>

      {/* ======= ROW 1: Department + Single Demographic ======= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Department Overview" chart={deptChartOptions} />

        {/* ========== SINGLE DROPDOWN DEMOGRAPHIC CHART ========== */}
        <div className="bg-white rounded-xl shadow-md border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Patient Demographics</h3>

            <select
              value={selectedDemo}
              onChange={(e) => setSelectedDemo(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="gender">By Gender</option>
              <option value="age">By Age</option>
              <option value="insurance">By Insurance</option>
            </select>
          </div>

          <HighchartsReact
            highcharts={Highcharts}
            options={demographicChartOptions}
          />
        </div>
      </div>

      {/* ======= ROW 2: Vitals + Activities ======= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <VitalsTable vitals={vitals} />
        <ActivitiesList activities={activities} />
      </div>
    </div>
  );
}

/* ========== CHILD COMPONENTS ========== */
function ChartCard({ title, chart }) {
  return (
    <div className="bg-white rounded-xl shadow-md border p-5">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      <HighchartsReact highcharts={Highcharts} options={chart} />
    </div>
  );
}

function CompactCard({ label, value, trend, trendUp, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-3 flex flex-col">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">{label}</p>
        <div className={`p-2 rounded-md bg-gradient-to-r ${color} text-white`}>
          <Icon size={14} />
        </div>
      </div>
      <h3 className="text-lg font-bold">{value}</h3>

      <p className={`text-xs mt-1 ${trendUp ? "text-green-600" : "text-red-500"}`}>
        {trendUp ? "▲" : "▼"} {trend}
      </p>
    </div>
  );
}

function VitalsTable({ vitals }) {
  return (
    <div className="bg-white rounded-xl shadow-md border p-6">
      <h3 className="text-xl font-bold mb-4">Vital Signs Monitoring</h3>

      <table className="w-full text-sm">
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
            <Activity size={18} />
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
