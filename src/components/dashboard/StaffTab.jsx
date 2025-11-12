import React, { useState, useEffect } from "react";
import LoadingError from "../layout/LoadingError";
import StaffCard from "../shared/StaffCard";
import { Plus } from "lucide-react";
import axios from "axios";
import Loader from "../layout/Loader"; // 👈 Added Loader import

export default function StaffTab() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:47815/api/staff");
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
        <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition flex items-center space-x-2">
          <Plus size={18} /> <span>Add Staff Member</span>
        </button>
      </div>

      {/* 🔹 Loader or Error */}
      {loading ? (
        <Loader /> // 👈 show spinner while fetching
      ) : error ? (
        <LoadingError loading={loading} error={error} />
      ) : staff?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((m) => (
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
