const express = require('express');
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// ─────────────────────────────────────────────
// GET /api/dashboard/stats
// สถิติรวมจาก database จริง
// ─────────────────────────────────────────────
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const [usersResult, moviesResult, paymentsResult, reviewsResult] = await Promise.all([
      pool.query('SELECT COUNT(*) AS total_users FROM public.users'),
      pool.query(`
        SELECT
          COUNT(*) AS total_movies,
          ROUND(AVG(movie_rating)::numeric, 1) AS avg_rating
        FROM public.movies WHERE movie_rating IS NOT NULL
      `),
      pool.query(`
        SELECT
          COUNT(*)                              AS total_payments,
          COUNT(*) FILTER (WHERE status = 0)    AS pending_count,
          COUNT(*) FILTER (WHERE status = 1)    AS success_count,
          COUNT(*) FILTER (WHERE status = 2)    AS failed_count,
          COALESCE(SUM(amount) FILTER (WHERE status = 1), 0) AS total_revenue
        FROM public.payment
      `),
      pool.query('SELECT COUNT(*) AS total_reviews FROM public.review'),
    ]);

    res.json({
      success: true,
      data: {
        total_users:    parseInt(usersResult.rows[0].total_users),
        total_movies:   parseInt(moviesResult.rows[0].total_movies),
        avg_rating:     parseFloat(moviesResult.rows[0].avg_rating) || 0,
        total_payments: parseInt(paymentsResult.rows[0].total_payments),
        pending_count:  parseInt(paymentsResult.rows[0].pending_count),
        success_count:  parseInt(paymentsResult.rows[0].success_count),
        failed_count:   parseInt(paymentsResult.rows[0].failed_count),
        total_revenue:  parseFloat(paymentsResult.rows[0].total_revenue),
        total_reviews:  parseInt(reviewsResult.rows[0].total_reviews),
      },
    });
  } catch (err) {
    console.error('Dashboard stats error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ─────────────────────────────────────────────
// GET /api/dashboard/top-movies
// Top movies เรียงตามคะแนน review และจำนวน review
// ─────────────────────────────────────────────
router.get('/top-movies', authMiddleware, async (req, res) => {
  const { limit = 6 } = req.query;
  try {
    const result = await pool.query(
      `SELECT
         m.movie_id,
         m.movie_name,
         m.movie_cost,
         m.movie_rating,
         m.movie_poster,
         m.movie_releasedate,
         ROUND(AVG(r.rating)::numeric, 1) AS avg_review_rating,
         COUNT(r.review_id)               AS review_count,
         COALESCE(
           json_agg(DISTINCT g.genre_name) FILTER (WHERE g.genre_name IS NOT NULL),
           '[]'
         ) AS genres
       FROM public.movies m
       LEFT JOIN public.review r       ON m.movie_id = r.movie_id
       LEFT JOIN public.movie_genre mg ON m.movie_id = mg.movie_id
       LEFT JOIN public.genre g        ON mg.genre_id = g.genre_id
       GROUP BY m.movie_id
       ORDER BY m.movie_rating DESC NULLS LAST, review_count DESC, m.movie_id DESC
       LIMIT $1`,
      [parseInt(limit)]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Top movies error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ─────────────────────────────────────────────
// GET /api/dashboard/revenue-trend
// รายได้รายเดือน 6 เดือนล่าสุด
// ─────────────────────────────────────────────
router.get('/revenue-trend', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', payment_date), 'Mon YYYY') AS month,
        DATE_TRUNC('month', payment_date)                       AS month_start,
        COALESCE(SUM(amount) FILTER (WHERE status = 1), 0)      AS revenue,
        COUNT(*) FILTER (WHERE status = 1)                      AS success_count
      FROM public.payment
      WHERE payment_date >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', payment_date)
      ORDER BY month_start ASC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Revenue trend error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ─────────────────────────────────────────────
// GET /api/dashboard/genres
// สถิติ genre ยอดนิยม
// ─────────────────────────────────────────────
router.get('/genres', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         g.genre_id,
         g.genre_name,
         COUNT(mg.movie_id) AS movie_count
       FROM public.genre g
       LEFT JOIN public.movie_genre mg ON g.genre_id = mg.genre_id
       GROUP BY g.genre_id
       ORDER BY movie_count DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Genre stats error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

module.exports = router;
