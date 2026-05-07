import React, { useState } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { Pencil, Trash2, Plus, Search, Filter } from 'lucide-react';

const ManageReviews = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [reviews, setReviews] = useState([
    { movie: "Inception", user: "User123", rating: 5, date: "2026-05-01", comment: "Great movie!" },
    { movie: "The Matrix", user: "User456", rating: 4, date: "2026-05-02", comment: "Classic sci-fi." },
    { movie: "Interstellar", user: "User789", rating: 3, date: "2026-05-03", comment: "A bit slow but good." },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ movie: '', user: '', rating: 5, comment: '' });

  const handleEdit = (idx) => {
    setSelectedId(idx);
    setFormData(reviews[idx]);
    setIsEditOpen(true);
  };

  const handleDelete = (idx) => {
    setSelectedId(idx);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    setReviews(reviews.filter((_, i) => i !== selectedId));
    setIsDeleteOpen(false);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const newReview = { ...formData, date: new Date().toISOString().split('T')[0] };
    setReviews([newReview, ...reviews]);
    setIsAddOpen(false);
    setFormData({ movie: '', user: '', rating: 5, comment: '' });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const newReviews = [...reviews];
    newReviews[selectedId] = { ...newReviews[selectedId], rating: formData.rating, comment: formData.comment };
    setReviews(newReviews);
    setIsEditOpen(false);
  };

  const filteredReviews = reviews.filter(r => 
    r.movie.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.comment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout pageTitle="Manage Reviews" pageDescription="User feedback and ratings.">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search reviews..." 
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
            Add Review
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Movie</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReviews.map((review, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-600 font-medium cursor-pointer hover:text-figma-blue" onClick={() => handleEdit(idx)}>{review.movie}</td>
                  <td className="px-6 py-4 text-gray-600">{review.user}</td>
                  <td className="px-6 py-4 text-gray-600">{review.rating} Stars</td>
                  <td className="px-6 py-4 text-gray-600">{review.date}</td>
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

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Review">
        <form className="space-y-4" onSubmit={handleAddSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Movie Title</label>
            <input type="text" required value={formData.movie} onChange={e => setFormData({...formData, movie: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" placeholder="Enter movie title..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">User Name</label>
            <input type="text" required value={formData.user} onChange={e => setFormData({...formData, user: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" placeholder="Enter user name..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Rating (1-5)</label>
            <input type="number" min="1" max="5" required value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" placeholder="5" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Review Comment</label>
            <textarea required value={formData.comment} onChange={e => setFormData({...formData, comment: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" rows="3" placeholder="Write review..."></textarea>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-figma-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200">Save Review</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Review Detail">
        <form className="space-y-4" onSubmit={handleEditSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Rating</label>
            <input type="number" min="1" max="5" required value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Comment</label>
            <textarea required value={formData.comment} onChange={e => setFormData({...formData, comment: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" rows="3"></textarea>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-figma-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200" >Update Review</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={confirmDelete} title="Delete Review" message="Are you sure you want to delete this review? This action cannot be undone." />
    </Layout>
  );
};

export default ManageReviews;
