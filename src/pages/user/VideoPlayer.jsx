import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import UserLayout from '../../components/UserLayout';
import { ArrowLeft, Loader2, Play, SkipBack, SkipForward, VideoOff } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const getPosterSrc = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `http://localhost:5000${path}`;
};

const getEmbedUrl = (url) => {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace('/', '');
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    if (parsed.hostname.includes('vimeo.com')) {
      // https://vimeo.com/12345678 -> https://player.vimeo.com/video/12345678
      const id = parsed.pathname.replace('/', '');
      return id ? `https://player.vimeo.com/video/${id}` : url;
    }
    return url;
  } catch {
    return url;
  }
};

const isIframeVideo = (url) => {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
};

const VideoPlayer = () => {
  const { movieId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const playlistId = searchParams.get('playlist');

  const [movie, setMovie] = useState(null);
  const [playlistMovies, setPlaylistMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      setLoading(true);
      try {
        const movieReq = fetch(`${API_BASE}/movies/${movieId}`);
        const playlistReq = playlistId
          ? fetch(`${API_BASE}/playlists/${playlistId}/movies`, { headers })
          : null;

        const [movieRes, playlistRes] = await Promise.all([movieReq, playlistReq]);
        const movieData = await movieRes.json();
        if (movieData.success) setMovie(movieData.data);

        if (playlistRes) {
          const playlistData = await playlistRes.json();
          if (playlistData.success) setPlaylistMovies(playlistData.data);
        }
      } catch (err) {
        console.error('Fetch player data error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [movieId, playlistId]);

  const currentIndex = useMemo(
    () => playlistMovies.findIndex(item => Number(item.movie_id) === Number(movieId)),
    [playlistMovies, movieId]
  );
  const previousMovie = currentIndex > 0 ? playlistMovies[currentIndex - 1] : null;
  const nextMovie = currentIndex >= 0 && currentIndex < playlistMovies.length - 1 ? playlistMovies[currentIndex + 1] : null;

  const goToMovie = (target) => {
    if (!target) return;
    navigate(`/user/watch/${target.movie_id}${playlistId ? `?playlist=${playlistId}` : ''}`);
  };

  if (loading) {
    return (
      <UserLayout pageTitle="Watch Movie">
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <Loader2 className="animate-spin mb-3" size={36} />
          <p>Loading video...</p>
        </div>
      </UserLayout>
    );
  }

  if (!movie) {
    return (
      <UserLayout pageTitle="Watch Movie">
        <div className="text-center py-24 text-gray-500 font-bold">Movie not found.</div>
      </UserLayout>
    );
  }

  const videoUrl = movie.video_url;
  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <UserLayout pageTitle={movie.movie_name}>
      <div className="space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-sm"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="bg-black rounded-3xl overflow-hidden shadow-2xl border border-gray-900">
          <div className="aspect-video flex items-center justify-center">
            {!videoUrl ? (
              <div className="text-center text-gray-400 p-10">
                <VideoOff size={48} className="mx-auto mb-4" />
                <p className="font-bold text-lg">No video link for this movie.</p>
                <p className="text-sm mt-1">Please ask admin to add a video link in Edit Movie.</p>
              </div>
            ) : isIframeVideo(videoUrl) ? (
              <iframe
                title={movie.movie_name}
                src={embedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                key={videoUrl}
                src={videoUrl}
                poster={getPosterSrc(movie.movie_poster)}
                controls
                className="w-full h-full bg-black"
              />
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-black text-gray-900">{movie.movie_name}</h1>
            {movie.detail && movie.detail !== '-' && (
              <p className="mt-3 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{movie.detail}</p>
            )}
          </div>

          {playlistId && playlistMovies.length > 0 && (
            <div className="w-full lg:w-80 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <p className="font-black text-gray-900">Playlist</p>
                <span className="text-xs font-bold text-figma-blue bg-blue-50 px-2 py-1 rounded-full">
                  {currentIndex + 1}/{playlistMovies.length}
                </span>
              </div>
              <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
                {playlistMovies.map((item, index) => {
                  const active = Number(item.movie_id) === Number(movieId);
                  return (
                    <button
                      type="button"
                      key={item.movie_id}
                      onClick={() => goToMovie(item)}
                      className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-colors ${
                        active ? 'bg-blue-50 text-figma-blue' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                        active ? 'bg-figma-blue text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="flex-1 truncate text-sm font-bold">{item.movie_name}</span>
                      {active && <Play size={14} fill="currentColor" />}
                    </button>
                  );
                })}
              </div>
              <div className="p-3 border-t border-gray-100 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => goToMovie(previousMovie)}
                  disabled={!previousMovie}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 disabled:opacity-40"
                >
                  <SkipBack size={15} /> Prev
                </button>
                <button
                  type="button"
                  onClick={() => goToMovie(nextMovie)}
                  disabled={!nextMovie}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-figma-blue text-white text-sm font-bold disabled:opacity-40"
                >
                  Next <SkipForward size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
};

export default VideoPlayer;
