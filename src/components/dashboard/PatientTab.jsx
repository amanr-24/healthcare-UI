import React, { useState, useEffect } from "react";
import LoadingError from "../layout/LoadingError";
import PatientRow from "../shared/PatientRow"; // used by table rows; keep as-is
import axios from "axios";
import Loader from "../layout/Loader";

export default function PatientTab() {
  const [patients, setPatients] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://healthcare-backend-szmd.onrender.com";

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError(null);

        let endpoint = `${API_URL}/api/patients`;
        if (filter === "active") endpoint = `${API_URL}/api/patients/active`;
        else if (filter !== "all") endpoint = `${API_URL}/api/patients/status/${filter}`;

        const response = await axios.get(endpoint);
        const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
        setPatients(data);
      } catch (err) {
        console.error("Error fetching patients:", err);
        setError("Failed to load patient data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [filter, API_URL]);

  // search
  const filteredPatients = patients.filter((p) => {
    const s = searchTerm.toLowerCase();
    return (
      p.name?.toLowerCase().includes(s) ||
      p.fullName?.toLowerCase().includes(s) ||
      p.patientName?.toLowerCase().includes(s) ||
      p.firstName?.toLowerCase().includes(s) ||
      p.lastName?.toLowerCase().includes(s) ||
      p.phone?.toString().toLowerCase().includes(s) ||
      p.email?.toLowerCase().includes(s) ||
      p.id?.toString().includes(s) ||
      JSON.stringify(p).toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-3xl font-black text-gray-900">Patient Management</h2>
          <p className="text-gray-500 mt-1">View and manage all patient records</p>
        </div>

        {/* actions */}
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl text-sm w-full sm:w-64"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl text-sm w-full sm:w-auto"
          >
            <option value="all">All Patients</option>
            <option value="active">Active</option>
            <option value="in treatment">In Treatment</option>
            <option value="scheduled">Scheduled</option>
            <option value="critical">Critical</option>
            <option value="discharged">Discharged</option>
          </select>

          <button
            onClick={() => alert("Add New Patient Form Coming Soon!")}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition w-full sm:w-auto"
          >
            + New Patient
          </button>
        </div>
      </div>

      {/* Loading / Error */}
      {loading ? (
        <Loader />
      ) : error ? (
        <LoadingError loading={loading} error={error} />
      ) : filteredPatients.length === 0 ? (
        <p className="text-gray-500 text-center py-16">No patients found</p>
      ) : (
        <>
          {/* TABLE view for md+ */}
          <div className="hidden md:block bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-max text-sm text-left text-gray-700">
                <thead className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                  <tr>
                    <th className="px-6 py-4 font-bold">Patient</th>
                    <th className="px-6 py-4 font-bold">Details</th>
                    <th className="px-6 py-4 font-bold">Department</th>
                    <th className="px-6 py-4 font-bold">Doctor</th>
                    <th className="px-6 py-4 font-bold">Vitals</th>
                    <th className="px-6 py-4 font-bold">Severity</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPatients.map((patient) => (
                    <PatientRow key={patient.id || patient._id} patient={patient} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE LIST view for small devices */}
<div className="block md:hidden space-y-4">
  {filteredPatients.map((p) => (
    <article
      key={p.id || p._id}
      className="bg-white rounded-xl shadow-md border border-gray-100 p-4"
    >
      <div className="flex items-start gap-4">

        {/* Avatar or initials */}
        <div className="flex-shrink-0">
          {p.avatar ? (
            <img
              src={p.avatar}
              alt={p.name || p.patientName}
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-bold">
              {((p.name || p.patientName || "")
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("") || "NA")}
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex-1 min-w-0">

          {/* Name + ID + Age/Gender */}
          <div className="flex justify-between flex-wrap">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-base break-words">
                {p.name ||
                  p.patientName ||
                  `${p.firstName || ""} ${p.lastName || ""}`}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                ID: {p.id || p._id || "N/A"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                {p.age ? `${p.age}y` : ""} {p.gender ? `, ${p.gender}` : ""}
              </p>
              <p className="text-xs text-blue-600 font-medium mt-0.5">
                {p.status || "N/A"}
              </p>
            </div>
          </div>

          {/* Badges Section */}
          <div className="mt-3 flex flex-wrap gap-2">

            {p.department && (
              <span className="px-3 py-1 bg-gray-100 border rounded-full text-xs font-medium text-gray-700">
                {p.department}
              </span>
            )}

            {p.doctor && (
              <span className="px-3 py-1 bg-gray-100 border rounded-full text-xs font-medium text-gray-700">
                Dr. {p.doctor}
              </span>
            )}

            {/* HR badge */}
            {p.vitals?.heartRate && (
              <span className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs font-semibold text-blue-700">
                HR: {p.vitals.heartRate}
              </span>
            )}

          </div>
        </div>
      </div>
    </article>
  ))}
</div>

        </>
      )}
    </div>
  );
}

/* ---------- small helpers ---------- */
function capitalize(s) {
  if (!s) return "";
  return ("" + s).charAt(0).toUpperCase() + ("" + s).slice(1);
}

function calculateAge(dob) {
  try {
    const birth = new Date(dob);
    const diff = Date.now() - birth.getTime();
    const ageDt = new Date(diff);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  } catch {
    return "";
  }
}
