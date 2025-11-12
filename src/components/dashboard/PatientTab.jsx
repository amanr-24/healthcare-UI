import React, { useState, useEffect } from "react";
import LoadingError from "../layout/LoadingError";
import PatientRow from "../shared/PatientRow";
import axios from "axios";

export default function PatientTab() {
  const [patients, setPatients] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:47815";

  // ✅ Fetch patients based on selected filter
  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      setError(null);

      try {
        let endpoint = `${API_URL}/api/patients`;

        // 🧠 Determine which API endpoint to hit based on filter
        if (filter === "active") {
          endpoint = `${API_URL}/api/patients/active`;
        } else if (filter !== "all") {
          // for status-based filters (in-treatment, scheduled, etc.)
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

  return (
    <div className="space-y-6">
      {/* ✅ Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">
            Patient Management
          </h2>
          <p className="text-gray-500 mt-1">
            View and manage all patient records
          </p>
        </div>

        {/* ✅ Filter Dropdown and Add Button */}
        <div className="flex space-x-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-blue-500"
          >
            {/* 🧠 Dropdown Options */}
            <option value="all">All Patients</option>
            <option value="in treatment">In Treatment</option>
            <option value="scheduled">Scheduled</option>
            <option value="critical">Critical</option>
            <option value="discharged">Discharged</option>
          </select>

          <button
            onClick={() => alert("Add New Patient Form Coming Soon!")}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition"
          >
            + New Patient
          </button>
        </div>
      </div>

      {/* ✅ Loading / Error */}
      <LoadingError loading={loading} error={error} />

      {/* ✅ Patient Table */}
      {!loading && !error && (
        <>
          {patients.length > 0 ? (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <table className="w-full text-sm text-left text-gray-700">
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
                  {patients.map((patient) => (
                    <PatientRow
                      key={patient.id || patient._id}
                      patient={patient}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-16">
              No patients found
            </p>
          )}
        </>
      )}
    </div>
  );
}
