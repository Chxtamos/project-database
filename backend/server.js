require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const fs       = require('fs');

// ─── Import Routes ────────────────────────────────────────────
const authRoutes      = require('./routes/auth');
const moviesRoutes    = require('./routes/movies');
const usersRoutes     = require('./routes/users');
const paymentsRoutes  = require('./routes/payments');
const reviewsRoutes   = require('./routes/reviews');
const dashboardRoutes = require('./routes/dashboard');
const genresRoutes    = require('./routes/genres');
const cartRoutes      = require('./routes/cart');
const databaseRoutes  = require('./routes/database');
const libraryRoutes   = require('./routes/library');
const playlistsRoutes = require('./routes/playlists');
const checkoutRoutes  = require('./routes/checkout');
const creditsRoutes   = require('./routes/credits');

// ─── App Setup ────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Ensure uploads folder exists ─────────────────────────────
const uploadsDir = path.join(__dirname, 'uploads', 'posters');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded poster images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/movies',    moviesRoutes);
app.use('/api/users',     usersRoutes);
app.use('/api/payments',  paymentsRoutes);
app.use('/api/reviews',   reviewsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/genres',    genresRoutes);
app.use('/api/cart',      cartRoutes);
app.use('/api/database',  databaseRoutes);
app.use('/api/library',   libraryRoutes);
app.use('/api/playlists', playlistsRoutes);
app.use('/api/checkout',  checkoutRoutes);
app.use('/api/credits',   creditsRoutes);

// Serve slip images statically
app.use('/uploads/slips', express.static(path.join(__dirname, 'uploads/slips')));

// ─── Health Check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🎬 Movie Admin API is running.',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: process.env.DB_NAME,
    endpoints: [
      'POST   /api/auth/login',
      'POST   /api/auth/register',
      'GET    /api/movies',
      'GET    /api/movies/:id',
      'POST   /api/movies',
      'PUT    /api/movies/:id',
      'DELETE /api/movies/:id',
      'GET    /api/users',
      'GET    /api/users/:id',
      'PUT    /api/users/:id',
      'DELETE /api/users/:id',
      'GET    /api/payments',
      'POST   /api/payments',
      'PATCH  /api/payments/:id/status',
      'DELETE /api/payments/:id',
      'GET    /api/reviews',
      'POST   /api/reviews',
      'PUT    /api/reviews/:id',
      'DELETE /api/reviews/:id',
      'GET    /api/reviews/reports/all',
      'GET    /api/genres',
      'POST   /api/genres',
      'PUT    /api/genres/:id',
      'DELETE /api/genres/:id',
      'GET    /api/cart/:user_id',
      'POST   /api/cart',
      'POST   /api/cart/:cart_id/movies',
      'DELETE /api/cart/:cart_id/movies/:movie_id',
      'GET    /api/dashboard/stats',
      'GET    /api/dashboard/top-movies',
      'GET    /api/dashboard/revenue-trend',
      'GET    /api/dashboard/genres',
    ],
  });
});

// ─── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found.` });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ─── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Movie Admin API → http://localhost:${PORT}`);
  console.log(`📋 Health check    → http://localhost:${PORT}/api/health`);
  console.log(`🗄️  Database       → ${process.env.DB_NAME} @ ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  console.log(`🌍 Environment     → ${process.env.NODE_ENV || 'development'}\n`);
});
