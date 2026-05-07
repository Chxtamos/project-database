import React from 'react';
import UserLayout from '../../components/UserLayout';
import { Trash2 } from 'lucide-react';

const Cart = () => {
  const cartItems = [
    { id: 1, title: "Inception", price: 12.99, img: "https://api.dicebear.com/7.x/shapes/svg?seed=1" },
    { id: 2, title: "The Matrix", price: 14.99, img: "https://api.dicebear.com/7.x/shapes/svg?seed=2" },
  ];
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);
  return (
    <UserLayout pageTitle="Shopping Cart">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          {cartItems.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <img src={item.img} className="w-16 h-20 object-cover rounded-lg" alt={item.title} />
              <div className="flex-1">
                <h3 className="font-bold">{item.title}</h3>
                <p className="text-figma-blue font-bold">${item.price}</p>
              </div>
              <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
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
          <button className="w-full py-4 bg-figma-blue text-white font-bold rounded-2xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200">
            Checkout Now
          </button>
        </div>
      </div>
    </UserLayout>
  );
};

export default Cart;
