import React, { useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import LoadingError from "../layout/LoadingError";
import Loader from "../layout/Loader"; // 👈 Added loader import
import axios from "axios";
import { Users, BookOpen } from "lucide-react";

export default function AppointmentTab() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState({ appointments: false });
  const [error, setError] = useState({ appointments: null });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:47815";

  // ✅ Fetch appointments from backend
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading({ appointments: true });
        const res = await axios.get(`${API_URL}/api/appointments`);
        const data = Array.isArray(res.data) ? res.data : [];

        const normalized = data.map((a, i) => ({
          appointment_id: a.appointment_id || i + 1,
          patientName: a.patientName || "Unknown",
          doctorName: a.doctorName || "Unknown Doctor",
          date: a.date || new Date().toISOString(),
          time: a.time || "N/A",
          type: a.type || "Consultation",
          status: a.status || "Scheduled",
        }));

        setAppointments(normalized);
        setError({ appointments: null });
      } catch (err) {
        console.error("❌ Error fetching appointments:", err);
        setError({ appointments: "Failed to load appointments data." });
        setAppointments([]); // ❌ No fallback mock data
      } finally {
        setLoading({ appointments: false });
      }
    };

    fetchAppointments();
  }, [API_URL]);

  // ✅ Compute Trends & Per Doctor Stats
  const { trends, perDoctor } = useMemo(() => {
    const doctorAppts = appointments || [];

    // Group by month
    const monthMap = {};
    for (const a of doctorAppts) {
      const d = new Date(a.date);
      const key = d.toLocaleString("default", { month: "short", year: "numeric" });
      if (!monthMap[key])
        monthMap[key] = { total: 0, completed: 0, cancelled: 0, scheduled: 0 };
      monthMap[key].total += 1;
      if (a.status === "Completed") monthMap[key].completed += 1;
      else if (a.status === "Cancelled") monthMap[key].cancelled += 1;
      else if (a.status === "Scheduled") monthMap[key].scheduled += 1;
    }

    const trends = Object.entries(monthMap).map(([month, stats]) => ({
      month,
      ...stats,
    }));

    // Group by doctor
    const docMap = {};
    for (const a of doctorAppts) {
      const doc = a.doctorName || "Unknown Doctor";
      if (!docMap[doc])
        docMap[doc] = { totalAppointments: 0, completed: 0, cancelled: 0, scheduled: 0 };
      docMap[doc].totalAppointments += 1;
      if (a.status === "Completed") docMap[doc].completed += 1;
      else if (a.status === "Cancelled") docMap[doc].cancelled += 1;
      else if (a.status === "Scheduled") docMap[doc].scheduled += 1;
    }

    const perDoctor = Object.entries(docMap).map(([doctor, stats]) => ({
      doctor,
      ...stats,
    }));

    return { trends, perDoctor };
  }, [appointments]);

  // ✅ Appointment Trends Chart
  const trendChartOptions = useMemo(() => {
    const months = trends.map((t) => t.month);
    return {
      chart: { type: "spline", backgroundColor: "transparent" },
      title: { text: "" },
      xAxis: { categories: months, labels: { style: { color: "#6b7280" } } },
      yAxis: {
        title: { text: "Appointments" },
        labels: { style: { color: "#6b7280" } },
      },
      tooltip: { shared: true },
      plotOptions: { spline: { marker: { enabled: true } } },
      series: [
        { name: "Total", data: trends.map((t) => t.total), color: "#3b82f6" },
        { name: "Completed", data: trends.map((t) => t.completed), color: "#10b981" },
        { name: "Cancelled", data: trends.map((t) => t.cancelled), color: "#ef4444" },
        { name: "Scheduled", data: trends.map((t) => t.scheduled), color: "#f59e0b" },
      ],
      legend: { itemStyle: { color: "#374151", fontWeight: "bold" } },
      credits: { enabled: false },
    };
  }, [trends]);

  // ✅ Per Doctor Chart
  const perDoctorChartOptions = useMemo(
    () => ({
      chart: { type: "column", backgroundColor: "transparent" },
      title: { text: "" },
      xAxis: {
        categories: perDoctor.map((d) => d.doctor),
        labels: { rotation: -25, style: { color: "#6b7280", fontSize: "11px" } },
      },
      yAxis: {
        title: { text: "Appointments" },
        labels: { style: { color: "#6b7280" } },
      },
      tooltip: { shared: true, borderRadius: 8 },
      plotOptions: { column: { borderRadius: 4, groupPadding: 0.08 } },
      series: [
        { name: "Total", data: perDoctor.map((d) => d.totalAppointments), color: "#3b82f6" },
        { name: "Completed", data: perDoctor.map((d) => d.completed), color: "#10b981" },
        { name: "Cancelled", data: perDoctor.map((d) => d.cancelled), color: "#ef4444" },
        { name: "Scheduled", data: perDoctor.map((d) => d.scheduled), color: "#f59e0b" },
      ],
      legend: { itemStyle: { color: "#374151", fontWeight: "bold" } },
      credits: { enabled: false },
    }),
    [perDoctor]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Appointments</h2>
          <p className="text-gray-500 mt-1">Schedule and manage appointments</p>
        </div>
        <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition">
          Schedule Appointment
        </button>
      </div>

      {/* 🔹 Loader / Error */}
      {loading.appointments ? (
        <Loader /> // 👈 Show spinner during loading
      ) : error.appointments ? (
        <LoadingError loading={loading.appointments} error={error.appointments} />
      ) : appointments?.length ? (
        <>
          {/* ✅ Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Appointment Trends</h3>
              <HighchartsReact highcharts={Highcharts} options={trendChartOptions} />
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Appointments per Doctor</h3>
              <HighchartsReact highcharts={Highcharts} options={perDoctorChartOptions} />
            </div>
          </div>

          {/* ✅ Appointment Table */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Patient</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Doctor</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Time</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr
                    key={a.appointment_id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 font-semibold text-gray-900">{a.patientName}</td>
                    <td className="px-6 py-4 text-gray-600">{a.doctorName}</td>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {new Date(a.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-900">{a.time}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                        {a.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          a.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : a.status === "Scheduled"
                            ? "bg-blue-100 text-blue-700"
                            : a.status === "Cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ✅ Appointment Management Section */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mt-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Appointment Management
              </h3>
              <button
                onClick={() => navigate("/schedule")}
                className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100"
              >
                Manage Schedule
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CardItem
                icon={<Users />}
                color="blue"
                title="Patients"
                desc="View and manage patients"
                linkText="Go to Patients →"
                onClick={() => navigate("/patients")}
              />
              <CardItem
                icon={<BookOpen />}
                color="purple"
                title="Reports"
                desc="Generate appointment reports"
                linkText="Generate Reports →"
                onClick={() => navigate("/reports")}
              />
            </div>
          </div>
        </>
      ) : (
        <p className="text-gray-500 text-center py-16">No appointments found</p>
      )}
    </div>
  );
}

// ✅ Reusable Card Component
function CardItem({ icon, color, title, desc, linkText, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center justify-center text-center bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition cursor-pointer"
    >
      <div className={`p-4 rounded-full mb-3 bg-${color}-100`}>{icon}</div>
      <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
      <p className="text-gray-500 mb-2 text-sm">{desc}</p>
      {linkText && (
        <span className="text-blue-600 font-semibold text-sm hover:underline">
          {linkText}
        </span>
      )}
    </div>
  );
}
