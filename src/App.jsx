import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

// Admin Pages
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailChangePage from './pages/VerifyEmailChangePage';
import ManageMovies from './pages/ManageMovies';
import ManagePayments from './pages/ManagePayments';
import ManageReviews from './pages/ManageReviews';
import ManageUsers from './pages/ManageUsers';
import ManageCredits from './pages/ManageCredits';
import SystemReport from './pages/SystemReport';
import DatabaseMonitor from './pages/DatabaseMonitor';

// User Pages
import Home from './pages/user/Home';
import MovieDetail from './pages/user/MovieDetail';
import Cart from './pages/user/Cart';
import Library from './pages/user/Library';
import Playlists from './pages/user/Playlists';
import Checkout from './pages/user/Checkout';
import PlaylistEditor from './pages/user/PlaylistEditor';
import Profile from './pages/user/Profile';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Admin Routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailChangePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/movies" element={<ManageMovies />} />
          <Route path="/payments" element={<ManagePayments />} />
          <Route path="/reviews" element={<ManageReviews />} />
          <Route path="/users" element={<ManageUsers />} />
          <Route path="/credits" element={<ManageCredits />} />
          <Route path="/report" element={<SystemReport />} />
          <Route path="/database" element={<DatabaseMonitor />} />

          {/* User Routes */}
          <Route path="/user/home" element={<Home />} />
          <Route path="/user/movie/:id" element={<MovieDetail />} />
          <Route path="/user/cart" element={<Cart />} />
          <Route path="/user/checkout" element={<Checkout />} />
          <Route path="/user/library" element={<Library />} />
          <Route path="/user/playlists" element={<Playlists />} />
          <Route path="/user/playlists/:id/edit" element={<PlaylistEditor />} />
          <Route path="/user/profile" element={<Profile />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
