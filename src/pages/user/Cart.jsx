import React, { useEffect, useState } from 'react';
import UserLayout from '../../components/UserLayout';
import { Trash2, ShoppingBag, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:5000/api';

const Cart = () => {
  const navigate = useNavigate();
  const { cartMovies, removeFromCart, cart } = useApp();
  const [hasPending, setHasPending] = useState(false);
  const [checkingPending, setCheckingPending] = useState(true);

  // คิดยอดรวมทั้งหมดใน cart
  const total = cartMovies.reduce((sum, item) => sum + parseFloat(item.movie_cost || 0), 0);

  // ตรวจสอบว่า cart มี payment pending อยู่แล้วหรือไม่
  useEffect(() => {
    const checkPending = async () => {
      if (!cart?.cart_id) { setCheckingPending(false); return; }
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/payments?user_id=${cart.user_id}&status=0&limit=50`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data) {
          const pendingForThisCart = data.data.some(p => p.cart_id === cart.cart_id);
          setHasPending(pendingForThisCart);
        }
      } catch {}
      setCheckingPending(false);
    };
    checkPending();
  }, [cart]);

  const getPosterSrc = (path) => {
    if (!path) return 'https://via.placeholder.com/200x300?text=No+Poster';
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
  };

  return (
    <UserLayout pageTitle="Shopping Cart">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* รายการสินค้า */}
        <div className="flex-1 space-y-4">
          {cartMovies.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl border border-gray-100 shadow-sm text-center">
              <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-500 font-medium">Your cart is empty.</p>
              <button
                onClick={() => navigate('/user/home')}
                className="mt-4 px-6 py-2.5 bg-figma-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95 text-sm"
              >
                Browse Movies
              </button>
            </div>
          ) : (
            cartMovies.map(item => (
              <div key={item.movie_id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <img src={getPosterSrc(item.movie_poster)} className="w-16 h-20 object-cover rounded-lg flex-shrink-0" alt={item.movie_name} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate">{item.movie_name}</h3>
                  <p className="text-figma-blue font-bold">${parseFloat(item.movie_cost || 0).toFixed(2)}</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.movie_id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                  title="ลบออกจาก cart"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* สรุปยอด Order Summary */}
        <div className="w-full lg:w-80 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-fit sticky top-6">
          <h3 className="text-xl font-bold mb-4">Order Summary</h3>

          {/* รายการราคาแต่ละเรื่อง */}
          {cartMovies.length > 0 && (
            <div className="mb-4 space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {cartMovies.map(item => (
                <div key={item.movie_id} className="flex justify-between text-xs text-gray-500">
                  <span className="truncate max-w-[160px]">{item.movie_name}</span>
                  <span className="font-medium">${parseFloat(item.movie_cost || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-gray-600 text-sm">
              <span>Subtotal ({cartMovies.length} {cartMovies.length === 1 ? 'item' : 'items'})</span>
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

          {/* แจ้งเตือนถ้ามี pending payment */}
          {hasPending && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-100 rounded-xl text-yellow-700 text-xs mb-4">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>คุณมีการชำระเงินที่รอการยืนยันอยู่แล้ว กรุณารอ Admin ตรวจสอบก่อน</span>
            </div>
          )}

          <button
            onClick={() => navigate('/user/checkout', { state: { total } })}
            disabled={cartMovies.length === 0 || hasPending || checkingPending}
            className="w-full py-4 bg-figma-blue text-white font-bold rounded-2xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed"
          >
            {hasPending ? '⏳ รอการยืนยัน' : `Checkout Now — $${total.toFixed(2)}`}
          </button>

          <p className="text-center text-xs text-gray-400 mt-3">
            ชำระเงินสำหรับ {cartMovies.length} รายการพร้อมกัน
          </p>
        </div>
      </div>
    </UserLayout>
  );
};

export default Cart;
