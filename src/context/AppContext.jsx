import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();
const API_BASE = 'http://localhost:5000/api';

export const AppProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [cartMovies, setCartMovies] = useState([]);
  
  const [library, setLibrary] = useState([]);
  const [playlists, setPlaylists] = useState({
    "Sci-Fi Favorites": [1],
    "Weekend Binge": [2]
  });
  const [reviews, setReviews] = useState([]);

  const fetchCart = async () => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userStr || !token) return;
    
    try {
      const user = JSON.parse(userStr);
      const res = await fetch(`${API_BASE}/cart/${user.user_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCart(data.data);
        setCartMovies(data.data.movies || []);
      } else {
        // Create cart if not exists
        const createRes = await fetch(`${API_BASE}/cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ user_id: user.user_id })
        });
        const createData = await createRes.json();
        if (createData.success) {
          setCart(createData.data);
          setCartMovies([]);
        }
      }
    } catch (err) {
      console.error("Fetch cart error:", err);
    }
  };

  const fetchLibrary = async () => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userStr || !token) return;
    
    try {
      const user = JSON.parse(userStr);
      const res = await fetch(`${API_BASE}/library/${user.user_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setLibrary(data.data.map(m => m.movie_id));
      }
    } catch (err) {
      console.error("Fetch library error:", err);
    }
  };

  useEffect(() => {
    fetchCart();
    fetchLibrary();
  }, []);

  const addToCart = async (movieId) => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userStr || !token || !cart) {
      return { success: false, message: 'Please login first.' };
    }

    try {
      const res = await fetch(`${API_BASE}/cart/${cart.cart_id}/movies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ movie_id: movieId })
      });
      const data = await res.json();
      if (data.success) {
        await fetchCart();
      } else {
        alert(data.message || 'เกิดข้อผิดพลาดในการเพิ่มลงตะกร้า');
      }
      return data;
    } catch (err) {
      console.error("Add to cart error:", err);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
      return { success: false, message: 'Could not add this movie to cart.' };
    }
  };

  const removeFromCart = async (movieId) => {
    const token = localStorage.getItem('token');
    if (!token || !cart) return;

    try {
      const res = await fetch(`${API_BASE}/cart/${cart.cart_id}/movies/${movieId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchCart();
      }
    } catch (err) {
      console.error("Remove from cart error:", err);
    }
  };

  const checkout = async () => {
    // Clear local cart state and re-fetch to get a fresh cart
    setCartMovies([]);
    setCart(null);
    await fetchCart();
  };

  const addReview = (review) => {
    setReviews(prev => [...prev, { ...review, id: Date.now(), date: "Just now", reported: false }]);
  };

  const reportReview = (id) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, reported: true } : r));
  };

  const addToPlaylist = (playlistName, movieId) => {
    setPlaylists(prev => ({
      ...prev,
      [playlistName]: [...new Set([...(prev[playlistName] || []), movieId])]
    }));
  };

  const createPlaylist = (name) => {
    setPlaylists(prev => ({ ...prev, [name]: [] }));
  };

  return (
    <AppContext.Provider value={{ 
      cart, cartMovies, setCartMovies, addToCart, removeFromCart, checkout, fetchCart,
      library, setLibrary, fetchLibrary, 
      playlists, setPlaylists, addToPlaylist, createPlaylist,
      reviews, setReviews, addReview, reportReview 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
