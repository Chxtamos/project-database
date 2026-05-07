const express = require('express');
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// ─────────────────────────────────────────────
// GET /api/library/:user_id
// ดึงหนังทั้งหมดใน library ของ user
// ─────────────────────────────────────────────
router.get('/:user_id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT l.library_id, l.user_id, l.favorite, m.*
       FROM public.library l
       JOIN public.movies m ON l.movie_id = m.movie_id
       WHERE l.user_id = $1
       ORDER BY l.library_id DESC`,
      [req.params.user_id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Get library error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ─────────────────────────────────────────────
// POST /api/library
// เพิ่มหนังเข้า library
// Body: user_id, movie_id
// ─────────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  const { user_id, movie_id } = req.body;
  if (!user_id || !movie_id) {
    return res.status(400).json({ success: false, message: 'user_id, movie_id เป็นข้อมูลที่จำเป็น' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO public.library (user_id, movie_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [user_id, movie_id]
    );
    res.status(201).json({ success: true, message: 'เพิ่มหนังเข้า library สำเร็จ', data: result.rows[0] });
  } catch (err) {
    console.error('Add to library error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ─────────────────────────────────────────────
// PATCH /api/library/:library_id/favorite
// Toggle favorite
// ─────────────────────────────────────────────
router.patch('/:library_id/favorite', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE public.library SET favorite = NOT favorite WHERE library_id = $1 RETURNING *`,
      [req.params.library_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบรายการ' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Toggle favorite error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/library/:library_id
// ─────────────────────────────────────────────
router.delete('/:library_id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM public.library WHERE library_id = $1', [req.params.library_id]);
    res.json({ success: true, message: 'ลบออกจาก library สำเร็จ' });
  } catch (err) {
    console.error('Delete library error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

module.exports = router;
