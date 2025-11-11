import React, { useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";

export default function FinancialTab({ financialData = [], loading, error }) {
  // ✅ Always provide fallback data
  const chartData = useMemo(() => {
    let data = [];

    if (Array.isArray(financialData) && financialData.length > 0) {
      const monthMap = {};

      financialData.forEach((item) => {
        const date = item.date || item.month || item.createdAt || item.updatedAt || "";
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate)) {
          const month = parsedDate.toLocaleString("default", { month: "short" });
          if (!monthMap[month]) monthMap[month] = { month, revenue: 0, expenses: 0 };
          monthMap[month].revenue += Number(item.revenue) || 0;
          monthMap[month].expenses += Number(item.expenses) || 0;
        }
      });

      data = Object.values(monthMap).map((m) => ({
        ...m,
        revenue: m.revenue / 100000, // Convert to Lakhs
        expenses: m.expenses / 100000,
      }));
    }

    if (data.length === 0) {
      data = [
        { month: "Jan", revenue: 9.0, expenses: 7.5 },
        { month: "Feb", revenue: 10.5, expenses: 8.8 },
        { month: "Mar", revenue: 11.2, expenses: 9.4 },
        { month: "Apr", revenue: 9.98, expenses: 8.26 },
        { month: "May", revenue: 10.9, expenses: 9.3 },
        { month: "Jun", revenue: 10.4, expenses: 8.9 },
        { month: "Jul", revenue: 11.6, expenses: 9.7 },
        { month: "Aug", revenue: 12.1, expenses: 9.9 },
        { month: "Sep", revenue: 11.5, expenses: 9.4 },
        { month: "Oct", revenue: 10.7, expenses: 8.9 },
        { month: "Nov", revenue: 11.2, expenses: 9.3 },
        { month: "Dec", revenue: 11.8, expenses: 9.8 },
      ];
    }

    return data;
  }, [financialData]);

  const formatCr = (val) => `₹${(val / 1e7).toFixed(2)}Cr`;

  // ✅ Highcharts Config for Financial Trends
  const financialChartOptions = useMemo(() => ({
    chart: { type: "area", backgroundColor: "transparent" },
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
  }), [chartData]);

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-md flex justify-between items-center">
          <div>
            <p className="text-sm opacity-90">Total Revenue</p>
            <h3 className="text-3xl font-extrabold">{formatCr(2049800000)}</h3>
            <p className="text-xs mt-1 opacity-90">+12.5%</p>
          </div>
          <DollarSign size={32} />
        </div>

        <div className="bg-red-600 text-white p-6 rounded-2xl shadow-md flex justify-between items-center">
          <div>
            <p className="text-sm opacity-90">Total Expenses</p>
            <h3 className="text-3xl font-extrabold">{formatCr(1672500000)}</h3>
            <p className="text-xs mt-1 opacity-90">+8.3%</p>
          </div>
          <TrendingDown size={32} />
        </div>

        <div className="bg-green-600 text-white p-6 rounded-2xl shadow-md flex justify-between items-center">
          <div>
            <p className="text-sm opacity-90">Net Profit</p>
            <h3 className="text-3xl font-extrabold">{formatCr(377330000)}</h3>
            <p className="text-xs mt-1 opacity-90">+18.2%</p>
          </div>
          <TrendingUp size={32} />
        </div>

        <div className="bg-purple-600 text-white p-6 rounded-2xl shadow-md flex justify-between items-center">
          <div>
            <p className="text-sm opacity-90">Profit Margin</p>
            <h3 className="text-3xl font-extrabold">18.4%</h3>
            <p className="text-xs mt-1 opacity-90">+3.2%</p>
          </div>
          <DollarSign size={32} />
        </div>
      </div>

      {/* Highcharts Line (Area) Chart */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Financial Trends (Highcharts)</h3>

        {loading ? (
          <p className="text-gray-500 text-sm">Loading financial data…</p>
        ) : error ? (
          <p className="text-red-500 text-sm">Error: {error}</p>
        ) : (
          <HighchartsReact highcharts={Highcharts} options={financialChartOptions} />
        )}
      </div>
    </div>
  );
}
