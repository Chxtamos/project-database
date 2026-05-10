import React, { useState, useEffect } from 'react';
import UserLayout from '../../components/UserLayout';
import { Heart, Loader2, BookOpen, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:5000/api';

const Library = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLibrary = async () => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userStr || !token) return;
    const user = JSON.parse(userStr);
    try {
      const res = await fetch(`${API_BASE}/library/${user.user_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const sortedData = data.data.sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));
        setMovies(sortedData);
      }
    } catch (err) {
      console.error('Fetch library error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLibrary(); }, []);

  const toggleFavorite = async (libraryId) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_BASE}/library/${libraryId}/favorite`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchLibrary();
    } catch (err) {
      console.error('Toggle favorite error:', err);
    }
  };

  const getPosterSrc = (path) => {
    if (!path) return 'https://via.placeholder.com/200x300?text=No+Poster';
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
  };

  return (
    <UserLayout pageTitle="My Library">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="animate-spin mb-2" size={32} />
          <p className="text-sm">Loading library...</p>
        </div>
      ) : movies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <BookOpen size={48} className="mb-4 text-gray-200" />
          <p className="font-semibold text-lg text-gray-500">Your library is empty</p>
          <p className="text-sm mt-1">Purchase movies to add them to your library.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {movies.map(movie => (
            <div key={movie.library_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
              <div className="aspect-[2/3] relative overflow-hidden cursor-pointer" onClick={() => navigate(`/user/movie/${movie.movie_id}`)}>
                <img
                  src={getPosterSrc(movie.movie_poster)}
                  alt={movie.movie_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/user/watch/${movie.movie_id}`); }}
                    className="p-3 rounded-full bg-figma-blue text-white shadow-xl hover:scale-110 transition-transform"
                    title="Watch movie"
                  >
                    <Play size={20} fill="currentColor" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(movie.library_id); }}
                    className={`p-2 rounded-full shadow-xl hover:scale-110 transition-transform ${
                      movie.favorite ? 'bg-red-500 text-white' : 'bg-white text-gray-600'
                    }`}
                    title={movie.favorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart size={20} fill={movie.favorite ? 'currentColor' : 'none'} />
                  </button>
                </div>
                {movie.favorite && (
                  <div className="absolute top-2 right-2">
                    <Heart size={16} className="text-red-500 fill-red-500 drop-shadow" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-bold text-sm truncate">{movie.movie_name}</h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </UserLayout>
  );
};

export default Library;
