import React from 'react';
import Layout from '../components/Layout';
import { MoreVertical, Plus, Search, Filter } from 'lucide-react';

const SystemReport = () => {
  return (
    <Layout pageTitle="System Report" pageDescription="Comprehensive analytics and system health.">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" 
              />
            </div>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
              <Filter size={18} />
            </button>
          </div>
          <button className="px-4 py-2 bg-figma-blue text-white rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95">
            <Plus size={18} />
            Add New
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                 <th className="px-6 py-4">Metric</th> <th className="px-6 py-4">Current Value</th> <th className="px-6 py-4">Trend</th> <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              
              <tr className="hover:bg-gray-50 transition-colors">
                 <td className="px-6 py-4 text-gray-600">API Latency</td> <td className="px-6 py-4 text-gray-600">120ms</td> <td className="px-6 py-4 text-gray-600">+5%</td> <td className="px-6 py-4 text-gray-600">Healthy</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                 <td className="px-6 py-4 text-gray-600">CPU Usage</td> <td className="px-6 py-4 text-gray-600">42%</td> <td className="px-6 py-4 text-gray-600">-2%</td> <td className="px-6 py-4 text-gray-600">Healthy</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                 <td className="px-6 py-4 text-gray-600">Error Rate</td> <td className="px-6 py-4 text-gray-600">0.04%</td> <td className="px-6 py-4 text-gray-600">0%</td> <td className="px-6 py-4 text-gray-600">Optimal</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default SystemReport;
