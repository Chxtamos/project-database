import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Users, Clapperboard, Eye, ArrowRight, Activity, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE = 'http://localhost:5000/api';

const Dashboard = () => {
  const [stats, setStats] = useState({ users: 0, movies: 0 });
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch Movies (for Trending section)
      const movieRes = await fetch(`${API_BASE}/dashboard/top-movies?limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const movieData = await movieRes.json();
      if (movieData.success) {
        setTrendingMovies(movieData.data);
      }

      // Fetch User Count (Requires token)
      const userRes = await fetch(`${API_BASE}/users?limit=1`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userData = await userRes.json();
      
      // Fetch Pending Payments
      const paymentRes = await fetch(`${API_BASE}/payments?status=0&limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const paymentData = await paymentRes.json();
      if (paymentData.success) {
        setPendingPayments(paymentData.data);
      }
      
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

  // Removed static pendingPayments array

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
                <div className="aspect-[2/3] w-full bg-gray-200 overflow-hidden relative">
                  <img src={getPosterSrc(movie.movie_poster)} alt={movie.movie_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2 leading-tight">{movie.movie_name}</h3>
                  <div className="mt-auto flex items-end justify-between pt-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      {movie.genres?.length
                        ? movie.genres.map(g => g.genre_name || g).slice(0, 1).join(', ')
                        : 'Movie'}
                    </span>
                    <span className="text-sm font-bold text-figma-blue">{movie.movie_rating || 'N/A'} ★</span>
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
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100 text-xs uppercase">
                <tr>
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingPayments.map((pay, idx) => (
                  <tr key={pay.payment_id || idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-600 font-medium">#{pay.payment_id}</td>
                    <td className="px-6 py-4 text-gray-600">{pay.username || pay.email}</td>
                    <td className="px-6 py-4 text-gray-600">${parseFloat(pay.amount).toFixed(2)}</td>
                    <td className="px-6 py-4 text-gray-600">{new Date(pay.payment_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-600">
                        Pending
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link to="/payments?status=Pending" className="p-2 text-figma-blue bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 font-medium">
                          <Eye size={16} /> View Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {pendingPayments.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                      No pending payments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
