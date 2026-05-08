import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ConfirmModal from '../components/ConfirmModal';
import { Trash2, Search, Filter, Flag } from 'lucide-react';

const ManageReviews = () => {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/reviews?limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setReviews(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = (review) => {
    setSelectedReview(review);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedReview?.review_id) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/reviews/${selectedReview.review_id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchReviews();
        setSelectedReview(null);
        setIsDeleteOpen(false);
      } else {
        alert(data.message || 'Delete review failed');
      }
    } catch (err) {
      console.error(err);
      alert('Delete review failed');
    }
  };
  const filteredReviews = reviews.filter(r => 
    (r.movie_name && r.movie_name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (r.username && r.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (r.comment && r.comment.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (r.report_count > 0 && 'reported'.includes(searchTerm.toLowerCase()))
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

        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Movie</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReviews.map((review, idx) => (
                <tr key={review.review_id || idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-600 font-medium">{review.movie_name}</td>
                  <td className="px-6 py-4 text-gray-600">{review.username}</td>
                  <td className="px-6 py-4 text-gray-600 font-bold text-yellow-500">{review.rating} / 5</td>
                  <td className="px-6 py-4 text-gray-600">{new Date(review.date_review).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    {review.report_count > 0 ? (
                      <div className="inline-flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 border border-red-100 rounded-full text-xs font-bold">
                          <Flag size={12} /> Reported ({review.report_count})
                        </span>
                        {review.report_reporters && (
                          <span className="text-[11px] text-gray-400 max-w-[180px] truncate" title={review.report_reporters}>
                            by {review.report_reporters}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex px-2.5 py-1 bg-gray-50 text-gray-400 border border-gray-100 rounded-full text-xs font-bold">
                        Normal
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleDelete(review)} className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1 font-medium">
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredReviews.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                    No reviews found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedReview(null); }}
        onConfirm={confirmDelete}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
      />
    </Layout>
  );
};

export default ManageReviews;
