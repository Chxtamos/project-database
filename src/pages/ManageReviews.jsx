import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ConfirmModal from '../components/ConfirmModal';
import Modal from '../components/Modal';
import { Trash2, Search, Filter, Flag, XCircle, Eye } from 'lucide-react';

const ManageReviews = () => {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [detailReview, setDetailReview] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('reported_desc');

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
    setDetailReview(null);
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
  const rejectReports = async (review) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/reviews/${review.review_id}/reports`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchReviews();
        setDetailReview(null);
      } else {
        alert(data.message || 'Reject report failed');
      }
    } catch (err) {
      console.error(err);
      alert('Reject report failed');
    }
  };

  const filteredReviews = reviews.filter(r => 
    (r.movie_name && r.movie_name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (r.username && r.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (r.comment && r.comment.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (r.report_count > 0 && 'reported'.includes(searchTerm.toLowerCase()))
  ).sort((a, b) => {
    const dateA = new Date(a.date_review || 0).getTime();
    const dateB = new Date(b.date_review || 0).getTime();
    const reportA = Number(a.report_count || 0);
    const reportB = Number(b.report_count || 0);
    const movieCompare = (a.movie_name || '').localeCompare(b.movie_name || '', ['th', 'en'], { sensitivity: 'base' });
    if (sortBy === 'reported_asc') return reportA - reportB;
    if (sortBy === 'date_desc') return dateB - dateA;
    if (sortBy === 'date_asc') return dateA - dateB;
    if (sortBy === 'movie_asc') return movieCompare;
    if (sortBy === 'movie_desc') return -movieCompare;
    return reportB - reportA;
  });

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
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-figma-blue outline-none text-sm">
              <option value="reported_desc">Most reports now</option>
              <option value="reported_asc">Fewest reports</option>
              <option value="date_desc">Newest review</option>
              <option value="date_asc">Oldest review</option>
              <option value="movie_asc">Movie A-Z / ก-ฮ</option>
              <option value="movie_desc">Movie Z-A / ฮ-ก</option>
            </select>
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
                        <button type="button" onClick={() => setDetailReview(review)} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 border border-red-100 rounded-full text-xs font-bold hover:bg-red-100">
                          <Flag size={12} /> Reported ({review.report_count})
                        </button>
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
                      {review.report_count > 0 && (
                        <>
                          <button onClick={() => setDetailReview(review)} className="p-2 text-figma-blue bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 font-medium">
                            <Eye size={16} /> Read
                          </button>
                          <button onClick={() => rejectReports(review)} className="p-2 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1 font-medium">
                            <XCircle size={16} /> Reject
                          </button>
                        </>
                      )}
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
      <Modal isOpen={Boolean(detailReview)} onClose={() => setDetailReview(null)} title="Reported Review Detail" maxWidth="max-w-2xl">
        {detailReview && (
          <div className="-m-6 flex max-h-[calc(100vh-7.5rem)] flex-col">
            <div className="space-y-5 overflow-y-auto p-6">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase text-gray-500 mb-1">Movie</p>
                <p className="font-bold text-gray-900">{detailReview.movie_name}</p>
                <p className="text-sm text-gray-600 mt-2">Reviewed by {detailReview.username} with rating {detailReview.rating} / 5</p>
                <p className="text-sm text-gray-700 mt-3 whitespace-pre-wrap">{detailReview.comment || 'No comment.'}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 mb-2">Reporters and Reasons</p>
                <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 whitespace-pre-wrap">
                  {detailReview.report_reasons || detailReview.report_reporters || 'No report reason recorded.'}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-100 bg-white p-4">
              <button onClick={() => rejectReports(detailReview)} className="px-4 py-2 text-gray-700 font-bold border border-gray-200 rounded-lg hover:bg-gray-50">Reject Report</button>
              <button onClick={() => handleDelete(detailReview)} className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">Delete Review</button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default ManageReviews;
