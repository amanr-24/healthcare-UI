// src/components/layout/Sidebar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Heart,
  Users,
  Calendar,
  Activity,
  Package,
  DollarSign,
} from "lucide-react";

export default function Sidebar({
  items,
  active,
  onSelect,
  open = true,
  setOpen = () => {},
}) {
  const navigate = useNavigate();

  // Default menu items (id values map to routes: /overview, /departments, etc.)
  const menuItems =
    items && Array.isArray(items)
      ? items
      : [
          { id: "overview", label: "Overview", icon: BarChart3 },
          { id: "patients", label: "Patients", icon: Users },
          { id: "appointments", label: "Appointments", icon: Calendar },
          { id: "departments", label: "Departments", icon: Package },
          { id: "staff", label: "Staff", icon: Heart },
          { id: "vitals", label: "Vitals", icon: Activity },
          { id: "financials", label: "Financials", icon: DollarSign },
        ];

  // helper to handle clicks: update parent active state AND navigate
  const handleClick = (item) => {
    // 1) call parent's onSelect so active styling updates
    onSelect && onSelect(item.id);

    // 2) navigate to route. Adjust if your route names differ.
    navigate(`/${item.id}`);
  };

  return (
    <div
      className={`fixed top-0 left-0 z-50 h-screen bg-slate-900 text-white shadow-lg transition-all duration-300 ${
        open ? "w-72" : "w-20"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700 relative">
        {open && <h1 className="font-bold text-xl">HealthCare</h1>}

        {/* toggle button - visible even when collapsed */}
        <button
          onClick={() => setOpen(!open)}
          className="absolute -right-3 top-4 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition"
          aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
        >
          {/* simple hamburger */}
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {/* Menu */}
      <div className="mt-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;

          return (
            <div
              key={item.id}
              onClick={() => handleClick(item)}
              className={`flex items-center cursor-pointer px-4 py-3 rounded-lg mx-2 text-sm transition-all select-none ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleClick(item);
              }}
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
