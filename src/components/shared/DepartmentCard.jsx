import React from "react";

export default function DepartmentCard({ dept, onClick }) {
  const occ = Math.min(dept.current_occupancy || 0, 100);
  return (
    <div
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border border-gray-100 cursor-pointer hover:border-blue-300"
      onClick={() => onClick?.(dept.name)}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">{dept.name}</h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            (dept.total_patients || 0) > 50 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}
        >
          {dept.total_patients || 0} Patients
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Capacity</p>
          <p className="text-2xl font-bold text-gray-900">{dept.capacity ?? 0}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Occupancy</p>
          <p className="text-2xl font-bold text-blue-600">{dept.current_occupancy ?? 0}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Staff</p>
          <p className="text-xl font-bold text-gray-900">{dept.total_staff ?? 0}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Head</p>
          <p className="text-xs font-bold text-gray-900 truncate">{dept.department_head || "N/A"}</p>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-600">Capacity Usage</span>
          <span className="text-sm font-bold text-gray-900">{occ}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{ width: `${occ}%` }}></div>
        </div>
      </div>
    </div>
  );
}
