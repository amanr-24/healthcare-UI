import React from "react";
import { Bell, Download, Search } from "lucide-react";

export default function Topbar() {
  return (
    <div className="bg-white shadow-md sticky top-0 z-40 border-b border-gray-200">
      <div className="px-8 py-5 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Hospital Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Real-time monitoring & management</p>
        </div>
        <div className="flex items-center space-x-6">
          <div className="hidden md:flex items-center space-x-3 bg-gray-100 px-4 py-2 rounded-lg">
            <Search size={16} className="text-gray-500" />
            <input type="text" placeholder="Search patients, doctors..." className="bg-transparent outline-none text-sm text-gray-700 w-64" />
          </div>
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
            <Download size={18} />
          </button>
          <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
              AD
            </div>
            <div className="text-xs">
              <p className="font-bold text-gray-900">Dr. Admin</p>
              <p className="text-gray-500">Hospital Director</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
