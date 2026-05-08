import React, { useState, useEffect } from 'react';
import UserLayout from '../../components/UserLayout';
import {
  User, Mail, Phone, Calendar, Edit2, Check, X, Loader2,
  Film, ListMusic, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:5000/api';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ libraryCount: 0, playlistCount: 0 });

  // Edit state
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', telephone: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');



  const getUser = () => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  };

  // ─── ดึงข้อมูล profile + stats ───
  useEffect(() => {
    const fetchData = async () => {
      const user = getUser();
      const token = localStorage.getItem('token');
      if (!user || !token) { navigate('/'); return; }

      setLoading(true);
      try {
        const [profileRes, libRes, plRes] = await Promise.all([
          fetch(`${API_BASE}/users/${user.user_id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/library/${user.user_id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/playlists/${user.user_id}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const [profileData, libData, plData] = await Promise.all([
          profileRes.json(), libRes.json(), plRes.json()
        ]);

        if (profileData.success) {
          setProfile(profileData.data);
          setForm({
            username: profileData.data.username || '',
            email: profileData.data.email || '',
            telephone: profileData.data.telephone || '',
          });
        }
        setStats({
          libraryCount: libData.success ? libData.data.length : 0,
          playlistCount: plData.success ? plData.data.length : 0,
        });
      } catch (err) {
        console.error('Fetch profile error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);



  // ─── บันทึกการแก้ไข ───
  const handleSave = async () => {
    const user = getUser();
    const token = localStorage.getItem('token');
    if (!user || !token) return;

    setSaving(true);
    setSaveError('');
    setSuccessMessage('');

    try {
      const res = await fetch(`${API_BASE}/users/${user.user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
        // อัพเดต localStorage
        localStorage.setItem('user', JSON.stringify({ ...user, username: data.data.username, telephone: data.data.telephone, email: data.data.email }));
        setEditing(false);
        setSuccessMessage('บันทึกข้อมูลสำเร็จ!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setSaveError(data.message || 'เกิดข้อผิดพลาด');
      }
    } catch {
      setSaveError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      username: profile?.username || '',
      email: profile?.email || '',
      telephone: profile?.telephone || '',
    });
    setSaveError('');
    setEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // ─── Avatar initials ───
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <UserLayout pageTitle="Profile">
        <div className="flex flex-col items-center justify-center py-32 text-gray-400">
          <Loader2 size={40} className="animate-spin mb-4" />
          <p>กำลังโหลด...</p>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout pageTitle="My Profile">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ─── Avatar + Name Card ─── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Banner */}
          <div className="h-28 bg-gradient-to-r from-figma-blue via-blue-500 to-indigo-500" />

          <div className="px-8 pb-6">
            {/* Row 1: Avatar (โผล่ขึ้น) + ปุ่ม (อยู่ขวา ชิด banner) */}
            <div className="flex items-start justify-between -mt-12">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                <div className="w-full h-full bg-gradient-to-br from-figma-blue to-indigo-500 flex items-center justify-center">
                  <span className="text-white text-3xl font-black">
                    {getInitials(profile?.username)}
                  </span>
                </div>
              </div>
              {/* ปุ่ม Edit/Save — อยู่ขวา ชิดล่าง banner */}
              <div className="flex gap-2 mt-auto pt-14">
              {editing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-figma-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 text-sm shadow-lg shadow-blue-200"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    บันทึก
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all active:scale-95 text-sm"
                  >
                    <X size={16} /> ยกเลิก
                  </button>
                </>
              ) : (
                <button
                    onClick={() => { setEditing(true); setSuccessMessage(''); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-blue-50 hover:text-figma-blue transition-all active:scale-95 text-sm"
                  >
                  <Edit2 size={16} /> แก้ไขข้อมูล
                </button>
              )}
            </div>
            </div>

            {/* Row 2: ชื่อ + Email — อยู่ใต้ Avatar ชัดเจน */}
            <div className="mt-3">
              <h2 className="text-2xl font-black text-gray-900 leading-tight">{profile?.username || '—'}</h2>
              <p className="text-sm text-gray-400 mt-0.5">{profile?.email || '—'}</p>
            </div>
          </div>
        </div>

        {/* ─── Success Banner ─── */}
        {successMessage && (
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-700 font-medium text-sm">
            <Check size={18} className="flex-shrink-0" />
            {successMessage}
          </div>
        )}

        {/* ─── Info Card ─── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6">ข้อมูลส่วนตัว</h3>

          {saveError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              {saveError}
            </div>
          )}

          <div className="space-y-5">
            {/* Username */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 text-figma-blue rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <User size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Username</p>
                {editing ? (
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-figma-blue focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium transition-all"
                    placeholder="ชื่อผู้ใช้"
                  />
                ) : (
                  <p className="text-gray-900 font-semibold">{profile?.username || '—'}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <Mail size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</p>
                {editing ? (
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-figma-blue focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium transition-all"
                    placeholder="อีเมล"
                  />
                ) : (
                  <p className="text-gray-900 font-semibold">{profile?.email || '—'}</p>
                )}
              </div>
            </div>

            {/* Telephone */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <Phone size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">เบอร์โทรศัพท์</p>
                {editing ? (
                  <input
                    type="tel"
                    value={form.telephone}
                    onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-figma-blue focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium transition-all"
                    placeholder="เบอร์โทรศัพท์"
                  />
                ) : (
                  <p className="text-gray-900 font-semibold">{profile?.telephone || '—'}</p>
                )}
              </div>
            </div>

            {/* Register Date (read-only) */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-orange-50 text-orange-400 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <Calendar size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">สมาชิกตั้งแต่</p>
                <p className="text-gray-900 font-semibold">
                  {profile?.register_date
                    ? new Date(profile.register_date).toLocaleDateString('th-TH', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })
                    : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Stats Card ─── */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/user/library')}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex items-center gap-4 hover:border-figma-blue hover:shadow-md transition-all group text-left"
          >
            <div className="w-12 h-12 bg-blue-50 text-figma-blue rounded-2xl flex items-center justify-center group-hover:bg-figma-blue group-hover:text-white transition-colors flex-shrink-0">
              <Film size={22} />
            </div>
            <div>
              <p className="text-3xl font-black text-gray-900">{stats.libraryCount}</p>
              <p className="text-sm text-gray-400 font-medium">หนังใน Library</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/user/playlists')}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex items-center gap-4 hover:border-figma-blue hover:shadow-md transition-all group text-left"
          >
            <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors flex-shrink-0">
              <ListMusic size={22} />
            </div>
            <div>
              <p className="text-3xl font-black text-gray-900">{stats.playlistCount}</p>
              <p className="text-sm text-gray-400 font-medium">Playlist</p>
            </div>
          </button>
        </div>

        {/* ─── Logout ─── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-colors"
          >
            <LogOut size={18} /> ออกจากระบบ
          </button>
        </div>

      </div>
    </UserLayout>
  );
};

export default Profile;
