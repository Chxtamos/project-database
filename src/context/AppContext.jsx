import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [library, setLibrary] = useState([1, 2]); // Default owned movies
  const [playlists, setPlaylists] = useState({
    "Sci-Fi Favorites": [1],
    "Weekend Binge": [2]
  });
  const [reviews, setReviews] = useState([
    { id: 1, movieId: 1, user: "Alex", rating: 5, comment: "Mind-blowing experience!", date: "2 days ago", reported: false },
    { id: 2, movieId: 1, user: "Jordan", rating: 4, comment: "Great visuals, but a bit long.", date: "1 week ago", reported: false },
  ]);

  const addToCart = (movie) => {
    setCart(prev => [...prev, movie]);
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const checkout = () => {
    setLibrary(prev => [...new Set([...prev, ...cart.map(item => item.id)])]);
    setCart([]);
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
      cart, setCart, addToCart, removeFromCart, checkout, 
      library, setLibrary, 
      playlists, setPlaylists, addToPlaylist, createPlaylist,
      reviews, setReviews, addReview, reportReview 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
