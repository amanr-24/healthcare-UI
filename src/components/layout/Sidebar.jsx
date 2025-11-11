import React from "react";
import {
  BarChart3,
  Heart,
  Users,
  Calendar,
  Activity,
  Package,
  DollarSign,
} from "lucide-react";

export default function Sidebar({ items, active, onSelect, open, setOpen }) {
  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-slate-900 text-white shadow-lg transition-all duration-300 ${
        open ? "w-72" : "w-20"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {open && <h1 className="font-bold text-xl">HealthCare</h1>}
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded hover:bg-slate-700"
        >
          ☰
        </button>
      </div>

      {/* Menu */}
      <div className="mt-6 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <div
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`flex items-center cursor-pointer px-4 py-3 rounded-lg mx-2 text-sm transition-all ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={20} className="mr-3" />
              {open && <span>{item.label}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
