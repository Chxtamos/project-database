import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import UserLayout from '../../components/UserLayout';
import { Loader2 } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const PlaylistWatchRedirect = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Loading playlist...');

  useEffect(() => {
    const loadFirstMovie = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${API_BASE}/playlists/${id}/movies`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          navigate(`/user/watch/${data.data[0].movie_id}?playlist=${id}`, { replace: true });
          return;
        }
        setMessage('This playlist has no movies.');
      } catch (err) {
        console.error('Load playlist player error:', err);
        setMessage('Cannot load playlist.');
      }
    };

    loadFirstMovie();
  }, [id, navigate]);

  return (
    <UserLayout pageTitle="Play Playlist">
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <Loader2 className="animate-spin mb-3" size={36} />
        <p>{message}</p>
      </div>
    </UserLayout>
  );
};

export default PlaylistWatchRedirect;
