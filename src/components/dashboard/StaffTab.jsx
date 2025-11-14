import React, { useState, useEffect, useMemo } from "react";
import LoadingError from "../layout/LoadingError";
import StaffCard from "../shared/StaffCard";
import { Plus } from "lucide-react";
import axios from "axios";
import Loader from "../layout/Loader";

export default function StaffTab() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔍 Search
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          "https://healthcare-backend-szmd.onrender.com/api/staffs"
        );
        setStaff(res.data);
        setError(null);
      } catch (err) {
        console.error("❌ Error fetching staff:", err);
        setError(err.message || "Failed to load staff data");
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  // 🔍 FILTERED STAFF LIST
  const filteredStaff = useMemo(() => {
    const s = search.toLowerCase();
    return staff.filter((m) => JSON.stringify(m).toLowerCase().includes(s));
  }, [search, staff]);

  return (
    <div className="space-y-6">
      {/* 🔹 Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">
            Medical Staff Directory
          </h2>
          <p className="text-gray-500 mt-1">
            Manage doctors, nurses, and support staff
          </p>
        </div>

        {/* 🔍 Search + Add Button */}
        <div className="flex items-center gap-4">
          {/* Search Box */}
          <input
            type="text"
            placeholder="Search staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl text-sm w-64"
          />

          {/* Add Staff Button */}
          <button
            onClick={() => alert("This feature is under development…")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition flex items-center space-x-2"
          >
            <Plus size={18} /> <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* 🔹 Loader or Error */}
      {loading ? (
        <Loader />
      ) : error ? (
        <LoadingError loading={loading} error={error} />
      ) : filteredStaff?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((m) => (
            <StaffCard key={m.id} member={m} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-16">
          No staff members found
        </p>
      )}
    </div>
  );
}
