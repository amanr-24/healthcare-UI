import React from "react";

export default function PatientRow({ patient }) {
  const initials =
    patient?.fullName?.split(" ").map((n) => n[0]).join("").substring(0, 2) || "P";
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition">
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
            {initials}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{patient.fullName}</p>
            <p className="text-xs text-gray-500">ID: {patient.id}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {patient.age}y, {patient.gender}
      </td>
      <td className="px-6 py-4">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
          {patient.department}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{patient.doctor}</td>
      <td className="px-6 py-4">
        {patient.vitals && (
          <div className="flex flex-col space-y-1 text-xs">
            <p><span className="text-gray-500">BP:</span> {patient.vitals.bloodPressure || "N/A"}</p>
            <p><span className="text-gray-500">HR:</span> {patient.vitals.heartRate || "N/A"}</p>
            <p><span className="text-gray-500">Temp:</span> {patient.vitals.temperature || "N/A"}°C</p>
          </div>
        )}
      </td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          patient.severity === "Critical" ? "bg-red-100 text-red-700" :
          patient.severity === "Stable" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
        }`}>
          {patient.severity}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          patient.status === "Admitted" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
        }`}>
          {patient.status}
        </span>
      </td>
    </tr>
  );
}
