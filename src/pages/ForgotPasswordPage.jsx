import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage('Password reset link sent! Check your console/email.');
        if (data.previewUrl) console.log("Preview URL:", data.previewUrl);
      } else {
        setError(data.message || 'Failed to send reset link');
      }
    } catch (err) {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-figma-bg font-inter py-10">
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 w-full max-w-md relative">
        <Link to="/" className="absolute top-6 left-6 text-gray-400 hover:text-gray-800 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-center mb-8 mt-4">
          <div className="w-16 h-16 bg-figma-blue rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">FH</div>
          <h1 className="text-3xl font-bold text-figma-dark">Forgot Password</h1>
          <p className="text-gray-500 mt-2">Enter your email to reset your password</p>
        </div>
        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-xl text-center">{error}</div>}
        {message && <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-xl text-center">{message}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue focus:border-transparent outline-none transition-all" 
                placeholder="example@mail.com" 
                required 
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-figma-blue text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
};
export default ForgotPasswordPage;
