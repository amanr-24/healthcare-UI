import React, { useEffect, useState } from "react";
import axios from "axios";
import LoadingError from "../layout/LoadingError";
import Loader from "../layout/Loader";
import { Plus } from "lucide-react";

export default function InventoryTab() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inventory, setInventory] = useState({});

  // 🔹 Fetch Inventory Data
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          "https://healthcare-backend-szmd.onrender.com/api/inventory"
        );
        setInventory(res.data.data); // backend returns { data: { medical_supplies, equipment } }
      } catch (err) {
        setError(err.message || "Failed to load inventory");
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">
            Inventory Management
          </h2>
          <p className="text-gray-500 mt-1">
            Medical supplies and equipment tracking
          </p>
        </div>
        <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition flex items-center space-x-2">
          <Plus size={18} /> <span>Add Item</span>
        </button>
      </div>

      {/* 🔹 Loader / Error */}
      {loading ? (
        <Loader />
      ) : error ? (
        <LoadingError loading={loading} error={error} />
      ) : inventory.medical_supplies || inventory.equipment ? (
        <div className="space-y-6">
          {/* Medical Supplies */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Medical Supplies
            </h3>
            {inventory.medical_supplies?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                        Current Stock
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                        Minimum
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                        Unit Cost
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.medical_supplies.map((i, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {i.item}
                        </td>
                        <td className="px-6 py-4 text-gray-900">{i.current}</td>
                        <td className="px-6 py-4 text-gray-600">{i.minimum}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              i.status === "Good"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {i.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-900 font-semibold">
                          ₹{i.cost}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No supplies data available
              </p>
            )}
          </div>

          {/* Equipment */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Equipment</h3>
            {inventory.equipment?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                        Equipment
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                        Last Maintenance
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                        Next Maintenance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.equipment.map((i, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {i.equipment}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              i.status === "Operational"
                                ? "bg-green-100 text-green-700"
                                : i.status === "Under Maintenance"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {i.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {i.lastMaintenance
                            ? new Date(i.lastMaintenance).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-gray-900 font-semibold">
                          {i.nextMaintenance
                            ? new Date(i.nextMaintenance).toLocaleDateString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No equipment data available
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-16">
          No inventory data available
        </p>
      )}
    </div>
  );
}
