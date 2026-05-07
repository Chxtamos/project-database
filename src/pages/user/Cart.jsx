import React from 'react';
import UserLayout from '../../components/UserLayout';
import { Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const navigate = useNavigate();
  const { cartMovies, removeFromCart, cart } = useApp();

  const total = cartMovies.reduce((sum, item) => sum + parseFloat(item.movie_cost || 0), 0);

  const getPosterSrc = (path) => {
    if (!path) return 'https://via.placeholder.com/200x300?text=No+Poster';
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
  };

  return (
    <UserLayout pageTitle="Shopping Cart">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          {cartMovies.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl border border-gray-100 shadow-sm text-center text-gray-500 font-medium">
              Your cart is empty.
            </div>
          ) : (
            cartMovies.map(item => (
              <div key={item.movie_id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <img src={getPosterSrc(item.movie_poster)} className="w-16 h-20 object-cover rounded-lg" alt={item.movie_name} />
                <div className="flex-1">
                  <h3 className="font-bold">{item.movie_name}</h3>
                  <p className="text-figma-blue font-bold">${parseFloat(item.movie_cost || 0).toFixed(2)}</p>
                </div>
                <button 
                  onClick={() => removeFromCart(item.movie_id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
        <div className="w-full lg:w-80 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-fit">
          <h3 className="text-xl font-bold mb-4">Order Summary</h3>
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-gray-600 text-sm">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 text-sm">
              <span>Tax (0%)</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-100">
              <span>Total</span>
              <span className="text-figma-blue">${total.toFixed(2)}</span>
            </div>
          </div>
          <button 
            onClick={() => navigate('/user/checkout', { state: { total } })}
            disabled={cartMovies.length === 0}
            className="w-full py-4 bg-figma-blue text-white font-bold rounded-2xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed"
          >
            Checkout Now
          </button>
        </div>
      </div>
    </UserLayout>
  );
};

export default Cart;
