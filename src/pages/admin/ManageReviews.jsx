import React, { useState } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { MoreVertical, Plus, Search, Filter } from 'lucide-react';

const ManageReviews = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const reviews = [
    ["Inception", "User123", "5 Stars", "2026-05-01"],
    ["The Matrix", "User456", "4 Stars", "2026-05-02"],
    ["Interstellar", "User789", "3 Stars", "2026-05-03"],
  ];

  const handleEdit = (id) => {
    setSelectedId(id);
    setIsEditOpen(true);
  };

  const handleDelete = (id) => {
    setSelectedId(id);
    setIsDeleteOpen(true);
  };

  return (
    <Layout pageTitle="Manage Reviews" pageDescription="User feedback and ratings.">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Search reviews..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" />
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
              {reviews.map((review, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-600 font-medium cursor-pointer hover:text-figma-blue" onClick={() => handleEdit(idx)}>{review[0]}</td>
                  <td className="px-6 py-4 text-gray-600">{review[1]}</td>
                  <td className="px-6 py-4 text-gray-600">{review[2]}</td>
                  <td className="px-6 py-4 text-gray-600">{review[3]}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative group">
                      <button className="p-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors">
                        <MoreVertical size={16} />
                      </button>
                      <div className="absolute right-0 top-8 w-32 bg-white border border-gray-100 shadow-xl rounded-xl py-2 z-10 hidden group-hover:block animate-in fade-in slide-in-from-top-2">
                        <button onClick={() => handleEdit(idx)} className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-figma-blue transition-colors">Edit</button>
                        <button onClick={() => handleDelete(idx)} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">Delete</button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Review">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Movie Title</label>
            <input type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" placeholder="Enter movie title..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">User Name</label>
            <input type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" placeholder="Enter user name..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Rating (1-5)</label>
            <input type="number" min="1" max="5" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" placeholder="5" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Review Comment</label>
            <textarea className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" rows="3" placeholder="Write review..."></textarea>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-figma-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200">Save Review</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Review Detail">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Rating</label>
            <input type="text" defaultValue={reviews[selectedId]?.[2]} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Comment</label>
            <textarea className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" rows="3" defaultValue="This is a great movie! Must watch."></textarea>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-figma-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200" >Update Review</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={() => { console.log("Deleted Review:", selectedId); setIsDeleteOpen(false); }} title="Delete Review" message="Are you sure you want to delete this review? This action cannot be undone." />
    </Layout>
  );
};

export default ManageReviews;
