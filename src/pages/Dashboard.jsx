import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Users, Clapperboard, Eye, ArrowRight, Activity, Loader2, UserPlus, Film, CalendarDays, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE = 'http://localhost:5000/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    movies: 0,
    newUsersToday: 0,
    newUsersMonth: 0,
    newUsersYear: 0,
    onlineUsers: 0,
    newMoviesToday: 0,
    newMoviesMonth: 0,
    newMoviesYear: 0,
  });
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch Overall Stats (for Total Users and Total Movies)
      const statsRes = await fetch(`${API_BASE}/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats({
          users: statsData.data.total_users || 0,
          movies: statsData.data.total_movies || 0,
          newUsersToday: statsData.data.new_users_today || 0,
          newUsersMonth: statsData.data.new_users_month || 0,
          newUsersYear: statsData.data.new_users_year || 0,
          onlineUsers: statsData.data.online_users || 0,
          newMoviesToday: statsData.data.new_movies_today || 0,
          newMoviesMonth: statsData.data.new_movies_month || 0,
          newMoviesYear: statsData.data.new_movies_year || 0,
        });
      }

      // Fetch Movies (for Trending section)
      const movieRes = await fetch(`${API_BASE}/dashboard/top-movies?limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const movieData = await movieRes.json();
      if (movieData.success) {
        setTrendingMovies(movieData.data);
      }
      
      // Fetch Pending Payments
      const paymentRes = await fetch(`${API_BASE}/payments?status=0&limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const paymentData = await paymentRes.json();
      if (paymentData.success) {
        setPendingPayments(paymentData.data);
      }
      
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5 mb-10">
        <StatCard icon={Users} label="Total Users" value={stats.users} tone="blue" />
        <StatCard icon={UserCheck} label="User Online Now" value={stats.onlineUsers} tone="green" />
        <StatCard icon={Clapperboard} label="Total Movies" value={stats.movies} tone="slate" />
        <PeriodCard icon={UserPlus} label="New Users" today={stats.newUsersToday} month={stats.newUsersMonth} year={stats.newUsersYear} />
        <PeriodCard icon={Film} label="New Movies" today={stats.newMoviesToday} month={stats.newMoviesMonth} year={stats.newMoviesYear} />
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
                    <span className="text-sm font-bold text-yellow-500">{movie.movie_rating || 'N/A'} ★</span>
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
                    <td className="px-6 py-4 text-gray-600">฿{parseFloat(pay.amount).toFixed(2)}</td>
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

const StatCard = ({ icon: Icon, label, value, tone }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 min-h-[126px]">
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
      tone === 'blue'
        ? 'bg-blue-50 text-figma-blue'
        : tone === 'green'
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-gray-100 text-gray-600'
    }`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-black text-gray-900">{Number(value || 0).toLocaleString()}</p>
    </div>
  </div>
);

const PeriodCard = ({ icon: Icon, label, today, month, year }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm min-h-[126px]">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
        <Icon size={20} />
      </div>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</p>
    </div>
    <div className="grid grid-cols-3 gap-2">
      {[
        ['Today', today],
        ['Month', month],
        ['Year', year],
      ].map(([title, count]) => (
        <div key={title} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
          <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase">
            <CalendarDays size={11} /> {title}
          </div>
          <p className="text-xl font-black text-gray-900 mt-1">{Number(count || 0).toLocaleString()}</p>
        </div>
      ))}
    </div>
  </div>
);

export default Dashboard;
