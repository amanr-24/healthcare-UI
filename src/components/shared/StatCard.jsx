import React from "react";
import { TrendingUp } from "lucide-react";

export default function StatCard({ label, value, trend, trendUp, icon: Icon, color = "from-blue-600 to-blue-400" }) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium mb-1">{label}</p>
          <p className="text-4xl font-bold text-gray-900 mb-3">{value ?? 0}</p>
          {trend && (
            <div className={`inline-flex items-center space-x-1 text-sm font-semibold ${trendUp ? "text-emerald-600" : "text-red-600"}`}>
              <TrendingUp size={14} />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className={`bg-gradient-to-br ${color} p-4 rounded-xl shadow-lg`}>
          <Icon className="text-white" size={28} />
        </div>
      </div>
    </div>
  );
}
