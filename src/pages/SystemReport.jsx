import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Search, Filter, Download, FileText, FileSpreadsheet } from 'lucide-react';

const SystemReport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const reports = [
    { metric: "Top 5 Trending Movies Now", value: "Neon Horizon, Silent Echoes, +3 others", trend: "+15,200 USD", status: "Trending" },
    { metric: "Total Platform Revenue (YTD)", value: "$1,245,000", trend: "+15% YoY", status: "Excellent" },
    { metric: "Monthly Active Users (MAU)", value: "12,480 users", trend: "+8.5%", status: "Good" },
    { metric: "Total Subscriptions (Premium)", value: "4,250 (89% ratio)", trend: "+120 this week", status: "Growth" },
    { metric: "System Server Uptime", value: "99.98%", trend: "Stable", status: "Healthy" },
  ];

  const filteredReports = reports.filter(r => 
    r.metric.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout pageTitle="System Reports" pageDescription="Detailed business analytics and performance metrics.">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search reports..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" 
              />
            </div>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
              <Filter size={18} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-red-100 transition-all active:scale-95">
              <FileText size={18} />
              Export PDF
            </button>
            <button className="px-4 py-2 bg-green-50 text-green-600 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-green-100 transition-all active:scale-95">
              <FileSpreadsheet size={18} />
              Export Excel
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Report Metric</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4">Trend</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReports.map((report, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-800 font-medium">{report.metric}</td>
                  <td className="px-6 py-4 text-gray-600">{report.value}</td>
                  <td className={`px-6 py-4 font-medium ${report.trend.startsWith('+') ? 'text-green-500' : report.trend.startsWith('-') ? 'text-red-500' : 'text-gray-500'}`}>
                    {report.trend}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      report.status === 'Excellent' ? 'bg-green-100 text-green-600' : 
                      report.status === 'Good' ? 'bg-blue-100 text-blue-600' : 
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default SystemReport;
