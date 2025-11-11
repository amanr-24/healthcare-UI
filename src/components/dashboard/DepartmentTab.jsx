import React, { useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import DepartmentCard from "../shared/DepartmentCard";
import LoadingError from "../layout/LoadingError";
import { Plus } from "lucide-react";

export default function DepartmentTab({
  loading = {},
  error = {},
  overviewStats = {},
  departments = [],
  deptApptCounts = [],
  staffDistribution = {},
}) {
  // ✅ Normalize department chart data
  const chartData = useMemo(() => {
    const rawData = Array.isArray(deptApptCounts)
      ? deptApptCounts
      : Array.isArray(deptApptCounts?.data)
      ? deptApptCounts.data
      : [];

    let data = rawData.map((d) => ({
      name:
        d.name ||
        d.department ||
        d.departmentName ||
        d.deptName ||
        d.Department ||
        "Unknown",
      appointments: Number(
        d.appointments ||
          d.count ||
          d.totalAppointments ||
          d.total ||
          d.value ||
          0
      ),
    }));

    if (data.length === 0 || data.every((d) => d.appointments === 0)) {
      data = [
        { name: "Cardiology", appointments: 12 },
        { name: "Orthopedics", appointments: 9 },
        { name: "Neurology", appointments: 6 },
        { name: "Pediatrics", appointments: 10 },
        { name: "General Medicine", appointments: 14 },
        { name: "Emergency", appointments: 8 },
        { name: "Oncology", appointments: 5 },
        { name: "ENT", appointments: 7 },
      ];
    }

    return data;
  }, [deptApptCounts]);

  // ✅ Highcharts Config — Appointments by Department (Bar Chart)
  const appointmentChartOptions = useMemo(
    () => ({
      chart: { type: "column", backgroundColor: "transparent" },
      title: { text: "" },
      xAxis: {
        categories: chartData.map((d) => d.name),
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
          data: chartData.map((d) => d.appointments),
          color: "#3b82f6",
        },
      ],
      credits: { enabled: false },
      legend: { itemStyle: { color: "#374151", fontWeight: "bold" } },
    }),
    [chartData]
  );

  // ✅ Staff Distribution Data
  const staffData = useMemo(() => {
    const doctors = Number(staffDistribution.doctors ?? 8);
    const nurses = Number(staffDistribution.nurses ?? 15);
    const support = Number(staffDistribution.support ?? 5);
    return [
      { name: "Doctors", y: doctors, color: "#3b82f6" },
      { name: "Nurses", y: nurses, color: "#10b981" },
      { name: "Support", y: support, color: "#8b5cf6" },
    ];
  }, [staffDistribution]);

  // ✅ Highcharts Config — Staff Distribution (Pie Chart)
  const staffPieOptions = useMemo(
    () => ({
      chart: { type: "pie", backgroundColor: "transparent" },
      title: { text: "" },
      tooltip: { pointFormat: "{series.name}: <b>{point.y}</b>" },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: "pointer",
          dataLabels: {
            enabled: true,
            format: "<b>{point.name}</b>: {point.y}",
            style: { fontSize: "13px" },
          },
        },
      },
      series: [
        {
          name: "Staff",
          colorByPoint: true,
          data: staffData,
        },
      ],
      credits: { enabled: false },
    }),
    [staffData]
  );

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

      {/* Appointments Bar Chart */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          Appointments by Department
        </h3>
        <LoadingError loading={loading.departments} error={error.departments} />
        {!loading.departments && !error.departments && (
          <HighchartsReact
            highcharts={Highcharts}
            options={appointmentChartOptions}
          />
        )}
      </div>

      {/* Staff Distribution Pie Chart */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          Staff Distribution
        </h3>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
          <div className="flex justify-around w-full lg:w-1/2 text-center mb-6 lg:mb-0">
            {staffData.map((s) => (
              <div key={s.name}>
                <p className="font-semibold text-gray-600">{s.name}</p>
                <p
                  className={`text-3xl font-bold ${
                    s.name === "Doctors"
                      ? "text-blue-600"
                      : s.name === "Nurses"
                      ? "text-green-600"
                      : "text-purple-600"
                  }`}
                >
                  {s.y}
                </p>
              </div>
            ))}
          </div>

          <div className="w-full lg:w-1/2">
            <HighchartsReact
              highcharts={Highcharts}
              options={staffPieOptions}
            />
          </div>
        </div>
      </div>

      {/* Department Cards */}
      <LoadingError loading={loading?.departments} error={error?.departments} />
      {!loading?.departments &&
        !error?.departments &&
        (departments?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((d) => (
              <DepartmentCard key={d.department_id || d.id} dept={d} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-16">
            No departments found
          </p>
        ))}

      {/* 🧩 Bottom Dashboard Section */}
      <div className="space-y-8 pt-10 border-t border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Capacity & Occupancy */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              Capacity & Occupancy
            </h3>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <p>
                Current Occupancy{" "}
                <span className="text-blue-700 font-bold text-lg">
                  42 <span className="text-gray-400">/ 50</span>
                </span>
              </p>
              <p className="text-purple-700 font-bold text-lg">84%</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-yellow-400 h-2 rounded-full"
                style={{ width: "84%" }}
              ></div>
            </div>
          </div>

          {/* Financial Performance */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              Financial Performance
            </h3>
            <p className="text-gray-600 text-sm">Revenue</p>
            <p className="text-3xl font-bold text-green-600 mb-2">$198,400</p>
            <p className="text-gray-600 text-sm">Contribution to Hospital</p>
            <p className="text-xl font-semibold text-blue-600">28.4%</p>
          </div>

          {/* Quality Metrics */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              Quality Metrics
            </h3>
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-1">
                Readmission Rate{" "}
                <span className="text-green-600 font-semibold">7.6%</span>{" "}
                <span className="text-gray-400">vs 12.0% Target</span>
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: "63%" }}
                ></div>
              </div>
            </div>

            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-1">
                Wait Time{" "}
                <span className="text-green-600 font-semibold">45 min</span>{" "}
                <span className="text-gray-400">vs 60 min Target</span>
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: "75%" }}
                ></div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mt-2">
              Patient Satisfaction{" "}
              <span className="text-blue-600 font-semibold">4.2/5</span>{" "}
              <span className="text-gray-400">(298 responses)</span>
            </p>
          </div>
        </div>
      </div>

      {/* 🧩 Performance Snapshot Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mt-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Performance Snapshot
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Performing Staff */}
          <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">
              Top Performing Staff
            </h4>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-sm">
                  <th className="p-2">STAFF MEMBER</th>
                  <th className="p-2">ROLE</th>
                  <th className="p-2 text-center">PATIENTS</th>
                  <th className="p-2 text-center">RATING</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t hover:bg-gray-50 transition">
                  <td className="p-2 font-bold text-gray-900">Dr. R.</td>
                  <td className="p-2 text-gray-600">
                    Emergency Medicine
                    <p className="text-sm text-blue-500">Trauma Medicine</p>
                  </td>
                  <td className="p-2 text-center text-gray-700 font-semibold">12</td>
                  <td className="p-2 text-center">
                    <span className="text-yellow-400 text-lg">★ ★ ★ ★</span>
                    <span className="text-gray-300 text-lg">★</span>
                    <span className="ml-2 text-gray-700 font-semibold">4.8</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Recent Patients */}
          <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">
              Recent Patients
            </h4>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-sm">
                  <th className="p-2">PATIENT</th>
                  <th className="p-2">STATUS</th>
                  <th className="p-2 text-center">ROOM</th>
                  <th className="p-2 text-center">DOCTOR</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t hover:bg-gray-50 transition">
                  <td className="p-2 font-bold text-gray-900">
                    Emma D.
                    <p className="text-sm text-gray-500">ID: P••3</p>
                  </td>
                  <td className="p-2">
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold">
                      Critical
                    </span>
                  </td>
                  <td className="p-2 text-center text-gray-700 font-semibold">
                    ER-3
                  </td>
                  <td className="p-2 text-center text-blue-600 font-medium">
                    Dr. James Rodriguez
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
