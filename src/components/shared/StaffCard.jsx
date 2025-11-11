import React from "react";

export default function StaffCard({ member }) {
  const initials =
    member?.fullName?.split(" ").map((n) => n[0]).join("").substring(0, 2) || "S";
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
            {initials}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{member.fullName}</h3>
            <p className="text-xs text-gray-500">{member.specialty || member.role}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1 bg-yellow-100 px-2 py-1 rounded-full">
          <span className="text-yellow-600 font-bold text-sm">{member.rating || "4.5"}</span>
          <span className="text-yellow-600">★</span>
        </div>
      </div>
      <div className="space-y-3 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">{member.role}</span>
          <span className="font-semibold text-gray-900">{member.department}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Experience</span>
          <span className="font-semibold text-gray-900">{member.experience || 0} years</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Current Patients</span>
          <span className="font-semibold text-gray-900">{member.patients || 0}</span>
        </div>
      </div>
      <div className="pt-4 border-t border-gray-100 text-xs text-gray-600 flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${member.status === "On Duty" ? "bg-green-500" : "bg-gray-400"}`} />
        <span>{member.status}</span>
        <span className="text-gray-400">•</span>
        <span>{member.shift || "Day Shift"}</span>
      </div>
    </div>
  );
}
