import React from 'react';
import Layout from '../components/Layout';
import { Users, TrendingUp, PlayCircle, DollarSign } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <Layout pageTitle="Dashboard" pageDescription="Overview of streaming metrics and financial status.">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Users" value="1,284" icon={Users} color="bg-blue-500" />
        <StatCard title="Active Subscriptions" value="856" icon={TrendingUp} color="bg-green-500" />
        <StatCard title="Total Streams" value="42.5K" icon={PlayCircle} color="bg-purple-500" />
        <StatCard title="Monthly Revenue" value="$12,450" icon={DollarSign} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col min-h-[320px]">
          <h3 className="text-lg font-bold mb-4">Revenue Growth</h3>
          <div className="flex-1 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
            Chart Placeholder (Enterprise Grade)
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold mb-4">Top Movies</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-14 bg-gray-200 rounded-md overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${i}`} alt="movie" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm font-medium">Movie Title {i}</span>
                </div>
                <span className="text-xs font-bold text-gray-500">{(Math.random()*10).toFixed(1)}M</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
