import React, { useState, useEffect } from 'react';
import UserLayout from '../../components/UserLayout';
import { ShoppingCart, Loader2, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const API_BASE = 'http://localhost:5000/api';

const Home = () => {
  const navigate = useNavigate();
  const { addToCart, library, fetchLibrary, fetchCart } = useApp();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch(`${API_BASE}/movies`);
        const data = await res.json();
        if (data.success) {
          setMovies(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch movies:', err);
      } finally {
        setLoading(false);
      }
    };
    
    // Refresh all data when landing on Home
    fetchMovies();
    if (fetchLibrary) fetchLibrary();
    if (fetchCart) fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPosterSrc = (path) => {
    if (!path) return 'https://via.placeholder.com/200x300?text=No+Poster';
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
  };
  return (
    <UserLayout pageTitle="Discover Movies">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="animate-spin mb-2" size={32} />
          <p className="text-sm">Loading movies...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {movies.map(movie => (
            <div key={movie.movie_id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
              <div className="aspect-[2/3] relative overflow-hidden cursor-pointer" onClick={() => navigate(`/user/movie/${movie.movie_id}`)}>
                <img src={getPosterSrc(movie.movie_poster)} alt={movie.movie_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-3">
                <h3 className="font-bold text-sm truncate" title={movie.movie_name}>{movie.movie_name}</h3>
                
                <div className="flex items-center justify-between mt-1 mb-2">
                  <div className="flex items-center text-xs text-yellow-500 font-bold">
                    <Star size={12} className="fill-yellow-400 text-yellow-400 mr-1" />
                    {movie.movie_rating ? `${movie.movie_rating}/5` : 'N/A'}
                  </div>
                  <div className="text-[10px] text-gray-400 font-medium">
                    {movie.movie_releasedate ? new Date(movie.movie_releasedate).toLocaleDateString() : ''}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                  <span className="text-figma-blue font-bold text-sm">${parseFloat(movie.movie_cost || 0).toFixed(2)}</span>
                  {!library.includes(movie.movie_id) ? (
                    <button 
                      onClick={(e) => { e.stopPropagation(); addToCart(movie.movie_id); }}
                      className="p-1.5 bg-figma-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <ShoppingCart size={14} />
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100">
                      คุณเป็นเจ้าของแล้ว
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {movies.length === 0 && (
            <div className="col-span-full py-10 text-center text-gray-500">
              No movies found.
            </div>
          )}
        </div>
      )}
    </UserLayout>
  );
};

export default Home;
