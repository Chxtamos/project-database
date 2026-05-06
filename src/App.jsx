import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import ManageMovies from './pages/ManageMovies';
import ManagePayments from './pages/ManagePayments';
import ManageReviews from './pages/ManageReviews';
import ManageUsers from './pages/ManageUsers';
import SystemReport from './pages/SystemReport';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/movies" element={<ManageMovies />} />
        <Route path="/payments" element={<ManagePayments />} />
        <Route path="/reviews" element={<ManageReviews />} />
        <Route path="/users" element={<ManageUsers />} />
        <Route path="/report" element={<SystemReport />} />
      </Routes>
    </Router>
  );
}

export default App;
