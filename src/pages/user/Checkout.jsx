import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import UserLayout from '../../components/UserLayout';
import { Upload, CheckCircle, AlertCircle, Image, ArrowLeft, Loader2, X } from 'lucide-react';
import qrImage from '../../assets/qr_payment.png';
import { useApp } from '../../context/AppContext';

const API_BASE = 'http://localhost:5000/api';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, cartMovies, fetchCart, checkout: resetCart } = useApp();

  // Amount comes from cart total via navigation state or context
  const total = location.state?.total ?? cartMovies.reduce((s, m) => s + parseFloat(m.movie_cost || 0), 0);

  const [slip, setSlip] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError('ไฟล์ต้องมีขนาดไม่เกิน 10MB');
      return;
    }
    setSlip(file);
    setError('');
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!slip) return setError('กรุณาแนบหลักฐานการโอนเงินก่อน');

    const userStr = localStorage.getItem('user');
    const token   = localStorage.getItem('token');
    if (!userStr || !token) return setError('กรุณาเข้าสู่ระบบก่อน');
    const user = JSON.parse(userStr);

    if (!cart?.cart_id) return setError('ไม่พบข้อมูล cart');

    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('user_id', user.user_id);
      formData.append('cart_id', cart.cart_id);
      formData.append('amount', total.toFixed(2));
      formData.append('slip', slip);

      const res = await fetch(`${API_BASE}/checkout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        // Reset cart state so user gets a fresh cart for next purchase
        await resetCart();
      } else {
        setError(data.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      }
    } catch (err) {
      console.error(err);
      setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setUploading(false);
    }
  };

  if (success) {
    return (
      <UserLayout>
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-3">ส่งหลักฐานสำเร็จ!</h1>
          <p className="text-gray-500 text-lg mb-2">ระบบได้รับหลักฐานการโอนเงินของคุณแล้ว</p>
          <p className="text-gray-400 text-sm mb-8">กรุณารอผู้ดูแลระบบยืนยันการชำระเงิน (ภายใน 24 ชั่วโมง)</p>
          <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 mb-8">
            <p className="text-yellow-700 font-bold text-sm">⏳ รอการยืนยันจาก Admin</p>
            <p className="text-yellow-600 text-xs mt-1">หนังจะถูกเพิ่มเข้า My Library หลังจาก Admin อนุมัติการชำระเงินเรียบร้อยแล้ว</p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/user/library')}
              className="px-6 py-3 bg-figma-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95"
            >
              ไปที่ My Library
            </button>
            <button
              onClick={() => navigate('/user/home')}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all active:scale-95"
            >
              กลับหน้าหลัก
            </button>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout pageTitle="Checkout">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/user/cart')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-8 transition-colors font-medium">
          <ArrowLeft size={18} /> Back to Cart
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: QR Code */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col items-center">
            <h2 className="text-xl font-black text-gray-900 mb-1">สแกนเพื่อชำระเงิน</h2>
            <p className="text-sm text-gray-400 mb-6">PromptPay / QR Code Payment</p>

            <div className="w-56 h-56 border-4 border-figma-blue rounded-2xl overflow-hidden shadow-lg mb-5">
              <img src={qrImage} alt="QR Code Payment" className="w-full h-full object-contain" />
            </div>

            <div className="text-center mb-4">
              <p className="text-sm text-gray-400 mb-1">ยอดที่ต้องชำระ</p>
              <p className="text-4xl font-black text-figma-blue">${total.toFixed(2)}</p>
            </div>

            <div className="w-full bg-gray-50 rounded-2xl p-4 space-y-2 text-sm text-gray-500 mt-2">
              <div className="flex justify-between">
                <span>รายการ</span>
                <span className="font-bold text-gray-700">{cartMovies.length} เรื่อง</span>
              </div>
              {cartMovies.map(m => (
                <div key={m.movie_id} className="flex justify-between text-xs">
                  <span className="truncate max-w-[160px]">{m.movie_name}</span>
                  <span>${parseFloat(m.movie_cost || 0).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-800">
                <span>รวมทั้งสิ้น</span>
                <span className="text-figma-blue">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Right: Upload Slip */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-xl font-black text-gray-900 mb-1">แนบหลักฐานการโอนเงิน</h2>
            <p className="text-sm text-gray-400 mb-6">อัพโหลดสลิปเงินหลังจากโอนเงินเรียบร้อย</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Drop zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[220px] ${
                  preview
                    ? 'border-figma-blue bg-blue-50'
                    : 'border-gray-200 bg-gray-50 hover:border-figma-blue hover:bg-blue-50'
                }`}
              >
                {preview ? (
                  <div className="relative w-full">
                    <img src={preview} alt="Slip preview" className="max-h-48 mx-auto object-contain rounded-xl" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSlip(null); setPreview(null); }}
                      className="absolute top-0 right-0 -mt-2 -mr-2 bg-white border border-gray-200 rounded-full p-1 shadow hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-3">{slip?.name}</p>
                  </div>
                ) : (
                  <>
                    <Image size={40} className="text-gray-300 mb-3" />
                    <p className="font-bold text-gray-500 text-sm">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
                    <p className="text-xs text-gray-400 mt-1">รองรับ JPG, PNG, WEBP ขนาดไม่เกิน 10MB</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
              />

              {/* Upload button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 border-2 border-gray-200 rounded-2xl font-bold text-gray-600 hover:border-figma-blue hover:text-figma-blue flex items-center justify-center gap-2 transition-all"
              >
                <Upload size={18} /> เลือกไฟล์สลิป
              </button>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!slip || uploading}
                className="w-full py-4 bg-figma-blue text-white font-black rounded-2xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 text-lg"
              >
                {uploading ? (
                  <><Loader2 size={20} className="animate-spin" /> กำลังส่งข้อมูล...</>
                ) : (
                  <>ยืนยันการชำระเงิน</>
                )}
              </button>

              <p className="text-center text-xs text-gray-400">
                เมื่อส่งสลิปแล้ว ผู้ดูแลระบบจะตรวจสอบและอนุมัติภายใน 24 ชั่วโมง
              </p>
            </form>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default Checkout;
