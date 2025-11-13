import React, { useEffect, useState } from "react";
import axios from "axios";
import LoadingError from "../layout/LoadingError";
import Loader from "../layout/Loader"; // 👈 Added loader import

export default function VitalsTab() {
  const [vitalAlerts, setVitalAlerts] = useState([]);
  const [loading, setLoading] = useState({ vitals: false });
  const [error, setError] = useState({ vitals: null });

  // 🔹 For modal
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientAlerts, setPatientAlerts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [alertLoading, setAlertLoading] = useState(false);

  useEffect(() => {
    fetchVitals();
  }, []);

  const fetchVitals = async () => {
    try {
      setLoading({ vitals: true });
      const res = await axios.get("https://healthcare-backend-szmd.onrender.com/api/vitals");
      setVitalAlerts(res.data || []);
      setError({ vitals: null });
    } catch (err) {
      console.error("Error fetching vitals:", err);
      setError({ vitals: "Failed to fetch vitals data" });
    } finally {
      setLoading({ vitals: false });
    }
  };

  // 🔹 Fetch patient alerts when clicked
  const handleViewAlerts = async (patientId, patientName) => {
    try {
      setAlertLoading(true);
      setSelectedPatient(patientName);
      setShowModal(true);

      const res = await axios.get(
        `https://healthcare-backend-szmd.onrender.com/api/vitals/alerts/${patientId}`
      );
      setPatientAlerts(res.data || []);
    } catch (err) {
      console.error("Error fetching alerts:", err);
      setPatientAlerts([{ message: "Failed to load alerts" }]);
    } finally {
      setAlertLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-gray-900">
          Vital Signs & Alerts
        </h2>
        <p className="text-gray-500 mt-1">
          Real-time monitoring of critical patients
        </p>
      </div>

      {/* 🔹 Loader or Error State */}
      {loading.vitals ? (
        <Loader />
      ) : error.vitals ? (
        <LoadingError loading={loading.vitals} error={error.vitals} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Patient vitals */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Patient Vitals
            </h3>

            {vitalAlerts?.length ? (
              <div className="space-y-4">
                {vitalAlerts.map((v) => (
                  <div
                    key={v.patientId}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <p className="font-bold text-gray-900">{v.patientName}</p>
                    <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                      <div>
                        <span className="text-gray-500">BP:</span>
                        <span className="ml-2 font-semibold">
                          {v.bloodPressure || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">HR:</span>
                        <span className="ml-2 font-semibold">
                          {v.heartRate || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Temp:</span>
                        <span className="ml-2 font-semibold">
                          {v.temperature || "N/A"}°C
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">SpO₂:</span>
                        <span className="ml-2 font-semibold">
                          {v.oxygenSaturation || "N/A"}%
                        </span>
                      </div>
                    </div>

                    {v.activeAlerts > 0 && (
                      <div className="mt-3">
                        <button
                          onClick={() =>
                            handleViewAlerts(v.patientId, v.patientName)
                          }
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold hover:bg-red-200 transition"
                        >
                          {v.activeAlerts} Active Alerts
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No vital signs data
              </p>
            )}
          </div>

          {/* Right: Summary */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Alert Summary
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-600 font-bold">Critical Alerts</p>
                <p className="text-3xl font-bold text-red-700">
                  {vitalAlerts?.filter((v) => v.activeAlerts > 0)?.length || 0}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-600 font-bold">Stable Patients</p>
                <p className="text-3xl font-bold text-green-700">
                  {vitalAlerts?.filter((v) => !v.activeAlerts)?.length || 0}
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-600 font-bold">Total Monitored</p>
                <p className="text-3xl font-bold text-blue-700">
                  {vitalAlerts?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Alert Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Alerts for {selectedPatient}
            </h3>

            {alertLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader /> {/* 👈 Added loader in modal */}
              </div>
            ) : patientAlerts.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {patientAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${
                      alert.severity === "critical"
                        ? "border-red-300 bg-red-50"
                        : "border-yellow-200 bg-yellow-50"
                    }`}
                  >
                    <p className="font-semibold text-gray-900">
                      {alert.type || "Alert"}
                    </p>
                    <p className="text-sm text-gray-700">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Date: {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">No alerts found</p>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
