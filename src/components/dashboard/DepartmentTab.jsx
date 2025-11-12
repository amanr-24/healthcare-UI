import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import DepartmentCard from "../shared/DepartmentCard";
import LoadingError from "../layout/LoadingError";
import Loader from "../layout/Loader"; // 👈 Added loader import
import { Plus } from "lucide-react";

export default function DepartmentTab() {
  const [loading, setLoading] = useState({
    departments: true,
    stats: true,
  });
  const [error, setError] = useState({
    departments: null,
    stats: null,
  });

  const [departments, setDepartments] = useState([]);
  const [overviewStats, setOverviewStats] = useState({});
  const [deptApptCounts, setDeptApptCounts] = useState([]);
  const [staffDistribution, setStaffDistribution] = useState({});

  // ✅ Fetch live department data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading({ departments: true, stats: true });

        const [deptRes, statsRes] = await Promise.all([
          axios.get("http://localhost:47815/api/departments"),
          axios.get("http://localhost:47815/api/departments/stats"),
        ]);

        const deptData = deptRes.data || [];
        const statsData = statsRes.data || {};

        setDepartments(deptData);
        setOverviewStats(statsData);

        // Extract appointment counts dynamically
        const appointments = deptData.map((d) => ({
          name: d.name || "Unknown",
          appointments: Number(d.totalAppointments || d.todayPatients || 0),
        }));
        setDeptApptCounts(appointments);

        // Aggregate staff distribution
        const staffTotals = deptData.reduce(
          (acc, d) => {
            acc.doctors += d.staff?.doctors || 0;
            acc.nurses += d.staff?.nurses || 0;
            acc.support += d.staff?.support || 0;
            return acc;
          },
          { doctors: 0, nurses: 0, support: 0 }
        );

        setStaffDistribution(staffTotals);
        setError({ departments: null, stats: null });
      } catch (err) {
        console.error("Error fetching department data:", err);
        setError({
          departments: "Failed to fetch department data.",
          stats: "Failed to fetch overview stats.",
        });
      } finally {
        setLoading({ departments: false, stats: false });
      }
    };

    fetchData();
  }, []);

  // ✅ Chart: Appointments by Department
  const appointmentChartOptions = useMemo(() => {
    const names = deptApptCounts.map((d) => d.name);
    const apptCounts = deptApptCounts.map((d) => d.appointments);

    return {
      chart: { type: "column", backgroundColor: "transparent", height: 300 },
      title: { text: "" },
      xAxis: {
        categories: names,
        crosshair: true,
        labels: { style: { color: "#6b7280", fontWeight: 500 } },
      },
      yAxis: {
        min: 0,
        title: { text: "Appointments" },
        labels: { style: { color: "#6b7280" } },
      },
      tooltip: {
        headerFormat: "<b>{point.key}</b><br/>",
        pointFormat: "Appointments: <b>{point.y}</b>",
        borderRadius: 8,
        backgroundColor: "#fff",
        borderColor: "#e5e7eb",
      },
      plotOptions: {
        column: { borderRadius: 5, groupPadding: 0.05 },
      },
      series: [
        {
          name: "Appointments",
          data: apptCounts,
          color: "#3b82f6",
        },
      ],
      credits: { enabled: false },
      legend: { itemStyle: { color: "#374151", fontWeight: "bold" } },
    };
  }, [deptApptCounts]);

  // ✅ Chart: Staff Distribution (Pie)
  const staffPieOptions = useMemo(() => {
    const data = [
      { name: "Doctors", y: staffDistribution.doctors || 0, color: "#3b82f6" },
      { name: "Nurses", y: staffDistribution.nurses || 0, color: "#10b981" },
      { name: "Support", y: staffDistribution.support || 0, color: "#8b5cf6" },
    ];

    return {
      chart: { type: "pie", backgroundColor: "transparent", height: 300 },
      title: { text: "" },
      tooltip: { pointFormat: "<b>{point.y}</b>" },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: "pointer",
          dataLabels: {
            enabled: true,
            format: "<b>{point.name}</b>: {point.y}",
          },
        },
      },
      series: [{ name: "Staff", colorByPoint: true, data }],
      credits: { enabled: false },
    };
  }, [staffDistribution]);

  // ✅ Loader or Error Handling
  if (loading.departments || loading.stats) return <Loader />; // 👈 Replaced text with Loader
  if (error.departments) return <LoadingError message={error.departments} />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">
            Department Management
          </h2>
          <p className="text-gray-500 mt-1">
            Overview of all hospital departments
          </p>
        </div>
        <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition flex items-center space-x-2">
          <Plus size={18} /> <span>Add Department</span>
        </button>
      </div>

      {/* Chart: Appointments by Department */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          Appointments by Department
        </h3>
        {deptApptCounts.length > 0 ? (
          <HighchartsReact
            highcharts={Highcharts}
            options={appointmentChartOptions}
          />
        ) : (
          <p className="text-gray-500 text-sm text-center">
            No appointment data available
          </p>
        )}
      </div>

      {/* Chart: Staff Distribution */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          Staff Distribution
        </h3>
        {staffDistribution.doctors ||
        staffDistribution.nurses ||
        staffDistribution.support ? (
          <HighchartsReact
            highcharts={Highcharts}
            options={staffPieOptions}
          />
        ) : (
          <p className="text-gray-500 text-sm text-center">
            No staff data available
          </p>
        )}
      </div>
    </div>
  );
}
