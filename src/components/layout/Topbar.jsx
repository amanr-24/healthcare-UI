import React from "react";
import { Menu } from "lucide-react";

export default function Topbar({ toggleSidebar }) {
  return (
    <div className="w-full bg-white border-b px-4 py-3 flex flex-wrap items-center justify-between gap-3">
      
      {/* LEFT SIDE: Title + Subtitle */}
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-black text-gray-900 truncate">
          Dashboard
        </h1>
        <p className="text-gray-500 text-sm truncate">
          Real-time monitoring & management
        </p>
      </div>

      {/* MOBILE MENU BUTTON */}
      <button
        className="md:hidden p-2 rounded-lg bg-gray-100"
        onClick={toggleSidebar}
      >
        <Menu size={20} />
      </button>

      {/* RIGHT SIDE: USER PROFILE */}
      <div className="flex items-center gap-3 bg-white shadow-md px-3 py-2 rounded-xl min-w-fit">
        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
          AD
        </div>

        <div className="min-w-0">
          <p className="font-semibold truncate text-gray-900">Admin</p>
          <p className="text-xs text-gray-500 truncate">Hospital Director</p>
        </div>
      </div>
    </div>
  );
}
