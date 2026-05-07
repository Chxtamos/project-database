import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Users, Clapperboard, Eye, ArrowRight, Activity, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE = 'http://localhost:5000/api';

const Dashboard = () => {
  const [stats, setStats] = useState({ users: 0, movies: 0 });
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = async () => {
    try {
      // Fetch Movies (for Trending section)
      const movieRes = await fetch(`${API_BASE}/movies?limit=5`);
      const movieData = await movieRes.json();
      if (movieData.success) {
        setTrendingMovies(movieData.data);
      }

      // Fetch User Count (Requires token)
      const token = localStorage.getItem('token');
      const userRes = await fetch(`${API_BASE}/users?limit=1`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userData = await userRes.json();
      
      setStats({
        users: userData.total || 0,
        movies: movieData.total || 0,
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  const pendingPayments = [
    { id: "#PAY-7829", user: "alice.smith@example.com", amount: "$14.99", date: "Oct 24, 2026", status: "Pending" },
    { id: "#PAY-7830", user: "bob.jones@example.com", amount: "$4.99", date: "Oct 24, 2026", status: "Pending" },
    { id: "#PAY-7831", user: "charlie.brown@example.com", amount: "$29.99", date: "Oct 23, 2026", status: "Pending" },
  ];

  const getPosterSrc = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_BASE.replace('/api', '')}${path}`;
  };

  return (
    <Layout pageTitle="Dashboard" pageDescription="Overview of streaming metrics and financial status.">
      <div className="flex justify-end mb-4">
        <span className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
          <Activity size={14} className="animate-pulse" />
          Real-time Sync (Database Connected: {lastUpdated.toLocaleTimeString()})
        </span>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-lg bg-blue-50 flex items-center justify-center">
            <Users className="text-figma-blue" size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Users</p>
            <p className="text-3xl font-black text-gray-900">{stats.users.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center">
            <Clapperboard className="text-gray-500" size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Movies</p>
            <p className="text-3xl font-black text-gray-900">{stats.movies.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Top 5 Trending Movies */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Top 5 Trending Movies Now</h2>
          <Link to="/report" className="text-figma-blue font-bold text-sm hover:underline">View Analytics</Link>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p className="text-sm">Fetching movies...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {trendingMovies.map((movie) => (
              <div key={movie.movie_id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col group cursor-pointer hover:shadow-md transition-shadow">
                <div className="h-48 bg-gray-200 overflow-hidden relative">
                  <img src={getPosterSrc(movie.movie_poster)} alt={movie.movie_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2 leading-tight">{movie.movie_name}</h3>
                  <div className="mt-auto flex items-end justify-between pt-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      {movie.genres ? movie.genres.map(g => g.genre_name).slice(0,1) : 'Movie'}
                    </span>
                    <span className="text-sm font-bold text-figma-blue">${movie.movie_cost}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Payments */}
      <div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Pending Payments</h2>
            <Link to="/payments?status=Pending" className="text-figma-blue font-bold text-sm flex items-center gap-1 hover:underline">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200 text-xs uppercase">
                <tr>
                  <th className="px-6 py-4">Payment ID</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingPayments.map((pay, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{pay.id}</td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{pay.user}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{pay.amount}</td>
                    <td className="px-6 py-4 text-gray-500">{pay.date}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs font-bold bg-orange-100 text-orange-700 rounded-full">
                        {pay.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="p-1.5 text-gray-400 hover:text-figma-blue hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
