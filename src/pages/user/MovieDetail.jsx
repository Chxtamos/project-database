import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import UserLayout from '../../components/UserLayout';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import { Star, Flag, Send, Loader2, ShoppingCart, Check, X, Play } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const API_BASE = 'http://localhost:5000/api';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, library } = useApp();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [cartNotice, setCartNotice] = useState('');
  const [reportId, setReportId] = useState(null);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  
  const currentUserStr = localStorage.getItem('user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  
  const isOwned = movie && library.some(movieId => Number(movieId) === Number(movie.movie_id));
  const hasReviewed = Boolean(
    currentUser && reviews.some(r => Number(r.user_id) === Number(currentUser.user_id))
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        // Fetch movie details
        const movieRes = await fetch(`${API_BASE}/movies/${id}`);
        const movieData = await movieRes.json();
        if (movieData.success) {
          setMovie(movieData.data);
        }
        
        // Fetch reviews
        if (token) {
          const reviewRes = await fetch(`${API_BASE}/reviews?movie_id=${id}&limit=100`, { headers });
          const reviewData = await reviewRes.json();
          if (reviewData.success) {
            setReviews(reviewData.data);
          }
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const getPosterSrc = (path) => {
    if (!path) return 'https://via.placeholder.com/400x600?text=No+Poster';
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
  };

  const handleAddToCart = async () => {
    if (isOwned) {
      setCartNotice('คุณเป็นเจ้าของหนังเรื่องนี้แล้ว');
      return;
    }

    const result = await addToCart(movie.movie_id);
    if (!result?.success) {
      setCartNotice(result?.message || 'ไม่สามารถเพิ่มหนังเข้าตะกร้าได้');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) return alert("Please login first");
      if (hasReviewed) {
        setIsReviewOpen(false);
        setCartNotice('คุณเขียน review หนังเรื่องนี้แล้ว');
        return;
      }
      if (!isOwned) {
        setIsReviewOpen(false);
        setCartNotice('ท่านยังไม่เป็นเจ้าของหนังเรื่องนี้');
        return;
      }
      
      const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          user_id: user.user_id,
          movie_id: id,
          review_number: reviews.length + 1,
          rating: newReview.rating,
          comment: newReview.comment
        })
      });
      const data = await res.json();
      if (data.success) {
        setReviews([{ ...data.data, username: user.username, date_review: new Date().toISOString() }, ...reviews]);
        setIsReviewOpen(false);
        setNewReview({ rating: 5, comment: '' });
      } else {
        alert(data.message || "Failed to submit review");
      }
    } catch(err) {
      console.error(err);
      alert("Error submitting review");
    }
  };

  const submitReport = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    if (!user || !token) {
      setIsReportOpen(false);
      setCartNotice('Please login first');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/reviews/${reportId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: 'Reported from movie detail page' })
      });
      const data = await res.json();
      setIsReportOpen(false);
      setCartNotice(data.message || (data.success ? 'ส่งรายงานรีวิวให้ Admin แล้ว' : 'ไม่สามารถ report review ได้'));
    } catch (err) {
      console.error(err);
      setIsReportOpen(false);
      setCartNotice('ไม่สามารถ report review ได้');
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="flex flex-col items-center justify-center py-40 text-gray-400">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p className="text-lg">Loading movie details...</p>
        </div>
      </UserLayout>
    );
  }

  if (!movie) {
    return (
      <UserLayout>
        <div className="text-center py-40 text-gray-500 font-bold text-xl">Movie not found.</div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="w-full lg:w-1/3">
          <div className="aspect-[2/3] bg-gray-200 rounded-3xl overflow-hidden shadow-2xl relative">
            <img src={getPosterSrc(movie.movie_poster)} className="w-full h-full object-cover" alt={movie.movie_name} />
          </div>
        </div>
        <div className="flex-1 space-y-8">
          <div>
            <h1 className="text-4xl lg:text-5xl font-black mb-4 tracking-tight text-gray-900">{movie.movie_name}</h1>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex items-center text-yellow-400 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                <Star size={16} fill="currentColor" /> 
                <span className="ml-1.5 font-bold text-yellow-700">{movie.movie_rating || 'N/A'}</span>
              </div>
              <span className="text-gray-500 text-sm font-medium">{reviews.length} Reviews</span>
              {movie.genres && movie.genres.map(g => (
                <span key={g.genre_id} className="px-3 py-1 bg-blue-50 text-figma-blue rounded-full text-xs font-bold border border-blue-100">
                  {g.genre_name}
                </span>
              ))}
            </div>
            
            <div className="prose prose-gray max-w-none mb-8">
              {movie.detail && movie.detail !== '-' && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">เรื่องย่อ (Synopsis)</h3>
                  <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">
                    {movie.detail}
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <p className="text-gray-600 text-sm">
                  <strong>Released Date:</strong> {new Date(movie.movie_releasedate).toLocaleDateString()}
                </p>
                {movie.actors && movie.actors.length > 0 && (
                  <p className="text-gray-600 text-sm">
                    <strong>Cast:</strong> {movie.actors.map(a => a.actor_name).join(', ')}
                  </p>
                )}
                {movie.authors && movie.authors.length > 0 && (
                  <p className="text-gray-600 text-sm">
                    <strong>Author:</strong> {movie.authors.map(a => a.author_name).join(', ')}
                  </p>
                )}
              </div>
            </div>

            {!isOwned ? (
              <button 
                onClick={handleAddToCart}
                className="mt-4 px-8 py-4 bg-figma-blue text-white font-bold rounded-2xl hover:bg-emerald-600 hover:shadow-emerald-200 transition-all shadow-lg shadow-blue-200 active:scale-95 flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} /> Add to Cart - ฿{parseFloat(movie.movie_cost || 0).toFixed(2)}
              </button>
            ) : (
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/user/watch/${movie.movie_id}`)}
                  className="px-8 py-4 bg-figma-blue text-white font-bold rounded-2xl hover:bg-indigo-700 hover:shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                >
                  <Play size={20} fill="currentColor" /> Watch Movie
                </button>
                <div className="px-8 py-4 bg-green-50 text-green-700 font-bold rounded-2xl border border-green-200 flex items-center justify-center gap-2">
                  <Check size={20} /> คุณเป็นเจ้าของเรื่องนี้แล้ว
                </div>
              </div>
            )}
          </div>

          <div className="pt-10 border-t border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-gray-900">User Reviews</h2>
              <button
                onClick={() => {
                  if (hasReviewed) {
                    setCartNotice('คุณเขียน review หนังเรื่องนี้แล้ว');
                  } else if (isOwned) {
                    setIsReviewOpen(true);
                  } else {
                    setCartNotice('ท่านยังไม่เป็นเจ้าของหนังเรื่องนี้');
                  }
                }}
                className={`px-4 py-2 font-bold text-sm rounded-xl transition-colors flex items-center gap-2 ${
                  hasReviewed
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 text-figma-blue hover:bg-blue-50'
                }`}
              >
                <Star size={16} /> {hasReviewed ? 'Reviewed' : 'Write a Review'}
              </button>
            </div>
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r.review_id || Math.random()} className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-figma-blue flex items-center justify-center font-bold text-xs uppercase">
                        {(r.username || 'U')[0]}
                      </div>
                      <div>
                        <span className="font-bold text-sm block text-gray-900">{r.username || 'Anonymous'}</span>
                        <div className="flex items-center text-yellow-400 mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={10} fill={i < r.rating ? "currentColor" : "none"} className={i < r.rating ? "text-yellow-400" : "text-gray-200"} />
                          ))}
                        </div>
                      </div>
                    </div>
                    {(!currentUser || r.user_id !== currentUser.user_id) && (
                      <button onClick={() => { setReportId(r.review_id); setIsReportOpen(true); }} className="text-gray-300 hover:text-red-500 transition-colors p-1" title="Report Review">
                        <Flag size={14} />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{r.comment}</p>
                  <span className="text-[10px] font-medium text-gray-400 mt-3 block">
                    {r.date_review ? new Date(r.date_review).toLocaleDateString() : 'Just now'}
                  </span>
                </div>
              ))}
              {reviews.length === 0 && (
                <div className="p-10 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <Star size={32} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium text-sm">No reviews yet. Be the first to review!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={Boolean(cartNotice)} onClose={() => setCartNotice('')} title="แจ้งเตือน">
        <div className="space-y-5 text-center">
          {cartNotice === 'ท่านยังไม่เป็นเจ้าของหนังเรื่องนี้' || cartNotice.includes('ไม่สามารถ') || cartNotice.includes('Please') ? (
            <div className="mx-auto w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <X size={28} />
            </div>
          ) : (
            <div className="mx-auto w-14 h-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
              <Check size={28} />
            </div>
          )}
          <p className="text-gray-700 font-medium">{cartNotice}</p>
          <button
            onClick={() => setCartNotice('')}
            className="w-full px-5 py-3 bg-figma-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95"
          >
            ตกลง
          </button>
        </div>
      </Modal>

      <Modal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} title="Write a Review">
        <form className="space-y-5" onSubmit={submitReview}>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Your Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(s => (
                <Star 
                  key={s} 
                  size={32} 
                  className={`cursor-pointer transition-all hover:scale-110 ${s <= newReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} 
                  onClick={() => setNewReview({...newReview, rating: s})}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Your Thoughts</label>
            <textarea 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm resize-none" 
              rows="4" 
              placeholder="What did you think of the movie? (Optional)"
              value={newReview.comment}
              onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
            ></textarea>
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={() => setIsReviewOpen(false)} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2.5 bg-figma-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-blue-200">
              <Send size={16} /> Submit Review
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={isReportOpen} 
        onClose={() => setIsReportOpen(false)} 
        onConfirm={submitReport}
        title="Report Review" 
        message="Are you sure you want to report this review to the administration for moderation? This action cannot be undone." 
        confirmLabel="Report"
        confirmColor="red"
      />
    </UserLayout>
  );
};

export default MovieDetail;
