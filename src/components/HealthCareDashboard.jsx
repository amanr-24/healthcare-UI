import React, { useState, useEffect } from 'react';
import { Heart, Users, Calendar, AlertCircle, TrendingUp, Activity, Menu, X, LogOut, Settings, Bell, BarChart3, Filter, Download, Plus, Stethoscope, Pill, MoreVertical, Search, Phone, Mail, Loader, DollarSign, Clipboard, Package } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Clock, Star } from 'lucide-react';

const API_BASE_URL = 'http://localhost:47815/api';

const HealthcareDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDept, setSelectedDept] = useState(null);
  const [patientFilter, setPatientFilter] = useState('all');
  const [dateRange, setDateRange] = useState('month');
  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});
  const [deptRevenue, setDeptRevenue] = useState([]);  
  const [rawDeptRevenue, setRawDeptRevenue] = useState([]);


  // State for all data
  const [overviewStats, setOverviewStats] = useState(null);
  const [financialData, setFinancialData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [staff, setStaff] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [appointmentTrends, setAppointmentTrends] = useState([]);
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [vitalAlerts, setVitalAlerts] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [qualityMetrics, setQualityMetrics] = useState(null);
  const [demographics, setDemographics] = useState(null);
  const [inventory, setInventory] = useState(null);

  // Fetch utility function
  const fetchData = async (endpoint, key, setter) => {
    setLoading(prev => ({ ...prev, [key]: true }));
    setError(prev => ({ ...prev, [key]: null }));
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setter(data);
    } catch (err) {
      console.error(`Error fetching ${key}:`, err);
      setError(prev => ({ ...prev, [key]: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  // Initial data load
  useEffect(() => {
    fetchData('/overview', 'overview', setOverviewStats);
    fetchData('/departments', 'departments', (data) => {
  const mapped = data.map(dept => ({
    ...dept,
    total_patients: dept.totalPatients,
    total_staff: (dept.staff?.doctors || 0) + (dept.staff?.nurses || 0) + (dept.staff?.support || 0),
    capacity: dept.capacity,
    occupancy_rate: dept.currentOccupancy,
    department_head: dept.department_head || 'N/A',
  }));
  setDepartments(mapped);
});

    fetchData('/patients/active', 'patients', setPatients);
    fetchData('/staff', 'staff', setStaff);
fetchData('/appointments', 'appointments', (data) => {
  // ✅ Filter: only doctor appointments
  const doctorAppointments = data.filter(
    (appt) => appt.doctorName && appt.doctorName !== "N/A"
  );

  // ✅ Update appointments table
  setAppointments(doctorAppointments);

  // ✅ 1. Group by Month (Trends)
  const monthMap = {};
  doctorAppointments.forEach((item) => {
    const date = new Date(item.date);
    const month = date.toLocaleString("default", { month: "short", year: "numeric" });

    if (!monthMap[month]) {
      monthMap[month] = { total: 0, completed: 0, cancelled: 0, scheduled: 0 };
    }

    monthMap[month].total++;
    if (item.status === "Completed") monthMap[month].completed++;
    if (item.status === "Cancelled") monthMap[month].cancelled++;
    if (item.status === "Scheduled") monthMap[month].scheduled++;
  });

  const trends = Object.entries(monthMap).map(([month, stats]) => ({
    month,
    ...stats,
  }));

  // ✅ 2. Group by Doctor (for Doctor Chart)
  const doctorMap = {};
  doctorAppointments.forEach((item) => {
    const doctor = item.doctorName || "Unknown Doctor";
    if (!doctorMap[doctor]) {
      doctorMap[doctor] = { totalAppointments: 0, completed: 0, cancelled: 0, scheduled: 0 };
    }

    doctorMap[doctor].totalAppointments++;
    if (item.status === "Completed") doctorMap[doctor].completed++;
    if (item.status === "Cancelled") doctorMap[doctor].cancelled++;
    if (item.status === "Scheduled") doctorMap[doctor].scheduled++;
  });

  const doctorStats = Object.entries(doctorMap).map(([doctor, stats]) => ({
    doctor,
    ...stats,
  }));

  // ✅ Set Data
  setAppointmentTrends(trends);
  setAppointmentTypes(doctorStats); // renamed variable reused for chart
});




    fetchData('/vitals', 'vitals', setVitalAlerts);
    fetchData('/activities/recent', 'activities', setRecentActivities);
    fetchData('/quality', 'quality', setQualityMetrics);
    fetchData('/demographics', 'demographics', setDemographics);
    fetchData('/inventory', 'inventory', setInventory);
    fetchData('/financial', 'financial', setFinancialData);

    // fetch raw, store raw and attempt a best-effort map to { department, revenue }
    fetchData('/financial/department', 'deptRevenue', (res) => {
  console.log('raw dept revenue response:', res);
  // response format from your backend: { message: "...", data: [...] }
  const arr = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);
  setRawDeptRevenue(arr);

  // immediate map attempt (departments might not be loaded yet)
  const mapped = arr.map(item => {
    // find department name from previously fetched `departments` state
    const deptObj = departments.find(d => 
      // compare common id shapes (number/string)
      String(d.department_id) === String(item.department_id)
    );
    const name = deptObj?.name || (item.department_id === null ? 'All Departments' : `Dept ${item.department_id}`);
    return {
      department: name,
      revenue: parseFloat(item.total_revenue) || 0
    };
  });

  setDeptRevenue(mapped);
});

  }, []);

  // Refetch patients on filter change
  useEffect(() => {
    if (activeTab === 'patients') {
      const endpoint = patientFilter === 'all' ? '/patients' : '/patients/active';
      fetchData(endpoint, 'patients', setPatients);
    }
  }, [patientFilter, activeTab]);

  // Loading component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-96">
      <div className="flex flex-col items-center space-y-3">
        <Loader className="animate-spin text-blue-600" size={40} />
        <p className="text-gray-600 font-medium">Loading data...</p>
      </div>
    </div>
  );

  // Error component
  const ErrorMessage = ({ message }) => (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
      <p className="font-semibold">Error loading data</p>
      <p className="text-sm">{message}</p>
    </div>
  );

  useEffect(() => {
  if (!rawDeptRevenue || rawDeptRevenue.length === 0 || !departments || departments.length === 0) return;

  const remapped = rawDeptRevenue.map(item => {
    const deptObj = departments.find(d => String(d.department_id) === String(item.department_id));
    const name = deptObj?.name || (item.department_id === null ? 'All Departments' : `Dept ${item.department_id}`);
    return {
      department: name,
      revenue: parseFloat(item.total_revenue) || 0
    };
  });

  setDeptRevenue(remapped);
}, [departments, rawDeptRevenue]);


  const StatCard = ({ label, value, trend, trendUp, icon: Icon, color }) => {
    return (
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-gray-600 text-sm font-medium mb-1">{label}</p>
            <p className="text-4xl font-bold text-gray-900 mb-3">{value}</p>
            {trend && (
              <div className={`inline-flex items-center space-x-1 text-sm font-semibold ${trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
                <TrendingUp size={14} />
                <span>{trend}</span>
              </div>
            )}
          </div>
          <div className={`bg-gradient-to-br ${color || 'from-blue-600 to-blue-400'} p-4 rounded-xl shadow-lg`}>
            <Icon className="text-white" size={32} />
          </div>
        </div>
      </div>
    );
  };

  const DepartmentCard = ({ dept }) => (
    <div 
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border border-gray-100 cursor-pointer hover:border-blue-300" 
      onClick={() => setSelectedDept(dept.name)}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">{dept.name}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          dept.total_patients > 50 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {dept.total_patients} Patients
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Capacity</p>
          <p className="text-2xl font-bold text-gray-900">{dept.capacity}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Occupancy</p>
          <p className="text-2xl font-bold text-blue-600">{dept.occupancy_rate}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Staff</p>
          <p className="text-xl font-bold text-gray-900">{dept.total_staff}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Head</p>
          <p className="text-xs font-bold text-gray-900 truncate">{dept.department_head || 'N/A'}</p>
        </div>
      </div>
      <div className="pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-600">Capacity Usage</span>
          <span className="text-sm font-bold text-gray-900">{dept.occupancy_rate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" 
            style={{ width: `${Math.min(dept.occupancy_rate, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );

  const PatientRow = ({ patient }) => (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition">
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
            {patient.fullName?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'P'}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{patient.fullName}</p>
            <p className="text-xs text-gray-500">ID: {patient.id}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">{patient.age}y, {patient.gender}</td>
      <td className="px-6 py-4">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
          {patient.department}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{patient.doctor}</td>
      <td className="px-6 py-4">
        {patient.vitals && (
          <div className="flex flex-col space-y-1 text-xs">
            <p><span className="text-gray-500">BP:</span> {patient.vitals.bloodPressure || 'N/A'}</p>
            <p><span className="text-gray-500">HR:</span> {patient.vitals.heartRate || 'N/A'}</p>
            <p><span className="text-gray-500">Temp:</span> {patient.vitals.temperature || 'N/A'}°C</p>
          </div>
        )}
      </td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          patient.severity === 'Critical' ? 'bg-red-100 text-red-700' :
          patient.severity === 'Stable' ? 'bg-green-100 text-green-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {patient.severity}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          patient.status === 'Admitted' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {patient.status}
        </span>
      </td>
    </tr>
  );

  const StaffCard = ({ member }) => (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
            {member.fullName?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'S'}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{member.fullName}</h3>
            <p className="text-xs text-gray-500">{member.specialty || member.role}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1 bg-yellow-100 px-2 py-1 rounded-full">
          <span className="text-yellow-600 font-bold text-sm">{member.rating || '4.5'}</span>
          <span className="text-yellow-600">★</span>
        </div>
      </div>
      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{member.role}</span>
          <span className="font-semibold text-gray-900">{member.department}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Experience</span>
          <span className="font-semibold text-gray-900">{member.experience || 0} years</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Current Patients</span>
          <span className="font-semibold text-gray-900">{member.patients || 0}</span>
        </div>
      </div>
      <div className="pt-4 border-t border-gray-100 space-y-2">
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <div className={`w-2 h-2 rounded-full ${
            member.status === 'On Duty' ? 'bg-green-500' : 'bg-gray-400'
          }`} />
          <span>{member.status}</span>
          <span className="text-gray-400">•</span>
          <span>{member.shift || 'Day Shift'}</span>
        </div>
      </div>
    </div>
  );

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'departments', label: 'Departments', icon: Heart },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'staff', label: 'Medical Staff', icon: Stethoscope },
    { id: 'vitals', label: 'Vitals & Alerts', icon: Activity },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'financial', label: 'Financial', icon: DollarSign },
  ];

  // Calculate financial summary
  const calculateFinancialSummary = () => {
    if (!financialData || financialData.length === 0) {
      return { totalRevenue: 0, totalExpenses: 0, netProfit: 0, margin: 0 };
    }

    const totalRevenue = financialData.reduce((sum, item) => sum + (parseFloat(item.revenue) || 0), 0);
    const totalExpenses = financialData.reduce((sum, item) => sum + (parseFloat(item.expenses) || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    const margin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

    return { totalRevenue, totalExpenses, netProfit, margin };
  };

  const financialSummary = calculateFinancialSummary();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-24'} bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-white transition-all duration-300 ease-in-out shadow-2xl fixed h-screen overflow-y-auto z-50`}>
        <div className="p-6 flex items-center justify-between sticky top-0 bg-gradient-to-r from-slate-950 to-slate-900">
          {sidebarOpen && (
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <Heart className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-black bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">MediCare</h1>
                <p className="text-xs text-gray-400">Hospital Management</p>
              </div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hover:bg-slate-700 p-2 rounded-lg transition">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="mt-8 space-y-2 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === item.id 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'hover:bg-slate-700/50 text-gray-300'
                }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-semibold">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-4 right-4 space-y-2">
          <button className="w-full flex items-center space-x-4 px-4 py-3 rounded-xl hover:bg-slate-700/50 transition text-gray-300">
            <Settings size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Settings</span>}
          </button>
          <button className="w-full flex items-center space-x-4 px-4 py-3 rounded-xl hover:bg-red-500/20 transition text-red-300">
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden ${sidebarOpen ? 'ml-72' : 'ml-24'} transition-all duration-300`}>
        {/* Top Navigation */}
        <div className="bg-white shadow-md sticky top-0 z-40 border-b border-gray-200">
          <div className="px-8 py-5 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-gray-900">Hospital Dashboard</h2>
              <p className="text-sm text-gray-500 mt-1">Real-time monitoring & management</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-3 bg-gray-100 px-4 py-2 rounded-lg">
                <Search size={18} className="text-gray-500" />
                <input type="text" placeholder="Search patients, doctors..." className="bg-transparent outline-none text-sm text-gray-700 w-64" />
              </div>
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                <Download size={20} />
              </button>
              <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  AD
                </div>
                <div className="text-sm">
                  <p className="font-bold text-gray-900">Dr. Admin</p>
                  <p className="text-gray-500">Hospital Director</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {loading.overview ? (
                    <div className="col-span-4"><LoadingSpinner /></div>
                  ) : error.overview ? (
                    <div className="col-span-4"><ErrorMessage message={error.overview} /></div>
                  ) : overviewStats ? (
                    <>
                      <StatCard 
                        label="Total Patients" 
                        value={overviewStats.total_patients || 0}
                        trend="+12%" 
                        trendUp={true}
                        icon={Users}
                        color="from-blue-600 to-blue-400"
                      />
                      <StatCard 
                        label="Active Patients" 
                        value={overviewStats.active_patients || 0}
                        trend="+8%" 
                        trendUp={true}
                        icon={Heart}
                        color="from-emerald-600 to-emerald-400"
                      />
                      <StatCard 
                        label="Total Appointments" 
                        value={overviewStats.total_appointments || 0}
                        trend="+15%" 
                        trendUp={true}
                        icon={Calendar}
                        color="from-purple-600 to-purple-400"
                      />
                      <StatCard 
                        label="Critical Alerts" 
                        value={overviewStats.critical_alerts || 0}
                        trend="-5%" 
                        trendUp={false}
                        icon={AlertCircle}
                        color="from-red-600 to-red-400"
                      />
                    </>
                  ) : null}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <button className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-xl p-4 font-semibold hover:shadow-lg transition flex items-center justify-center space-x-2">
                    <Plus size={20} /> <span>New Admission</span>
                  </button>
                  <button className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl p-4 font-semibold hover:shadow-lg transition flex items-center justify-center space-x-2">
                    <Calendar size={20} /> <span>Schedule Appointment</span>
                  </button>
                  <button className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-xl p-4 font-semibold hover:shadow-lg transition flex items-center justify-center space-x-2">
                    <Pill size={20} /> <span>View Medications</span>
                  </button>
                  <button className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl p-4 font-semibold hover:shadow-lg transition flex items-center justify-center space-x-2">
                    <AlertCircle size={20} /> <span>Critical Cases</span>
                  </button>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Department Statistics */}
                  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Department Overview</h3>
                    {loading.departments ? (
                      <LoadingSpinner />
                    ) : error.departments ? (
                      <ErrorMessage message={error.departments} />
                    ) : departments.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={departments}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="name" stroke="#6b7280" />
                          <YAxis stroke="#6b7280" />
                          <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                          <Legend />
                          <Bar dataKey="total_patients" fill="#3b82f6" name="Patients" radius={[8, 8, 0, 0]} />
                          <Bar dataKey="total_staff" fill="#10b981" name="Staff" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No department data available</p>
                    )}
                  </div>

                  {/* Demographics Pie */}
                  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Patient Demographics</h3>
                    {loading.demographics ? (
                      <LoadingSpinner />
                    ) : demographics?.byGender ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie 
                            data={demographics.byGender} 
                            cx="50%" 
                            cy="50%" 
                            labelLine={false} 
                            label={({ gender, percentage }) => `${gender}: ${percentage}%`}
                            outerRadius={100} 
                            fill="#8884d8" 
                            dataKey="count"
                          >
                            {demographics.byGender.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color || ['#3b82f6', '#ec4899', '#10b981'][index]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No demographic data available</p>
                    )}
                  </div>
                </div>

                {/* Revenue by Department Pie Chart */}
<div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
  <h3 className="text-xl font-bold text-gray-900 mb-6">Revenue by Department</h3>
  {loading.deptRevenue ? (
    <LoadingSpinner />
  ) : error.deptRevenue ? (
    <ErrorMessage message={error.deptRevenue} />
  ) : deptRevenue.length > 0 ? (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={deptRevenue}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ department, revenue }) =>
            `${department}: ₹${(revenue / 1000000).toFixed(1)}M`
          }
          outerRadius={110}
          dataKey="revenue"
        >
          {deptRevenue.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={[
                '#ef4444', '#22c55e', '#3b82f6', '#6366f1',
                '#06b6d4', '#ec4899', '#f59e0b', '#a855f7'
              ][index % 8]}
            />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `₹${(value / 1000000).toFixed(1)}M`} />
      </PieChart>
    </ResponsiveContainer>
  ) : (
    <p className="text-gray-500 text-center py-8">No revenue data available</p>
  )}
</div>


                {/* Recent Activities */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activities</h3>
                  {loading.activities ? (
                    <LoadingSpinner />
                  ) : recentActivities.length > 0 ? (
                    <div className="space-y-3">
                      {recentActivities.slice(0, 10).map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            activity.priority === 'critical' ? 'bg-red-500' :
                            activity.priority === 'high' ? 'bg-orange-500' :
                            activity.priority === 'medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-gray-900">{activity.type}</p>
                            <p className="text-xs text-gray-600 mt-1">{activity.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No recent activities</p>
                  )}
                </div>
              </div>
            )}

         {activeTab === 'departments' && (
  <div className="space-y-8">
    {/* ✅ Department Header First */}
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-black text-gray-900">Department Management</h2>
        <p className="text-gray-500 mt-1">Overview of all hospital departments</p>
      </div>
      <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition flex items-center space-x-2">
        <Plus size={20} /> <span>Add Department</span>
      </button>
    </div>

    {/* ✅ Stats Row Below the Title */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <Users size={22} />
          </div>
          <p className="text-sm font-semibold text-gray-600">Total Patients</p>
        </div>
        <p className="text-3xl font-bold text-gray-900 mb-1">{overviewStats?.total_patients || 12400}</p>
        <p className="text-emerald-600 text-sm font-medium flex items-center space-x-1">
          <TrendingUp size={14} /> <span>+23 from previous period</span>
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-cyan-100 text-cyan-600">
            <Stethoscope size={22} />
          </div>
          <p className="text-sm font-semibold text-gray-600">Staff Members</p>
        </div>
        <p className="text-3xl font-bold text-gray-900 mb-1">{overviewStats?.total_staff || 300}</p>
        <p className="text-emerald-600 text-sm font-medium flex items-center space-x-1">
          <TrendingUp size={14} /> <span>+8 from previous period</span>
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-yellow-100 text-yellow-600">
            <Clock size={22} />
          </div>
          <p className="text-sm font-semibold text-gray-600">Avg. Wait Time</p>
        </div>
        <p className="text-3xl font-bold text-gray-900 mb-1">45 min</p>
        <p className="text-emerald-600 text-sm font-medium flex items-center space-x-1">
          <TrendingUp size={14} /> <span>+15 from previous period</span>
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-100 text-green-600">
            <Star size={22} />
          </div>
          <p className="text-sm font-semibold text-gray-600">Patient Satisfaction</p>
        </div>
        <p className="text-3xl font-bold text-gray-900 mb-1">4.2</p>
        <p className="text-emerald-600 text-sm font-medium flex items-center space-x-1">
          <TrendingUp size={14} /> <span>+84 from previous period</span>
        </p>
      </div>
    </div>

    {/* ✅ Department Cards Grid */}
    {loading.departments ? (
      <LoadingSpinner />
    ) : error.departments ? (
      <ErrorMessage message={error.departments} />
    ) : departments.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <DepartmentCard key={dept.department_id} dept={dept} />
        ))}
      </div>
    ) : (
      <p className="text-gray-500 text-center py-16">No departments found</p>
    )}
  </div>
)}


            {/* PATIENTS TAB */}
            {activeTab === 'patients' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900">Patient Management</h2>
                    <p className="text-gray-500 mt-1">View and manage all patient records</p>
                  </div>
                  <div className="flex space-x-3">
                    <select 
                      value={patientFilter} 
                      onChange={(e) => setPatientFilter(e.target.value)} 
                      className="px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-blue-500"
                    >
                      <option value="all">All Patients</option>
                      <option value="active">Active Only</option>
                    </select>
                    <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition">
                      New Patient
                    </button>
                  </div>
                </div>
                {loading.patients ? (
                  <LoadingSpinner />
                ) : error.patients ? (
                  <ErrorMessage message={error.patients} />
                ) : patients.length > 0 ? (
                  <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-bold">Patient</th>
                          <th className="px-6 py-4 text-left text-sm font-bold">Details</th>
                          <th className="px-6 py-4 text-left text-sm font-bold">Department</th>
                          <th className="px-6 py-4 text-left text-sm font-bold">Doctor</th>
                          <th className="px-6 py-4 text-left text-sm font-bold">Vitals</th>
                          <th className="px-6 py-4 text-left text-sm font-bold">Severity</th>
                          <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patients.map((patient) => (
                          <PatientRow key={patient.id} patient={patient} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-16">No patients found</p>
                )}
              </div>
            )}

 {/* ✅ APPOINTMENTS TAB */}
{activeTab === 'appointments' && (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-black text-gray-900">Appointments</h2>
        <p className="text-gray-500 mt-1">Schedule and manage appointments</p>
      </div>
      <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition flex items-center space-x-2">
        <Plus size={20} /> <span>Schedule Appointment</span>
      </button>
    </div>

    {/* Loading / Error */}
    {loading.appointments ? (
      <LoadingSpinner />
    ) : error.appointments ? (
      <ErrorMessage message={error.appointments} />
    ) : appointments.length > 0 ? (
      <>
        {/* ✅ Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 📈 Appointment Trends Chart */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Appointment Trends
            </h3>
            {appointmentTrends?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={appointmentTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Total"
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Completed"
                  />
                  <Line
                    type="monotone"
                    dataKey="cancelled"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Cancelled"
                  />
                  <Line
                    type="monotone"
                    dataKey="scheduled"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="Scheduled"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No appointment trend data available
              </p>
            )}
          </div>

          {/* 🧑‍⚕️ Appointments per Doctor Chart */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Appointments per Doctor
            </h3>
            {appointmentTypes?.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={appointmentTypes}
                  margin={{ top: 10, right: 20, left: 0, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="doctor"
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={70}
                    tick={{ fontSize: 11 }}
                    stroke="#6b7280"
                  />
                  <YAxis stroke="#3b82f6" />
                  <Tooltip
                    formatter={(value, name) => `${value} Appointments`}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="totalAppointments"
                    fill="#3b82f6"
                    name="Total"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="completed"
                    fill="#10b981"
                    name="Completed"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="cancelled"
                    fill="#ef4444"
                    name="Cancelled"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="scheduled"
                    fill="#f59e0b"
                    name="Scheduled"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No doctor appointment data available
              </p>
            )}
          </div>
        </div>

        {/* ✅ Appointment Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Patient
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Doctor
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Time
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr
                  key={appt.appointment_id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {appt.patientName}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {appt.doctorName || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-medium">
                    {new Date(appt.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-gray-900">{appt.time || "N/A"}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                      {appt.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        appt.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : appt.status === "Scheduled"
                          ? "bg-blue-100 text-blue-700"
                          : appt.status === "Cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {appt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                      <MoreVertical size={18} className="text-gray-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    ) : (
      <p className="text-gray-500 text-center py-16">No appointments found</p>
    )}
  </div>
  
)}




            {/* STAFF TAB */}
            {activeTab === 'staff' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900">Medical Staff Directory</h2>
                    <p className="text-gray-500 mt-1">Manage doctors, nurses, and support staff</p>
                  </div>
                  <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition flex items-center space-x-2">
                    <Plus size={20} /> <span>Add Staff Member</span>
                  </button>
                </div>
                {loading.staff ? (
                  <LoadingSpinner />
                ) : error.staff ? (
                  <ErrorMessage message={error.staff} />
                ) : staff.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {staff.map((member) => (
                      <StaffCard key={member.id} member={member} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-16">No staff members found</p>
                )}
              </div>
            )}

            {/* VITALS & ALERTS TAB */}
            {activeTab === 'vitals' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-black text-gray-900">Vital Signs & Alerts</h2>
                  <p className="text-gray-500 mt-1">Real-time monitoring of critical patients</p>
                </div>
                {loading.vitals ? (
                  <LoadingSpinner />
                ) : error.vitals ? (
                  <ErrorMessage message={error.vitals} />
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Patient Vitals</h3>
                      {vitalAlerts.length > 0 ? (
                        <div className="space-y-4">
                          {vitalAlerts.map((vital) => (
                            <div key={vital.patientId} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-bold text-gray-900">{vital.patientName}</p>
                                  <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                                    <div>
                                      <span className="text-gray-500">BP:</span>
                                      <span className="ml-2 font-semibold">{vital.bloodPressure || 'N/A'}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">HR:</span>
                                      <span className="ml-2 font-semibold">{vital.heartRate || 'N/A'}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Temp:</span>
                                      <span className="ml-2 font-semibold">{vital.temperature || 'N/A'}°C</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">SpO2:</span>
                                      <span className="ml-2 font-semibold">{vital.oxygenSaturation || 'N/A'}%</span>
                                    </div>
                                  </div>
                                  {vital.activeAlerts > 0 && (
                                    <div className="mt-3">
                                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                                        {vital.activeAlerts} Active Alerts
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No vital signs data available</p>
                      )}
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Alert Summary</h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                          <p className="text-red-600 font-bold">Critical Alerts</p>
                          <p className="text-3xl font-bold text-red-700">
                            {vitalAlerts.filter(v => v.activeAlerts > 0).length}
                          </p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-green-600 font-bold">Stable Patients</p>
                          <p className="text-3xl font-bold text-green-700">
                            {vitalAlerts.filter(v => v.activeAlerts === 0).length}
                          </p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-blue-600 font-bold">Total Monitored</p>
                          <p className="text-3xl font-bold text-blue-700">{vitalAlerts.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* INVENTORY TAB */}
            {activeTab === 'inventory' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900">Inventory Management</h2>
                    <p className="text-gray-500 mt-1">Medical supplies and equipment tracking</p>
                  </div>
                  <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition flex items-center space-x-2">
                    <Plus size={20} /> <span>Add Item</span>
                  </button>
                </div>
                {loading.inventory ? (
                  <LoadingSpinner />
                ) : error.inventory ? (
                  <ErrorMessage message={error.inventory} />
                ) : inventory ? (
                  <div className="space-y-6">
                    {/* Medical Supplies */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Medical Supplies</h3>
                      {inventory.medical_supplies?.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Item</th>
                                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Current Stock</th>
                                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Minimum</th>
                                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Status</th>
                                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Unit Cost</th>
                              </tr>
                            </thead>
                            <tbody>
                              {inventory.medical_supplies.map((item, idx) => (
                                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="px-6 py-4 font-semibold text-gray-900">{item.item}</td>
                                  <td className="px-6 py-4 text-gray-900">{item.current}</td>
                                  <td className="px-6 py-4 text-gray-600">{item.minimum}</td>
                                  <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                      item.status === 'Good' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                      {item.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-gray-900 font-semibold">₹{item.cost}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No supplies data available</p>
                      )}
                    </div>

                    {/* Equipment */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Equipment</h3>
                      {inventory.equipment?.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Equipment</th>
                                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Status</th>
                                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Last Maintenance</th>
                                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Next Maintenance</th>
                              </tr>
                            </thead>
                            <tbody>
                              {inventory.equipment.map((item, idx) => (
                                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="px-6 py-4 font-semibold text-gray-900">{item.equipment}</td>
                                  <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                      item.status === 'Operational' ? 'bg-green-100 text-green-700' :
                                      item.status === 'Under Maintenance' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-red-100 text-red-700'
                                    }`}>
                                      {item.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-gray-600">
                                    {new Date(item.lastMaintenance).toLocaleDateString()}
                                  </td>
                                  <td className="px-6 py-4 text-gray-900 font-semibold">
                                    {new Date(item.nextMaintenance).toLocaleDateString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No equipment data available</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-16">No inventory data available</p>
                )}
              </div>
            )}

            {/* FINANCIAL TAB */}
            {activeTab === 'financial' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-black text-gray-900">Financial Dashboard</h2>
                  <p className="text-gray-500 mt-1">Revenue, expenses, and profitability metrics</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
                    <p className="text-blue-100 text-sm font-semibold mb-2">Total Revenue</p>
                    <p className="text-4xl font-black">₹{(financialSummary.totalRevenue / 10000000).toFixed(2)}Cr</p>
                    <p className="text-blue-200 text-sm mt-3 flex items-center space-x-1">
                      <TrendingUp size={14} /> +12.5%
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-6 shadow-lg">
                    <p className="text-red-100 text-sm font-semibold mb-2">Total Expenses</p>
                    <p className="text-4xl font-black">₹{(financialSummary.totalExpenses / 10000000).toFixed(2)}Cr</p>
                    <p className="text-red-200 text-sm mt-3 flex items-center space-x-1">
                      <TrendingUp size={14} /> +8.3%
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
                    <p className="text-green-100 text-sm font-semibold mb-2">Net Profit</p>
                    <p className="text-4xl font-black">₹{(financialSummary.netProfit / 10000000).toFixed(2)}Cr</p>
                    <p className="text-green-200 text-sm mt-3 flex items-center space-x-1">
                      <TrendingUp size={14} /> +18.2%
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                    <p className="text-purple-100 text-sm font-semibold mb-2">Profit Margin</p>
                    <p className="text-4xl font-black">{financialSummary.margin}%</p>
                    <p className="text-purple-200 text-sm mt-3 flex items-center space-x-1">
                      <TrendingUp size={14} /> +3.2%
                    </p>
                  </div>
                </div>

                {/* Financial Chart */}
                {loading.financial ? (
                  <LoadingSpinner />
                ) : financialData.length > 0 ? (
                  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Financial Trends</h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart data={financialData.slice(0, 12)}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month_name" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                          formatter={(value) => `₹${(value / 100000).toFixed(2)}L`}
                        />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#3b82f6" 
                          strokeWidth={2} 
                          fillOpacity={1} 
                          fill="url(#colorRevenue)" 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="expenses" 
                          stroke="#ef4444" 
                          strokeWidth={2} 
                          fillOpacity={1} 
                          fill="url(#colorExpenses)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <p className="text-gray-500 text-center py-8">No financial data available</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthcareDashboard;