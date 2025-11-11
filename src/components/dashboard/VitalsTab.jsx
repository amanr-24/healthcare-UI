import React from "react";
import LoadingError from "../layout/LoadingError";

export default function VitalsTab({ loading, error, vitalAlerts }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-gray-900">Vital Signs & Alerts</h2>
        <p className="text-gray-500 mt-1">Real-time monitoring of critical patients</p>
      </div>

      <LoadingError loading={loading.vitals} error={error.vitals} />
      {!loading.vitals && !error.vitals && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Patient Vitals</h3>
            {vitalAlerts?.length ? (
              <div className="space-y-4">
                {vitalAlerts.map((v) => (
                  <div key={v.patientId || v.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{v.patientName}</p>
                        <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                          <div><span className="text-gray-500">BP:</span><span className="ml-2 font-semibold">{v.bloodPressure || "N/A"}</span></div>
                          <div><span className="text-gray-500">HR:</span><span className="ml-2 font-semibold">{v.heartRate || "N/A"}</span></div>
                          <div><span className="text-gray-500">Temp:</span><span className="ml-2 font-semibold">{v.temperature || "N/A"}°C</span></div>
                          <div><span className="text-gray-500">SpO₂:</span><span className="ml-2 font-semibold">{v.oxygenSaturation || "N/A"}%</span></div>
                        </div>
                        {v.activeAlerts > 0 && (
                          <div className="mt-3">
                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                              {v.activeAlerts} Active Alerts
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-500 text-center py-8">No vital signs data</p>}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Alert Summary</h3>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-600 font-bold">Critical Alerts</p>
                <p className="text-3xl font-bold text-red-700">{vitalAlerts.filter((v) => v.activeAlerts > 0).length}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-600 font-bold">Stable Patients</p>
                <p className="text-3xl font-bold text-green-700">{vitalAlerts.filter((v) => !v.activeAlerts).length}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-600 font-bold">Total Monitored</p>
                <p className="text-3xl font-bold text-blue-700">{vitalAlerts.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
