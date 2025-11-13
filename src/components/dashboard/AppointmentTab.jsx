import React, { useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import LoadingError from "../layout/LoadingError";
import Loader from "../layout/Loader";
import axios from "axios";

export default function AppointmentTab() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [doctorFilter, setDoctorFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [customRange, setCustomRange] = useState({ from: "", to: "" });

  const [loading, setLoading] = useState({ appointments: false });
  const [error, setError] = useState({ appointments: null });

  const API_URL = import.meta.env.VITE_API_URL || "https://healthcare-backend-szmd.onrender.com";

  // Fetch Appointments
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
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError({ appointments: "Failed to load appointments data." });
      } finally {
        setLoading({ appointments: false });
      }
    };

    fetchAppointments();
  }, [API_URL]);

  // FILTER LOGIC
  const filteredAppointments = useMemo(() => {
    let data = [...appointments];

    if (statusFilter !== "All") {
      data = data.filter((a) => a.status === statusFilter);
    }

    if (doctorFilter !== "All") {
      data = data.filter((a) => a.doctorName === doctorFilter);
    }

    if (dateFilter !== "All") {
      const today = new Date();

      data = data.filter((a) => {
        const d = new Date(a.date);

        if (dateFilter === "Today") return d.toDateString() === today.toDateString();

        if (dateFilter === "Week") {
          const start = new Date();
          start.setDate(today.getDate() - today.getDay());
          const end = new Date();
          end.setDate(start.getDate() + 6);
          return d >= start && d <= end;
        }

        if (dateFilter === "Month") {
          return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
        }

        if (dateFilter === "Range") {
          const from = new Date(customRange.from);
          const to = new Date(customRange.to);
          return d >= from && d <= to;
        }

        return true;
      });
    }

    const s = search.toLowerCase();
    return data.filter((a) => JSON.stringify(a).toLowerCase().includes(s));
  }, [appointments, statusFilter, doctorFilter, dateFilter, customRange, search]);

  // CHART DATA
  const { trends, perDoctor } = useMemo(() => {
    const doctorAppts = filteredAppointments;

    const monthMap = {};
    for (const a of doctorAppts) {
      const d = new Date(a.date);
      const key = d.toLocaleString("default", { month: "short", year: "numeric" });

      if (!monthMap[key])
        monthMap[key] = { total: 0, completed: 0, cancelled: 0, scheduled: 0 };

      monthMap[key].total++;
      if (a.status === "Completed") monthMap[key].completed++;
      else if (a.status === "Cancelled") monthMap[key].cancelled++;
      else if (a.status === "Scheduled") monthMap[key].scheduled++;
    }

    const trends = Object.entries(monthMap).map(([month, stats]) => ({
      month,
      ...stats,
    }));

    const docMap = {};
    for (const a of doctorAppts) {
      const doc = a.doctorName || "Unknown";

      if (!docMap[doc])
        docMap[doc] = {
          totalAppointments: 0,
          completed: 0,
          cancelled: 0,
          scheduled: 0,
        };

      docMap[doc].totalAppointments++;
      if (a.status === "Completed") docMap[doc].completed++;
      else if (a.status === "Cancelled") docMap[doc].cancelled++;
      else if (a.status === "Scheduled") docMap[doc].scheduled++;
    }

    const perDoctor = Object.entries(docMap).map(([doctor, stats]) => ({
      doctor,
      ...stats,
    }));

    return { trends, perDoctor };
  }, [filteredAppointments]);

  const trendChartOptions = {
    chart: { type: "spline", backgroundColor: "transparent" },
    title: { text: "" },
    xAxis: { categories: trends.map((t) => t.month) },
    yAxis: { title: { text: "Appointments" } },
    series: [
      { name: "Total", data: trends.map((t) => t.total) },
      { name: "Completed", data: trends.map((t) => t.completed) },
      { name: "Cancelled", data: trends.map((t) => t.cancelled) },
      { name: "Scheduled", data: trends.map((t) => t.scheduled) },
    ],
    credits: { enabled: false },
  };

  const perDoctorChartOptions = {
    chart: { type: "column", backgroundColor: "transparent" },
    title: { text: "" },
    xAxis: {
      categories: perDoctor.map((d) => d.doctor),
      labels: { rotation: -25, style: { fontSize: "11px" } },
    },
    yAxis: { title: { text: "Appointments" } },
    series: [
      { name: "Total", data: perDoctor.map((d) => d.totalAppointments) },
      { name: "Completed", data: perDoctor.map((d) => d.completed) },
      { name: "Cancelled", data: perDoctor.map((d) => d.cancelled) },
      { name: "Scheduled", data: perDoctor.map((d) => d.scheduled) },
    ],
    credits: { enabled: false },
  };

  // ======================= UI ============================
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between w-full">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Appointments</h2>
          <p className="text-gray-500 mt-1">Schedule and manage appointments</p>
        </div>

        {/* SEARCH + BUTTON */}
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search appointments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl text-sm w-64"
          />

          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-sm transition">
            Schedule Appointment
          </button>
        </div>
      </div>

      {/* ===== APPLE STYLE FILTER BAR ===== */}
      <div className="flex justify-end w-full">
        <div className="flex flex-wrap items-center gap-3 bg-gray-100 p-3 rounded-2xl shadow-sm border border-gray-200">

          {/* Status Filter */}
          <select
            className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm shadow-sm 
                       focus:ring-2 focus:ring-blue-400 outline-none transition"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Doctor Filter */}
          <select
            className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm shadow-sm 
                       focus:ring-2 focus:ring-blue-400 outline-none transition"
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
          >
            <option value="All">All Doctors</option>
            {Array.from(new Set(appointments.map((a) => a.doctorName))).map(
              (doc) => (
                <option key={doc} value={doc}>
                  {doc}
                </option>
              )
            )}
          </select>

          {/* Date Filter */}
          <select
            className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm shadow-sm 
                       focus:ring-2 focus:ring-blue-400 outline-none transition"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="All">All Dates</option>
            <option value="Today">Today</option>
            <option value="Week">This Week</option>
            <option value="Month">This Month</option>
            <option value="Range">Custom Range</option>
          </select>

          {/* Custom Range */}
          {dateFilter === "Range" && (
            <>
              <input
                type="date"
                className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm shadow-sm 
                           focus:ring-2 focus:ring-blue-400 outline-none transition"
                value={customRange.from}
                onChange={(e) =>
                  setCustomRange({ ...customRange, from: e.target.value })
                }
              />

              <input
                type="date"
                className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm shadow-sm 
                           focus:ring-2 focus:ring-blue-400 outline-none transition"
                value={customRange.to}
                onChange={(e) =>
                  setCustomRange({ ...customRange, to: e.target.value })
                }
              />
            </>
          )}

        </div>
      </div>

      {/* DATA */}
      {loading.appointments ? (
        <Loader />
      ) : error.appointments ? (
        <LoadingError error={error.appointments} />
      ) : filteredAppointments.length ? (
        <>
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 border">
              <h3 className="text-xl font-bold mb-6">Appointment Trends</h3>
              <HighchartsReact highcharts={Highcharts} options={trendChartOptions} />
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border">
              <h3 className="text-xl font-bold mb-6">Appointments per Doctor</h3>
              <HighchartsReact highcharts={Highcharts} options={perDoctorChartOptions} />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-md border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold">Patient</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Doctor</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Time</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((a) => (
                  <tr key={a.appointment_id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold">{a.patientName}</td>
                    <td className="px-6 py-4">{a.doctorName}</td>
                    <td className="px-6 py-4">{new Date(a.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{a.time}</td>
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
        </>
      ) : (
        <p className="text-gray-500 text-center py-16">No appointments found</p>
      )}
    </div>
  );
}
