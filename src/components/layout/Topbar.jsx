import React from "react";
import { Search } from "lucide-react";

export default function Topbar() {
  return (
    <div className="bg-white shadow-md sticky top-0 z-40 border-b border-gray-200">
      <div className="px-8 py-5 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">
            Hospital Dashboard
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Real-time monitoring & management
          </p>
        </div>
          <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
              AD
            </div>
            <div className="text-xs">
              <p className="font-bold text-gray-900"> Admin </p>
              <p className="text-gray-500">Hospital Director</p>
            </div>
          </div>
      </div>
    </div>
  );
}
