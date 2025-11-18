import React, { useMemo, useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import axios from "axios";
import Loader from "../layout/Loader";

export default function FinancialTab() {
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [financialData, setFinancialData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🌐 Backend API base URL
  const API_BASE = "https://healthcare-backend-szmd.onrender.com/api/financials";

  // ✅ Fetch all available years
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const res = await axios.get(`${API_BASE}/years`);
        const years = res.data.years || [];
        setAvailableYears(years);
        if (years.length > 0) setSelectedYear(years[0]); // select latest year automatically
      } catch (err) {
        console.error("Error fetching years:", err);
        setError("Failed to load available years");
      }
    };
    fetchYears();
  }, []);

  // ✅ Fetch financial data when selectedYear changes
  useEffect(() => {
    if (!selectedYear) return;

    const fetchFinancialData = async () => {
      try {
        setLoading(true);
        setError("");

        // 🔹 Month summary
        const monthRes = await axios.get(
          `${API_BASE}/summary/month/${selectedYear}`
        );
        setFinancialData(monthRes.data.data || []);

        // 🔹 Yearly summary (for stat cards)
        const summaryRes = await axios.get(
          `${API_BASE}/summary/year/${selectedYear}`
        );
        setSummary(summaryRes.data.data);
      } catch (err) {
        console.error("Error fetching financial data:", err);
        setError(
          err.response?.data?.message || "Failed to fetch financial data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, [selectedYear]);

  // ✅ Prepare chart data
  const chartData = useMemo(() => {
    if (!Array.isArray(financialData) || financialData.length === 0) return [];

    return financialData.map((item, index) => {
      const monthLabel =
        typeof item.month_name === "string"
          ? item.month_name.slice(0, 3)
          : `M${index + 1}`; // fallback if month_name is null

      return {
        month: monthLabel,
        revenue: (item.total_revenue || 0) / 100000,
        expenses: (item.total_expenses || 0) / 100000,
      };
    });
  }, [financialData]);

  // ✅ Utility functions
  const formatCr = (val) => `₹${(val / 1e7).toFixed(2)}Cr`;
  const totalRevenue = summary?.total_revenue || 0;
  const totalExpenses = summary?.total_expenses || 0;
  const netProfit = summary?.total_profit || totalRevenue - totalExpenses;
  const profitMargin = totalRevenue
    ? ((netProfit / totalRevenue) * 100).toFixed(2)
    : 0;

  // ✅ Highcharts Configuration
  const financialChartOptions = useMemo(
    () => ({
      chart: { type: "area", backgroundColor: "transparent" },
      accessibility: { enabled: false },
      title: { text: "" },
      xAxis: {
        categories: chartData.map((d) => d.month),
        tickmarkPlacement: "on",
        title: { enabled: false },
        labels: { style: { color: "#6b7280" } },
      },
      yAxis: {
        title: { text: "Amount (Lakhs)" },
        labels: { style: { color: "#6b7280" } },
      },
      tooltip: {
        shared: true,
        valuePrefix: "₹",
        valueSuffix: " L",
        backgroundColor: "#fff",
        borderRadius: 8,
        borderColor: "#e5e7eb",
      },
      legend: { itemStyle: { color: "#374151", fontWeight: "bold" } },
      credits: { enabled: false },
      plotOptions: {
        area: {
          fillOpacity: 0.25,
          marker: { enabled: true, radius: 3 },
        },
      },
      series: [
        {
          name: "Revenue",
          data: chartData.map((d) => d.revenue),
          color: "#3b82f6",
        },
        {
          name: "Expenses",
          data: chartData.map((d) => d.expenses),
          color: "#ef4444",
        },
      ],
    }),
    [chartData]
  );

 return (
  <div className="relative space-y-8">
    {/* Full Tab Loader */}
    {loading && (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75">
        <Loader />
      </div>
    )}

    {/* 🔹 Year Selector */}
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Financial Overview</h2>
      <div>
        <label className="text-sm text-gray-600 mr-2">Select Year:</label>
        <select
          value={selectedYear || ""}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {availableYears?.length > 0 ? (
            availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))
          ) : (
            <option disabled>Loading...</option>
          )}
        </select>
      </div>
    </div>

    {/* 🔹 Stat Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-md flex justify-between items-center">
        <div>
          <p className="text-sm opacity-90">Total Revenue</p>
          <h3 className="text-3xl font-extrabold">{formatCr(totalRevenue)}</h3>
        </div>
        <DollarSign size={32} />
      </div>

      <div className="bg-red-600 text-white p-6 rounded-2xl shadow-md flex justify-between items-center">
        <div>
          <p className="text-sm opacity-90">Total Expenses</p>
          <h3 className="text-3xl font-extrabold">{formatCr(totalExpenses)}</h3>
        </div>
        <TrendingDown size={32} />
      </div>

      <div className="bg-green-600 text-white p-6 rounded-2xl shadow-md flex justify-between items-center">
        <div>
          <p className="text-sm opacity-90">Net Profit</p>
          <h3 className="text-3xl font-extrabold">{formatCr(netProfit)}</h3>
        </div>
        <TrendingUp size={32} />
      </div>

      <div className="bg-purple-600 text-white p-6 rounded-2xl shadow-md flex justify-between items-center">
        <div>
          <p className="text-sm opacity-90">Profit Margin</p>
          <h3 className="text-3xl font-extrabold">{profitMargin}%</h3>
        </div>
        <DollarSign size={32} />
      </div>
    </div>

    {/* 🔹 Chart Section */}
    <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">
        Financial Trends ({selectedYear})
      </h3>

      {error && <p className="text-red-500 text-sm">Error: {error}</p>}

      {!error && !loading && (
        <HighchartsReact highcharts={Highcharts} options={financialChartOptions} />
      )}
    </div>
  </div>
);
}