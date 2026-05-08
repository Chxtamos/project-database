import React, { useState, useEffect } from 'react';
import UserLayout from '../../components/UserLayout';
import { Plus, Play, Trash2, Loader2, ListMusic, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:5000/api';

const Playlists = () => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchPlaylists = async () => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userStr || !token) return;
    const user = JSON.parse(userStr);
    try {
      const res = await fetch(`${API_BASE}/playlists/${user.user_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setPlaylists(data.data);
    } catch (err) {
      console.error('Fetch playlists error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlaylists(); }, []);

  const createPlaylist = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userStr || !token) return;
    const user = JSON.parse(userStr);
    setCreating(true);
    try {
      const res = await fetch(`${API_BASE}/playlists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ user_id: user.user_id, playlist_name: newName.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setNewName('');
        setShowForm(false);
        fetchPlaylists();
      } else {
        alert(data.message || 'Failed to create playlist');
      }
    } catch (err) {
      console.error('Create playlist error:', err);
    } finally {
      setCreating(false);
    }
  };

  const deletePlaylist = async (playlistId) => {
    if (!window.confirm('ลบ playlist นี้ใช่ไหม?')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_BASE}/playlists/${playlistId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchPlaylists();
    } catch (err) {
      console.error('Delete playlist error:', err);
    }
  };

  return (
    <UserLayout pageTitle="My Playlists">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="animate-spin mb-2" size={32} />
          <p className="text-sm">Loading playlists...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map(pl => (
            <div
              key={pl.playlist_id}
              className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:border-figma-blue hover:shadow-md transition-all group"
            >
              {/* ไอคอน + ชื่อ + จำนวนหนัง */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-figma-blue text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 flex-shrink-0">
                  <Play size={22} fill="currentColor" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate">{pl.playlist_name}</h3>
                  <p className="text-sm text-gray-400">{pl.movie_count} เรื่อง</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/user/playlists/${pl.playlist_id}/watch`)}
                  disabled={Number(pl.movie_count) === 0}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-figma-blue text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Play size={15} fill="currentColor" />
                  Play
                </button>
                {/* ปุ่มจัดการหนัง (Edit Movies) */}
                <button
                  onClick={() => navigate(`/user/playlists/${pl.playlist_id}/edit`)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-figma-blue font-bold text-sm rounded-xl hover:bg-figma-blue hover:text-white transition-all active:scale-95"
                >
                  <Pencil size={15} />
                  จัดการหนัง
                </button>

                {/* ปุ่มลบ */}
                <button
                  onClick={() => deletePlaylist(pl.playlist_id)}
                  className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  title="ลบ playlist"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          {/* สร้าง playlist ใหม่ */}
          {showForm ? (
            <form onSubmit={createPlaylist} className="border-2 border-dashed border-figma-blue rounded-3xl p-6 flex flex-col gap-3">
              <input
                type="text"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none text-sm"
                placeholder="ชื่อ Playlist..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={creating || !newName.trim()}
                  className="flex-1 py-2 bg-figma-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 text-sm"
                >
                  {creating ? 'กำลังสร้าง...' : 'สร้าง'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setNewName(''); }}
                  className="px-4 py-2 text-gray-500 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="border-2 border-dashed border-gray-200 rounded-3xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-figma-blue hover:text-figma-blue transition-all group min-h-[130px]"
            >
              <Plus size={32} className="mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-medium">สร้าง Playlist ใหม่</span>
            </button>
          )}

          {playlists.length === 0 && !showForm && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400">
              <ListMusic size={48} className="mb-4 text-gray-200" />
              <p className="font-semibold text-lg text-gray-500">ยังไม่มี Playlist</p>
              <p className="text-sm mt-1">สร้าง Playlist แรกของคุณเพื่อเริ่มต้น</p>
            </div>
          )}
        </div>
      )}
    </UserLayout>
  );
};

export default Playlists;
