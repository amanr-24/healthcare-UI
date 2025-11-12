import React, { useMemo, useEffect, useState } from "react";
import axios from "axios";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import LoadingError from "../layout/LoadingError";
import Loader from "../layout/Loader"; // 👈 added loader import
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
  // ✅ States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [demographics, setDemographics] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [activities, setActivities] = useState([]);

  // ✅ Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [deptRes, demoRes, vitalsRes, actRes] = await Promise.all([
          axios.get("http://localhost:47815/api/departments"),
          axios.get("http://localhost:47815/api/demographics/gender"),
          axios.get("http://localhost:47815/api/vitals"),
          axios.get("http://localhost:47815/api/activities/recent"),
        ]);

        setDepartments(deptRes.data || []);
        setDemographics(demoRes.data || []);
        setVitals(vitalsRes.data || []);
        setActivities(actRes.data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching overview data:", err);
        setError("Failed to fetch overview data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ Department Chart
  const deptChartOptions = useMemo(() => {
    const names = departments.map((d) => d.name || "Unknown");
    const patients = departments.map((d) => Number(d.totalPatients) || 0);
    const staff = departments.map((d) => {
      const s = d.staff || {};
      return (s.doctors || 0) + (s.nurses || 0) + (s.support || 0);
    });

    return {
      chart: { type: "column", backgroundColor: "transparent", height: 250 },
      title: { text: "" },
      xAxis: { categories: names, title: { text: "Departments" } },
      yAxis: { title: { text: "Count" } },
      legend: { itemStyle: { fontWeight: "bold" } },
      plotOptions: { column: { borderRadius: 5, groupPadding: 0.05 } },
      series: [
        { name: "Patients", data: patients, color: "#3b82f6" },
        { name: "Staff", data: staff, color: "#10b981" },
      ],
      credits: { enabled: false },
    };
  }, [departments]);

  // ✅ Gender Demographics Chart
  const genderChartOptions = useMemo(() => {
    const genderData =
      Array.isArray(demographics) && demographics.length > 0
        ? demographics.map((item) => ({
            name: item.gender || "Unknown",
            y: parseFloat(item.percentage) || 0,
            color: item.color || "#8884d8",
          }))
        : [
            { name: "Male", y: 0, color: "#3b82f6" },
            { name: "Female", y: 0, color: "#ec4899" },
          ];

    return {
      chart: { type: "pie", backgroundColor: "transparent", height: 250 },
      title: { text: "" },
      tooltip: { pointFormat: "<b>{point.y:.1f}%</b>" },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          dataLabels: { enabled: true, format: "{point.name}: {point.y:.1f}%" },
        },
      },
      series: [{ name: "Patients", data: genderData }],
      credits: { enabled: false },
    };
  }, [demographics]);

  // ✅ Loading / Error
  if (loading) return <Loader />; // 👈 replaced text with loader
  if (error) return <LoadingError message={error} />;

  return (
    <div className="space-y-8">
      {/* ✅ Overview Cards */}
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

      {/* ✅ Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Department Overview" chart={deptChartOptions} />
        <ChartCard title="Patient Demographics" chart={genderChartOptions} />
      </div>

      {/* ✅ Vital Signs & Recent Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vital Signs */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Vital Signs Monitoring
          </h3>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-700 font-semibold">
                <th className="p-2 text-left">Patient</th>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Heart Rate</th>
                <th className="p-2 text-left">BP</th>
                <th className="p-2 text-left">Temp</th>
                <th className="p-2 text-left">O₂ Sat</th>
              </tr>
            </thead>
            <tbody>
              {vitals.map((v, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50 transition">
                  <td className="p-2 font-medium text-gray-900">{v.patientName}</td>
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

        {/* ✅ Recent Activities */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activities</h3>

          {activities.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent activities found.</p>
          ) : (
            activities.map((a) => (
              <div
                key={a.id}
                className="flex items-start space-x-4 border-b last:border-0 py-3"
              >
                <div
                  className={`p-2 rounded-lg shadow-sm ${
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
                  <p className="font-semibold text-gray-900 text-sm">
                    {a.type}: {a.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(a.timestamp).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    a.priority === "High"
                      ? "bg-red-100 text-red-700"
                      : a.priority === "Medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {a.priority}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ✅ Compact Stat Card */
function CompactCard({ label, value, trend, trendUp, icon: Icon, color }) {
  return (
    <div className="flex flex-col justify-between bg-white rounded-xl shadow-sm border border-gray-100 p-3 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-gray-500 font-semibold truncate">{label}</p>
        <div className={`p-2 rounded-md bg-gradient-to-r ${color} text-white shadow-sm`}>
          <Icon size={14} />
        </div>
      </div>
      <h3 className="text-lg font-bold text-gray-900">{value}</h3>
      <div className="flex items-center text-[11px] mt-1">
        <span className={`${trendUp ? "text-green-500" : "text-red-500"} font-semibold flex items-center`}>
          {trendUp ? "▲" : "▼"} {trend}
        </span>
        <span className="ml-1 text-gray-500">vs previous</span>
      </div>
    </div>
  );
}

/* ✅ Chart Card */
function ChartCard({ title, chart }) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      <HighchartsReact highcharts={Highcharts} options={chart} />
    </div>
  );
}
