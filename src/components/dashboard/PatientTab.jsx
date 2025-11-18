import React, { useState, useEffect } from "react";
import LoadingError from "../layout/LoadingError";
import PatientRow from "../shared/PatientRow";
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

  // ====================== FETCH PATIENTS ======================
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError(null);

        let endpoint = `${API_URL}/api/patients`;

        if (filter === "active") {
          endpoint = `${API_URL}/api/patients/active`;
        } else if (filter !== "all") {
          endpoint = `${API_URL}/api/patients/status/${filter}`;
        }

        const response = await axios.get(endpoint);

        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];

        setPatients(data);
      } catch (err) {
        console.error("❌ Error fetching patients:", err.message);
        setError("Failed to load patient data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [filter, API_URL]);

  // ====================== UNIVERSAL SEARCH ======================
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

  // =========================== UI ===========================
  return (
    <div className="space-y-6">

      {/* ========== HEADER SECTION ========== */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Patient Management</h2>
          <p className="text-gray-500 mt-1">View and manage all patient records</p>
        </div>

        {/* Search + Filter + Button */}
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">

          {/* Search */}
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl text-sm w-full sm:w-64"
          />

          {/* Filter */}
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

          {/* Add New */}
          <button
            onClick={() => alert("Add New Patient Form Coming Soon!")}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition w-full sm:w-auto"
          >
            + New Patient
          </button>
        </div>
      </div>

      {/* ========== LOADING / ERROR ========== */}
      {loading ? (
        <Loader />
      ) : error ? (
        <LoadingError loading={loading} error={error} />

      ) : filteredPatients.length > 0 ? (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">

          {/* TABLE SCROLL WRAPPER */}
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
      ) : (
        <p className="text-gray-500 text-center py-16">No patients found</p>
      )}
    </div>
  );
}
