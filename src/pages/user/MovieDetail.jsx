import React, { useState } from 'react';
import UserLayout from '../../components/UserLayout';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import { Star, Flag, Send } from 'lucide-react';

const MovieDetail = () => {
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportId, setReportId] = useState(null);

  const reviews = [
    { id: 1, user: "Alex", rating: 5, comment: "Mind-blowing experience!", date: "2 days ago" },
    { id: 2, user: "Jordan", rating: 4, comment: "Great visuals, but a bit long.", date: "1 week ago" },
  ];

  return (
    <UserLayout>
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="w-full lg:w-1/3">
          <div className="aspect-[2/3] bg-gray-200 rounded-3xl overflow-hidden shadow-2xl">
            <img src="https://api.dicebear.com/7.x/shapes/svg?seed=1" className="w-full h-full object-cover" alt="poster" />
          </div>
        </div>
        <div className="flex-1 space-y-8">
          <div>
            <h1 className="text-5xl font-bold mb-4">Inception</h1>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex text-yellow-400"><Star size={20} fill="currentColor" /> <span className="ml-1 font-bold text-figma-dark">4.8</span></div>
              <span className="text-gray-400 text-sm">1.2K Reviews</span>
              <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium">Sci-Fi</span>
            </div>
            <p className="text-gray-600 leading-relaxed text-lg">
              A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.
            </p>
            <button className="mt-8 px-8 py-4 bg-figma-blue text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95">
              Purchase Movie - $12.99
            </button>
          </div>

          <div className="pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">User Reviews</h2>
              <button onClick={() => setIsReviewOpen(true)} className="text-figma-blue font-bold text-sm hover:underline flex items-center gap-1">
                Write a Review
              </button>
            </div>
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r.id} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{r.user}</span>
                      <div className="flex text-yellow-400"><Star size={12} fill="currentColor" /> <span className="text-xs ml-1">{r.rating}</span></div>
                    </div>
                    <button onClick={() => { setReportId(r.id); setIsReportOpen(true); }} className="text-gray-400 hover:text-red-500 transition-colors">
                      <Flag size={14} />
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm">{r.comment}</p>
                  <span className="text-[10px] text-gray-400 mt-2 block">{r.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} title="Write a Review">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="flex gap-2 mb-4">
            {[1,2,3,4,5].map(s => <Star key={s} size={24} className="text-gray-300 hover:text-yellow-400 cursor-pointer transition-colors" />)}
          </div>
          <textarea className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" rows="4" placeholder="Share your thoughts about this movie..."></textarea>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setIsReviewOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-figma-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2">
              <Send size={16} /> Submit
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} onConfirm={() => { console.log("Reported Review:", reportId); setIsReportOpen(false); }} title="Report Review" message="Are you sure you want to report this review to the administration for moderation?" />
    </Layout>
  );
};

export default MovieDetail;
