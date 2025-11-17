import React, { useMemo, useEffect, useState } from "react";
import axios from "axios";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

// REQUIRED MODULES FOR PICTORIAL CHART
import HighchartsMore from "highcharts/highcharts-more";
import PictorialModule from "highcharts/modules/pictorial";

HighchartsMore(Highcharts);
PictorialModule(Highcharts);

import LoadingError from "../layout/LoadingError";
import Loader from "../layout/Loader";

import {
  Users,
  Heart,
  Calendar,
  AlertCircle,
  Bed,
  Users2,
  Activity,
} from "lucide-react";

export default function OverviewTab() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // MAIN DATA
  const [departments, setDepartments] = useState([]);
  const [genderDemographics, setGenderDemographics] = useState([]);
  const [ageDemographics, setAgeDemographics] = useState([]);
  const [insuranceDemographics, setInsuranceDemographics] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [activities, setActivities] = useState([]);

  const [selectedDemo, setSelectedDemo] = useState("gender");

  // ========== FETCH ==========
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        const [deptRes, genderRes, ageRes, insRes, vitalsRes, actRes] =
          await Promise.all([
            axios.get(
              "https://healthcare-backend-szmd.onrender.com/api/departments"
            ),
            axios.get(
              "https://healthcare-backend-szmd.onrender.com/api/demographics/gender"
            ),
            axios.get(
              "https://healthcare-backend-szmd.onrender.com/api/demographics/age"
            ),
            axios.get(
              "https://healthcare-backend-szmd.onrender.com/api/demographics/insurance"
            ),
            axios.get("https://healthcare-backend-szmd.onrender.com/api/vitals"),
            axios.get(
              "https://healthcare-backend-szmd.onrender.com/api/activities/recent"
            ),
          ]);

        setDepartments(deptRes.data || []);
        setGenderDemographics(genderRes.data || []);
        setAgeDemographics(ageRes.data || []);
        setInsuranceDemographics(insRes.data || []);
        setVitals(vitalsRes.data || []);
        setActivities(actRes.data || []);

        setError(null);
      } catch (err) {
        setError("Failed to fetch overview data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // ========== DEPT CHART ==========
  const deptChartOptions = useMemo(() => {
    const names = departments.map((d) => d.name);
    const patients = departments.map((d) => d.totalPatients || 0);
    const staff = departments.map((d) => {
      const s = d.staff || {};
      return (s.doctors || 0) + (s.nurses || 0) + (s.support || 0);
    });

    return {
      chart: { type: "column", backgroundColor: "transparent", height: 250 },
      title: { text: "" },
      xAxis: { categories: names },
      yAxis: { title: { text: "Count" } },
      plotOptions: { column: { borderRadius: 5, groupPadding: 0.05 } },
      series: [
        { name: "Patients", data: patients, color: "#3b82f6" },
        { name: "Staff", data: staff, color: "#10b981" },
      ],
      credits: { enabled: false },
    };
  }, [departments]);

  // ========== PIE MAKER ==========
  const makePieOptions = (items, height = 320) => {
    const processed = items.map((item) => ({
      name: item.label || item.gender || item.type || "Unknown",
      y: Number(item.percentage) || 0,
      color: item.color,
    }));

    return {
      chart: { type: "pie", backgroundColor: "transparent", height },
      title: { text: "" },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          showInLegend: true,
          borderColor: "#fff",
          borderWidth: 2,
          dataLabels: {
            enabled: true,
            format: "{point.name}: {point.y}%",
            style: { fontSize: "12px", fontWeight: "600" },
          },
        },
      },
      series: [
        {
          name: "Patients",
          innerSize: "40%",
          data: processed,
        },
      ],
      credits: { enabled: false },
    };
  };

  // ========== PICTORIAL GENDER CHART ==========
  const makeGenderPictorialChart = () => {
    const male = Number(
      genderDemographics.find((g) => g.gender === "Male")?.percentage || 0
    );
    const female = Number(
      genderDemographics.find((g) => g.gender === "Female")?.percentage || 0
    );

    return {
      chart: { type: "pictorial", backgroundColor: "transparent", height: 350 },
      title: { text: "Gender Composition" },

      xAxis: {
        categories: ["Woman", "Man"],
        lineWidth: 0,
        opposite: true,
      },

      yAxis: { visible: false, max: 100 },

      plotOptions: {
        series: {
          pointPadding: 0,
          groupPadding: 0,
          stacking: "normal",
          dataLabels: {
            enabled: true,
            format: "{y}%",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
          // FULL SVG PATHS HERE
          paths: [
            { definition: `YOUR_WOMAN_SVG_PATH` },
            { definition: `YOUR_MAN_SVG_PATH` },
          ],
        },
      },

      series: [
        {
          name: "Female",
          data: [female, 0],
          color: "#FF6384",
        },
        {
          name: "Male",
          data: [0, male],
          color: "#36A2EB",
        },
      ],

      credits: { enabled: false },
    };
  };

  // ========== CHART SWITCHER ==========
  const selectedDemographicData = useMemo(() => {
    if (selectedDemo === "gender") return genderDemographics;
    if (selectedDemo === "age") return ageDemographics;
    if (selectedDemo === "insurance") return insuranceDemographics;
    return [];
  }, [selectedDemo, genderDemographics, ageDemographics, insuranceDemographics]);

  const demographicChartOptions = useMemo(() => {
    if (selectedDemo === "gender") return makeGenderPictorialChart();
    return makePieOptions(selectedDemographicData);
  }, [selectedDemo, selectedDemographicData]);

  // ========== LOADING ==========
  if (loading) return <Loader />;
  if (error) return <LoadingError message={error} />;

  return (
    <div className="space-y-8">
      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* cards... */}
      </div>

      {/* ROW 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Department Overview" chart={deptChartOptions} />

        <div className="bg-white rounded-xl shadow-md border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Patient Demographics
            </h3>

            <select
              value={selectedDemo}
              onChange={(e) => setSelectedDemo(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="gender">By Gender</option>
              <option value="age">By Age</option>
              <option value="insurance">By Insurance</option>
            </select>
          </div>

          <HighchartsReact
            highcharts={Highcharts}
            options={demographicChartOptions}
          />
        </div>
      </div>

      {/* VITALS + ACTIVITIES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <VitalsTable vitals={vitals} />
        <ActivitiesList activities={activities} />
      </div>
    </div>
  );
}

/* ========= CHILD COMPONENTS ========== */

function ChartCard({ title, chart }) {
  return (
    <div className="bg-white rounded-xl shadow-md border p-5">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      <HighchartsReact highcharts={Highcharts} options={chart} />
    </div>
  );
}

// Other child components remain same...

function CompactCard({ label, value, trend, trendUp, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-3 flex flex-col">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">{label}</p>
        <div className={`p-2 rounded-md bg-gradient-to-r ${color} text-white`}>
          <Icon size={14} />
        </div>
      </div>
      <h3 className="text-lg font-bold">{value}</h3>

      <p
        className={`text-xs mt-1 ${
          trendUp ? "text-green-600" : "text-red-500"
        }`}
      >
        {trendUp ? "▲" : "▼"} {trend}
      </p>
    </div>
  );
}

function VitalsTable({ vitals }) {
  return (
    <div className="bg-white rounded-xl shadow-md border p-6">
      <h3 className="text-xl font-bold mb-4">Vital Signs Monitoring</h3>

      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="p-2 text-left">Patient</th>
            <th className="p-2 text-left">Date</th>
            <th className="p-2 text-left">HR</th>
            <th className="p-2 text-left">BP</th>
            <th className="p-2 text-left">Temp</th>
            <th className="p-2 text-left">O₂</th>
          </tr>
        </thead>

        <tbody>
          {vitals.map((v, i) => (
            <tr key={i} className="border-b">
              <td className="p-2">{v.patientName}</td>
              <td className="p-2">
                {new Date(v.lastUpdated).toLocaleDateString("en-IN")}
              </td>
              <td className="p-2">{v.heartRate}</td>
              <td className="p-2">{v.bloodPressure}</td>
              <td className="p-2">{v.temperature}°F</td>
              <td className="p-2">{v.oxygenSaturation}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActivitiesList({ activities }) {
  return (
    <div className="bg-white rounded-xl shadow-md border p-6">
      <h3 className="text-xl font-bold mb-4">Recent Activities</h3>

      {activities.map((a) => (
        <div key={a.id} className="border-b py-3 flex items-start gap-3">
          <div
            className={`p-2 rounded ${
              a.priority === "High"
                ? "bg-red-100 text-red-700"
                : a.priority === "Medium"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            <Activity size={18} />
          </div>

          <div className="flex-1">
            <p className="font-semibold text-sm">
              {a.type}: {a.message}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(a.timestamp).toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
