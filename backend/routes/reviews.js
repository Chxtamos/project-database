const express = require('express');
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// ─────────────────────────────────────────────
// GET /api/reviews
// ดึง reviews ทั้งหมด + JOIN movie + user
// Query: ?movie_id=&user_id=&page=1&limit=10
// ─────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  const { movie_id = '', user_id = '', page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (movie_id) {
      conditions.push(`r.movie_id = $${idx++}`);
      values.push(parseInt(movie_id));
    }
    if (user_id) {
      conditions.push(`r.user_id = $${idx++}`);
      values.push(parseInt(user_id));
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countResult = await pool.query(`SELECT COUNT(*) FROM public.review r ${where}`, values);
    const total = parseInt(countResult.rows[0].count);

    values.push(parseInt(limit), offset);
    const result = await pool.query(
      `SELECT
         r.*,
         u.username,
         m.movie_name
       FROM public.review r
       JOIN public.users u ON r.user_id = u.user_id
       JOIN public.movies m ON r.movie_id = m.movie_id
       ${where}
       ORDER BY r.date_review DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      values
    );

    res.json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: result.rows,
    });
  } catch (err) {
    console.error('Get reviews error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ─────────────────────────────────────────────
// GET /api/reviews/:id
// ─────────────────────────────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.username, m.movie_name
       FROM public.review r
       JOIN public.users u ON r.user_id = u.user_id
       JOIN public.movies m ON r.movie_id = m.movie_id
       WHERE r.review_id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบรีวิว' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Get review error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ─────────────────────────────────────────────
// POST /api/reviews
// Body: user_id, movie_id, review_number, rating, comment
// ─────────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  const { user_id, movie_id, review_number, rating, comment } = req.body;

  if (!user_id || !movie_id || !review_number || !rating) {
    return res.status(400).json({ success: false, message: 'user_id, movie_id, review_number, rating เป็นข้อมูลที่จำเป็น' });
  }

  const ratingVal = parseFloat(rating);
  if (ratingVal < 0 || ratingVal > 5) {
    return res.status(400).json({ success: false, message: 'rating ต้องอยู่ระหว่าง 0-5' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO public.review (user_id, movie_id, review_number, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user_id, movie_id, parseInt(review_number), ratingVal, comment || null]
    );
    res.status(201).json({ success: true, message: 'เพิ่มรีวิวสำเร็จ', data: result.rows[0] });
  } catch (err) {
    console.error('Create review error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ─────────────────────────────────────────────
// PUT /api/reviews/:id
// Body: rating, comment, review_number
// ─────────────────────────────────────────────
router.put('/:id', authMiddleware, async (req, res) => {
  const { rating, comment, review_number } = req.body;

  try {
    const existing = await pool.query('SELECT * FROM public.review WHERE review_id = $1', [req.params.id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบรีวิว' });
    }

    const old = existing.rows[0];
    const result = await pool.query(
      `UPDATE public.review SET
         rating        = $1,
         comment       = $2,
         review_number = $3
       WHERE review_id = $4
       RETURNING *`,
      [
        rating        ? parseFloat(rating) : old.rating,
        comment       ?? old.comment,
        review_number ? parseInt(review_number) : old.review_number,
        req.params.id,
      ]
    );
    res.json({ success: true, message: 'อัปเดตรีวิวสำเร็จ', data: result.rows[0] });
  } catch (err) {
    console.error('Update review error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/reviews/:id
// ─────────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM public.review WHERE review_id = $1 RETURNING review_id',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบรีวิว' });
    }
    res.json({ success: true, message: 'ลบรีวิวสำเร็จ' });
  } catch (err) {
    console.error('Delete review error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ─────────────────────────────────────────────
// GET /api/reviews/reports/all
// ดึง report_review ทั้งหมด
// ─────────────────────────────────────────────
router.get('/reports/all', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         rr.*,
         u.username AS reporter_name,
         r.comment  AS review_comment,
         r.rating   AS review_rating,
         m.movie_name
       FROM public.report_review rr
       JOIN public.users u   ON rr.reporter_id = u.user_id
       JOIN public.review r  ON rr.review_id   = r.review_id
       JOIN public.movies m  ON r.movie_id      = m.movie_id
       ORDER BY rr.report_date DESC`
    );
    res.json({ success: true, total: result.rows.length, data: result.rows });
  } catch (err) {
    console.error('Get reports error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

module.exports = router;
