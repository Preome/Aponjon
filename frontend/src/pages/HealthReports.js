import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  DocumentTextIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  HeartIcon,
  BeakerIcon,
  ScaleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import moment from 'moment';

const HealthReports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [dateRange, setDateRange] = useState(30);
  const [activeTab, setActiveTab] = useState('overview');

  const COLORS = ['#4f46e5', '#ef4444', '#10b981', '#f59e0b'];

  useEffect(() => {
    fetchSummary();
  }, [dateRange]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/health/report/summary?days=${dateRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Failed to fetch health summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      setDownloading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/health/report/pdf?days=${dateRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `health-report-${moment().format('YYYY-MM-DD')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const addHealthRecord = async () => {
    // Navigate to add health record page
    window.location.href = '/add-health-record';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📊 Health Reports</h1>
            <p className="text-gray-600 mt-1">Track your health metrics and generate reports</p>
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <button
              onClick={addHealthRecord}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center"
            >
              <HeartIcon className="h-5 w-5 mr-2" />
              Add Reading
            </button>
            <button
              onClick={downloadPDF}
              disabled={downloading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              {downloading ? 'Generating...' : 'Download PDF'}
            </button>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center space-x-4">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(parseInt(e.target.value))}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 3 months</option>
              <option value={180}>Last 6 months</option>
              <option value={365}>Last year</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2 px-4 ${activeTab === 'overview' ? 'border-b-2 border-primary-600 text-primary-600 font-medium' : 'text-gray-500'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('vitals')}
            className={`pb-2 px-4 ${activeTab === 'vitals' ? 'border-b-2 border-primary-600 text-primary-600 font-medium' : 'text-gray-500'}`}
          >
            Vitals
          </button>
          <button
            onClick={() => setActiveTab('medications')}
            className={`pb-2 px-4 ${activeTab === 'medications' ? 'border-b-2 border-primary-600 text-primary-600 font-medium' : 'text-gray-500'}`}
          >
            Medications
          </button>
          <button
            onClick={() => setActiveTab('emergencies')}
            className={`pb-2 px-4 ${activeTab === 'emergencies' ? 'border-b-2 border-primary-600 text-primary-600 font-medium' : 'text-gray-500'}`}
          >
            Emergencies
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-2">
                    <HeartIcon className="h-8 w-8 text-red-500" />
                    <span className="text-2xl font-bold text-gray-900">{summary?.helpRequests?.total || 0}</span>
                  </div>
                  <p className="text-gray-600">Total Help Requests</p>
                </div>
                
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-2">
                    <BeakerIcon className="h-8 w-8 text-blue-500" />
                    <span className="text-2xl font-bold text-gray-900">{summary?.medicationAdherence?.percentage || 0}%</span>
                  </div>
                  <p className="text-gray-600">Medication Adherence</p>
                </div>
                
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-2">
                    <ScaleIcon className="h-8 w-8 text-green-500" />
                    <span className="text-2xl font-bold text-gray-900">
                      {summary?.dailyVitals?.filter(v => v.weight).length || 0}
                    </span>
                  </div>
                  <p className="text-gray-600">Weight Records</p>
                </div>
                
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-2">
                    <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
                    <span className="text-2xl font-bold text-gray-900">{summary?.helpRequests?.emergencies || 0}</span>
                  </div>
                  <p className="text-gray-600">Emergencies</p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Blood Pressure Chart */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Blood Pressure Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={summary?.dailyVitals || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="systolic" stroke="#ef4444" name="Systolic" />
                      <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" name="Diastolic" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Heart Rate Chart */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Heart Rate</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={summary?.dailyVitals || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="heartRate" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Medication Adherence Pie */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Medication Adherence</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Taken', value: summary?.medicationAdherence?.taken || 0 },
                          { name: 'Missed', value: (summary?.medicationAdherence?.total || 0) - (summary?.medicationAdherence?.taken || 0) }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell key="cell-0" fill="#10b981" />
                        <Cell key="cell-1" fill="#ef4444" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Help Requests Bar Chart */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Help Requests</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        { name: 'Total', value: summary?.helpRequests?.total || 0 },
                        { name: 'Emergencies', value: summary?.helpRequests?.emergencies || 0 },
                        { name: 'Completed', value: summary?.helpRequests?.completed || 0 },
                        { name: 'Pending', value: summary?.helpRequests?.pending || 0 }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#4f46e5">
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {activeTab === 'vitals' && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Vitals History</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Date</th>
                      <th className="text-left py-2">BP (S/D)</th>
                      <th className="text-left py-2">Heart Rate</th>
                      <th className="text-left py-2">Temperature</th>
                      <th className="text-left py-2">Oxygen</th>
                      <th className="text-left py-2">Weight</th>
                      <th className="text-left py-2">Blood Sugar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary?.dailyVitals?.map((vital, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-2">{vital.date}</td>
                        <td>{vital.systolic}/{vital.diastolic}</td>
                        <td>{vital.heartRate} bpm</td>
                        <td>{vital.temperature}°F</td>
                        <td>{vital.oxygen}%</td>
                        <td>{vital.weight || '-'} kg</td>
                        <td>{vital.bloodSugar || '-'} mg/dL</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'medications' && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Medication Adherence</h3>
              <div className="text-center py-8">
                <div className="text-6xl font-bold text-primary-600">{summary?.medicationAdherence?.percentage || 0}%</div>
                <p className="text-gray-600 mt-2">Overall Adherence Rate</p>
                <p className="text-sm text-gray-500 mt-4">
                  {summary?.medicationAdherence?.taken || 0} out of {summary?.medicationAdherence?.total || 0} doses taken
                </p>
              </div>
            </div>
          )}

          {activeTab === 'emergencies' && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Emergency Incidents</h3>
              {summary?.helpRequests?.emergencies > 0 ? (
                <p className="text-gray-600">{summary.helpRequests.emergencies} emergency incidents reported</p>
              ) : (
                <p className="text-gray-500 text-center py-8">No emergency incidents in this period</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthReports;