import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { Pencil, Trash2, Plus, Search, Filter } from 'lucide-react';

const ManageUsers = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ username: '', email: '', plan: 'Basic', password: '', telephone: '' });

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/users?limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (idx) => {
    setSelectedId(idx);
    const user = users[idx];
    setFormData({ username: user.username, email: user.email, plan: user.plan || 'Basic', telephone: user.telephone || '', password: '' });
    setIsEditOpen(true);
  };

  const handleDelete = (idx) => {
    setSelectedId(idx);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const userToDelete = users[selectedId];
      await fetch(`http://localhost:5000/api/users/${userToDelete.user_id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchUsers();
      setIsDeleteOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`http://localhost:5000/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          telephone: formData.telephone || '0000000000',
          password: formData.password
        })
      });
      fetchUsers();
      setIsAddOpen(false);
      setFormData({ username: '', email: '', plan: 'Basic', password: '', telephone: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const userToEdit = users[selectedId];
      await fetch(`http://localhost:5000/api/users/${userToEdit.user_id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          plan: formData.plan,
          telephone: formData.telephone
        })
      });
      fetchUsers();
      setIsEditOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.plan && u.plan.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Layout pageTitle="Manage User Overview" pageDescription="Administrative control of user accounts.">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" 
              />
            </div>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
              <Filter size={18} />
            </button>
          </div>
          <button onClick={() => setIsAddOpen(true)} className="px-4 py-2 bg-figma-blue text-white rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95">
            <Plus size={18} />
            Add User
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">User Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user, idx) => (
                <tr key={user.user_id || idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-600 font-medium cursor-pointer hover:text-figma-blue" onClick={() => handleEdit(idx)}>{user.username}</td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-gray-600">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.plan === 'Enterprise' ? 'bg-purple-100 text-purple-700' :
                      user.plan === 'Premium' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {user.plan || 'Basic'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.register_date ? new Date(user.register_date).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(idx)} className="p-2 text-figma-blue bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 font-medium">
                        <Pencil size={16} /> Edit
                      </button>
                      <button onClick={() => handleDelete(idx)} className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1 font-medium">
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New User">
        <form className="space-y-4" onSubmit={handleAddSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">User Name</label>
            <input type="text" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" placeholder="Enter username..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" placeholder="email@example.com" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">User Plan</label>
            <select value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm">
              <option value="Basic">Basic</option>
              <option value="Premium">Premium</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-figma-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200">Save User</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit User Profile">
        <form className="space-y-4" onSubmit={handleEditSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">User Name</label>
            <input type="text" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Password (Leave blank to keep current)</label>
            <input type="password" disabled value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm cursor-not-allowed" placeholder="Cannot update here" />
            <p className="text-xs text-gray-400 mt-1">Passwords are securely hashed in the database and cannot be changed here.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">User Plan</label>
            <select value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm">
              <option value="Basic">Basic</option>
              <option value="Premium">Premium</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-figma-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200">Update User</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={confirmDelete} title="Delete User" message="Are you sure you want to remove this user from the system? This action cannot be undone." />
    </Layout>
  );
};

export default ManageUsers;
