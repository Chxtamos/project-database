import React, { useState } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { Pencil, Trash2, Plus, Search, Filter } from 'lucide-react';

const ManageUsers = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [users, setUsers] = useState([
    { name: "Admin User", email: "admin@movie.com", plan: "Enterprise", date: "2026-01-01", password: "hashed_password" },
    { name: "John Doe", email: "john@movie.com", plan: "Basic", date: "2026-02-15", password: "hashed_password" },
    { name: "Jane Smith", email: "jane@movie.com", plan: "Premium", date: "2026-03-10", password: "hashed_password" },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', plan: 'Basic', password: '' });

  const handleEdit = (idx) => {
    setSelectedId(idx);
    setFormData({ ...users[idx], password: '' }); // Don't show real password hash
    setIsEditOpen(true);
  };

  const handleDelete = (idx) => {
    setSelectedId(idx);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    setUsers(users.filter((_, i) => i !== selectedId));
    setIsDeleteOpen(false);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const newUser = { ...formData, date: new Date().toISOString().split('T')[0], password: 'hashed_password' };
    setUsers([newUser, ...users]);
    setIsAddOpen(false);
    setFormData({ name: '', email: '', plan: 'Basic', password: '' });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const newUsers = [...users];
    const existing = newUsers[selectedId];
    newUsers[selectedId] = { ...formData, date: existing.date, password: formData.password ? 'hashed_password' : existing.password };
    setUsers(newUsers);
    setIsEditOpen(false);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.plan.toLowerCase().includes(searchTerm.toLowerCase())
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
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-600 font-medium cursor-pointer hover:text-figma-blue" onClick={() => handleEdit(idx)}>{user.name}</td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-gray-600">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.plan === 'Enterprise' ? 'bg-purple-100 text-purple-700' :
                      user.plan === 'Premium' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.date}</td>
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
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" placeholder="Enter full name..." />
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
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <input type="text" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Password (Leave blank to keep current)</label>
            <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" placeholder="••••••••" />
            <p className="text-xs text-gray-400 mt-1">Passwords are securely hashed in the database.</p>
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
