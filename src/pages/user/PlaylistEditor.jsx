import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserLayout from '../../components/UserLayout';
import {
  ArrowLeft, Search, CheckSquare, Square, Save, Loader2,
  BookOpen, ListMusic, Check, Film, Pencil, X, ArrowUp, ArrowDown
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const PlaylistEditor = () => {
  const { id: playlistId } = useParams();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [libraryMovies, setLibraryMovies] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectedOrder, setSelectedOrder] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // ─── Rename state ───
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [renaming, setRenaming] = useState(false);
  const renameInputRef = useRef(null);

  // ─── ดึงข้อมูล playlist + library + movies ที่อยู่ใน playlist แล้ว ───
  const fetchAll = useCallback(async () => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userStr || !token) { navigate('/'); return; }
    const user = JSON.parse(userStr);

    setLoading(true);
    try {
      // ดึง playlists เพื่อหาชื่อ playlist
      const [libRes, plRes, plMoviesRes] = await Promise.all([
        fetch(`${API_BASE}/library/${user.user_id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/playlists/${user.user_id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/playlists/${playlistId}/movies`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const [libData, plData, plMoviesData] = await Promise.all([
        libRes.json(), plRes.json(), plMoviesRes.json()
      ]);

      if (libData.success) setLibraryMovies(libData.data);

      if (plData.success) {
        const found = plData.data.find(p => p.playlist_id === parseInt(playlistId));
        setPlaylist(found || null);
      }

      if (plMoviesData.success) {
        const orderedIds = plMoviesData.data.map(m => m.movie_id);
        setSelectedIds(new Set(orderedIds));
        setSelectedOrder(orderedIds);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [playlistId, navigate]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ─── Toggle เลือก/ยกเลิก movie ───
  const toggle = (movieId) => {
    setSaved(false);
    const isSelected = selectedIds.has(movieId);

    setSelectedIds(prev => {
      const next = new Set(prev);
      if (isSelected) next.delete(movieId);
      else next.add(movieId);
      return next;
    });

    setSelectedOrder(order => (
      isSelected
        ? order.filter(id => id !== movieId)
        : order.includes(movieId) ? order : [...order, movieId]
    ));
  };

  const moveSelected = (movieId, direction) => {
    setSaved(false);
    setSelectedOrder(order => {
      const index = order.indexOf(movieId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= order.length) return order;
      const next = [...order];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  // ─── Select All / Deselect All ───
  const toggleAll = () => {
    if (selectedIds.size === libraryMovies.length) {
      setSelectedIds(new Set());
      setSelectedOrder([]);
    } else {
      const allIds = libraryMovies.map(m => m.movie_id);
      setSelectedIds(new Set(allIds));
      setSelectedOrder(allIds);
    }
    setSaved(false);
  };

  // ─── บันทึก playlist ───
  const handleSave = async () => {
    const token = localStorage.getItem('token');
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/playlists/${playlistId}/movies/sync`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ movie_ids: [...new Set(selectedOrder)] })
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        // reset saved indicator หลัง 2 วิ
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert(data.message || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setSaving(false);
    }
  };

  // ─── กรอง library ตาม search ───
  const filtered = libraryMovies.filter(m =>
    m.movie_name?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedMovies = selectedOrder
    .map(movieId => libraryMovies.find(movie => movie.movie_id === movieId))
    .filter(Boolean);

  const getPosterSrc = (path) => {
    if (!path) return 'https://via.placeholder.com/80x120?text=?';
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
  };

  // ─── เริ่ม rename mode ───
  const startRename = () => {
    setRenameValue(playlist?.playlist_name || '');
    setIsRenaming(true);
    setTimeout(() => renameInputRef.current?.select(), 50);
  };

  // ─── ยกเลิก rename ───
  const cancelRename = () => {
    setIsRenaming(false);
    setRenameValue('');
  };

  // ─── บันทึกชื่อใหม่ ───
  const handleRename = async (e) => {
    e?.preventDefault();
    const newName = renameValue.trim();
    if (!newName || newName === playlist?.playlist_name) { cancelRename(); return; }
    const token = localStorage.getItem('token');
    setRenaming(true);
    try {
      const res = await fetch(`${API_BASE}/playlists/${playlistId}/rename`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ playlist_name: newName })
      });
      const data = await res.json();
      if (data.success) {
        setPlaylist(prev => ({ ...prev, playlist_name: newName }));
        setIsRenaming(false);
      } else {
        alert(data.message || 'เปลี่ยนชื่อไม่สำเร็จ');
      }
    } catch {
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setRenaming(false);
    }
  };

  // ─── Loading state ───
  if (loading) {
    return (
      <UserLayout pageTitle="Edit Playlist">
        <div className="flex flex-col items-center justify-center py-32 text-gray-400">
          <Loader2 size={40} className="animate-spin mb-4" />
          <p>กำลังโหลด...</p>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout pageTitle={playlist ? `Edit: ${playlist.playlist_name}` : 'Edit Playlist'}>
      {/* ─── Header ─── */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/user/playlists')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors font-medium"
        >
          <ArrowLeft size={18} /> กลับ
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-figma-blue text-white rounded-xl flex items-center justify-center shadow-md shadow-blue-100 flex-shrink-0">
              <ListMusic size={20} />
            </div>
            <div className="flex-1 min-w-0">
              {isRenaming ? (
                /* ─── Inline Rename Form ─── */
                <form onSubmit={handleRename} className="flex items-center gap-2">
                  <input
                    ref={renameInputRef}
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    className="flex-1 min-w-0 text-xl font-black px-3 py-1.5 border-2 border-figma-blue rounded-xl outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                    maxLength={80}
                    autoFocus
                    onKeyDown={(e) => e.key === 'Escape' && cancelRename()}
                  />
                  <button
                    type="submit"
                    disabled={renaming || !renameValue.trim()}
                    className="p-2 bg-figma-blue text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                    title="บันทึกชื่อ"
                  >
                    {renaming ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  </button>
                  <button
                    type="button"
                    onClick={cancelRename}
                    className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
                    title="ยกเลิก"
                  >
                    <X size={16} />
                  </button>
                </form>
              ) : (
                /* ─── Display Name + Edit Button ─── */
                <div className="flex items-center gap-2 group/rename">
                  <h1 className="text-2xl font-black text-gray-900 truncate">
                    {playlist?.playlist_name || 'Playlist'}
                  </h1>
                  <button
                    onClick={startRename}
                    className="p-1.5 text-gray-300 hover:text-figma-blue hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover/rename:opacity-100"
                    title="เปลี่ยนชื่อ"
                  >
                    <Pencil size={15} />
                  </button>
                </div>
              )}
              <p className="text-sm text-gray-400 mt-0.5">
                เลือก {selectedIds.size} จาก {libraryMovies.length} เรื่อง
              </p>
            </div>
          </div>
        </div>

        {/* ปุ่ม Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-6 py-3 font-bold rounded-2xl transition-all active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
            saved
              ? 'bg-green-500 text-white shadow-green-200'
              : 'bg-figma-blue text-white shadow-blue-200 hover:bg-blue-700'
          }`}
        >
          {saving ? (
            <><Loader2 size={18} className="animate-spin" /> กำลังบันทึก...</>
          ) : saved ? (
            <><Check size={18} /> บันทึกแล้ว!</>
          ) : (
            <><Save size={18} /> บันทึก Playlist</>
          )}
        </button>
      </div>

      {/* ─── Empty Library ─── */}
      {libraryMovies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <BookOpen size={56} className="mb-4 text-gray-200" />
          <p className="font-semibold text-xl text-gray-500">Library ของคุณยังว่างอยู่</p>
          <p className="text-sm mt-2 mb-6">ซื้อหนังก่อนเพื่อเพิ่มเข้า Playlist</p>
          <button
            onClick={() => navigate('/user/home')}
            className="px-6 py-3 bg-figma-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95"
          >
            ดูหนัง
          </button>
        </div>
      ) : (
        <>
          {/* ─── Search + Toolbar ─── */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="ค้นหาหนัง..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-figma-blue outline-none text-sm shadow-sm"
              />
            </div>
            <button
              onClick={toggleAll}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:border-figma-blue hover:text-figma-blue transition-all shadow-sm"
            >
              {selectedIds.size === libraryMovies.length
                ? <><Square size={16} /> ยกเลิกทั้งหมด</>
                : <><CheckSquare size={16} /> เลือกทั้งหมด</>
              }
            </button>
          </div>

          {/* ─── Stats Bar ─── */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
            <Film size={18} className="text-figma-blue flex-shrink-0" />
            <p className="text-sm text-blue-700 font-medium">
              เลือกแล้ว <span className="font-black text-figma-blue">{selectedIds.size}</span> เรื่อง
              จากทั้งหมด <span className="font-black">{libraryMovies.length}</span> เรื่องใน Library
            </p>
            {selectedIds.size > 0 && (
              <button
                onClick={() => { setSelectedIds(new Set()); setSelectedOrder([]); setSaved(false); }}
                className="ml-auto text-xs text-blue-500 hover:text-blue-700 font-bold underline underline-offset-2"
              >
                ล้างทั้งหมด
              </button>
            )}
          </div>

          {/* ─── Movie Grid ─── */}
          {selectedMovies.length > 0 && (
            <div className="mb-6 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-gray-900">ลำดับใน Playlist</h2>
                  <p className="text-xs text-gray-400">ขยับขึ้นลงเพื่อจัดเรียงเป็น 1, 2, 3, 4 ก่อนบันทึก</p>
                </div>
                <span className="text-xs font-bold text-figma-blue bg-blue-50 px-3 py-1 rounded-full">
                  {selectedMovies.length} เรื่อง
                </span>
              </div>
              <div className="divide-y divide-gray-100">
                {selectedMovies.map((movie, index) => (
                  <div key={movie.movie_id} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-figma-blue text-white flex items-center justify-center text-sm font-black">
                      {index + 1}
                    </div>
                    <img src={getPosterSrc(movie.movie_poster)} alt={movie.movie_name} className="w-10 h-14 object-cover rounded-lg bg-gray-100" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{movie.movie_name}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveSelected(movie.movie_id, -1)}
                        disabled={index === 0}
                        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-figma-blue hover:border-blue-200 disabled:opacity-30 disabled:hover:text-gray-500 disabled:hover:border-gray-200"
                        title="เลื่อนขึ้น"
                      >
                        <ArrowUp size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSelected(movie.movie_id, 1)}
                        disabled={index === selectedMovies.length - 1}
                        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-figma-blue hover:border-blue-200 disabled:opacity-30 disabled:hover:text-gray-500 disabled:hover:border-gray-200"
                        title="เลื่อนลง"
                      >
                        <ArrowDown size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggle(movie.movie_id)}
                        className="p-2 rounded-lg border border-red-100 bg-red-50 text-red-500 hover:bg-red-100"
                        title="เอาออกจาก playlist"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Search size={40} className="mx-auto mb-3 text-gray-200" />
              <p className="font-medium">ไม่พบหนังที่ค้นหา</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filtered.map(movie => {
                const isSelected = selectedIds.has(movie.movie_id);
                const orderNumber = selectedOrder.indexOf(movie.movie_id) + 1;
                return (
                  <button
                    key={movie.movie_id}
                    onClick={() => toggle(movie.movie_id)}
                    className={`group relative rounded-2xl overflow-hidden border-2 transition-all duration-200 text-left shadow-sm hover:shadow-md ${
                      isSelected
                        ? 'border-figma-blue ring-2 ring-figma-blue ring-offset-1 shadow-blue-100'
                        : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    {/* Poster */}
                    <div className="aspect-[2/3] relative overflow-hidden bg-gray-100">
                      <img
                        src={getPosterSrc(movie.movie_poster)}
                        alt={movie.movie_name}
                        className={`w-full h-full object-cover transition-transform duration-300 ${
                          isSelected ? 'brightness-90' : 'group-hover:scale-105'
                        }`}
                      />
                      {/* Overlay เมื่อ selected */}
                      <div className={`absolute inset-0 bg-figma-blue/20 transition-opacity duration-200 ${
                        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-30'
                      }`} />

                      {/* Checkbox indicator */}
                      <div className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
                        isSelected
                          ? 'bg-figma-blue text-white scale-110'
                          : 'bg-white/80 text-gray-400 group-hover:bg-white'
                      }`}>
                        {isSelected ? <Check size={14} strokeWidth={3} /> : <Square size={14} />}
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white text-figma-blue flex items-center justify-center text-xs font-black shadow-lg">
                          {orderNumber}
                        </div>
                      )}
                    </div>

                    {/* Movie name */}
                    <div className={`p-2.5 transition-colors ${isSelected ? 'bg-blue-50' : 'bg-white'}`}>
                      <p className={`text-xs font-bold truncate leading-tight ${
                        isSelected ? 'text-figma-blue' : 'text-gray-700'
                      }`}>
                        {movie.movie_name}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* ─── Bottom Save Bar (sticky) ─── */}
          {selectedIds.size > 0 && (
            <div className="sticky bottom-6 mt-8 flex justify-center">
              <div className="bg-white/90 backdrop-blur border border-gray-200 shadow-2xl rounded-3xl px-6 py-4 flex items-center gap-6">
                <p className="text-sm font-medium text-gray-600">
                  <span className="font-black text-gray-900 text-lg">{selectedIds.size}</span> เรื่องที่เลือก
                </p>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`flex items-center gap-2 px-8 py-3 font-bold rounded-2xl transition-all active:scale-95 disabled:opacity-50 ${
                    saved
                      ? 'bg-green-500 text-white'
                      : 'bg-figma-blue text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                  }`}
                >
                  {saving ? (
                    <><Loader2 size={16} className="animate-spin" /> กำลังบันทึก...</>
                  ) : saved ? (
                    <><Check size={16} /> บันทึกแล้ว!</>
                  ) : (
                    <><Save size={16} /> บันทึก Playlist</>
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </UserLayout>
  );
};

export default PlaylistEditor;
