const express = require('express');
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// ─────────────────────────────────────────────
// GET /api/cart/:user_id
// ดึง cart ของ user พร้อม movies ในนั้น
// ─────────────────────────────────────────────
router.get('/:user_id', authMiddleware, async (req, res) => {
  try {
    // หา cart ล่าสุดของ user ที่ยังไม่ถูก approve (ไม่มี payment status=1 ผูกอยู่)
    const cartResult = await pool.query(
      `SELECT c.* FROM public.cart c
       WHERE c.user_id = $1
         AND NOT EXISTS (
           SELECT 1 FROM public.payment p
           WHERE p.cart_id = c.cart_id AND p.status = 1
         )
       ORDER BY c.created_at DESC LIMIT 1`,
      [req.params.user_id]
    );

    if (cartResult.rows.length === 0) {
      return res.json({ success: true, data: null, message: 'ยังไม่มี cart' });
    }

    const cart = cartResult.rows[0];

    // ดึง movies ใน cart
    const moviesResult = await pool.query(
      `SELECT m.*
       FROM public.cart_movies cm
       JOIN public.movies m ON cm.movie_id = m.movie_id
       LEFT JOIN public.library l
         ON l.user_id = $2 AND l.movie_id = cm.movie_id
       WHERE cm.cart_id = $1
         AND l.library_id IS NULL`,
      [cart.cart_id, cart.user_id]
    );

    res.json({
      success: true,
      data: {
        ...cart,
        movies: moviesResult.rows,
        total_amount: moviesResult.rows.reduce((sum, m) => sum + parseFloat(m.movie_cost), 0),
      },
    });
  } catch (err) {
    console.error('Get cart error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ─────────────────────────────────────────────
// POST /api/cart
// สร้าง cart ใหม่สำหรับ user
// Body: user_id
// ─────────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) {
    return res.status(400).json({ success: false, message: 'user_id เป็นข้อมูลที่จำเป็น' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO public.cart (user_id) VALUES ($1) RETURNING *',
      [user_id]
    );
    res.status(201).json({ success: true, message: 'สร้าง cart สำเร็จ', data: result.rows[0] });
  } catch (err) {
    console.error('Create cart error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ─────────────────────────────────────────────
// POST /api/cart/:cart_id/movies
// เพิ่มภาพยนตร์เข้า cart
// Body: movie_id
// ─────────────────────────────────────────────
router.post('/:cart_id/movies', authMiddleware, async (req, res) => {
  const { movie_id } = req.body;
  if (!movie_id) {
    return res.status(400).json({ success: false, message: 'movie_id เป็นข้อมูลที่จำเป็น' });
  }
  try {
    // 1. ตรวจสอบว่า cart นี้เป็นของ user_id ใด
    const cartRes = await pool.query('SELECT user_id FROM public.cart WHERE cart_id = $1', [req.params.cart_id]);
    if (cartRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบ cart' });
    }
    const userId = cartRes.rows[0].user_id;

    // 2. ตรวจสอบว่ามีหนังใน library แล้วหรือยัง
    const libRes = await pool.query(
      'SELECT 1 FROM public.library WHERE user_id = $1 AND movie_id = $2',
      [userId, movie_id]
    );

    if (libRes.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'คุณเป็นเจ้าของภาพยนตร์เรื่องนี้แล้ว' });
    }

    // 3. เพิ่มเข้า cart
    await pool.query(
      'INSERT INTO public.cart_movies (cart_id, movie_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.params.cart_id, movie_id]
    );
    res.json({ success: true, message: 'เพิ่มภาพยนตร์เข้า cart สำเร็จ' });
  } catch (err) {
    console.error('Add to cart error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/cart/:cart_id/movies/:movie_id
// ลบภาพยนตร์ออกจาก cart
// ─────────────────────────────────────────────
router.delete('/:cart_id/movies/:movie_id', authMiddleware, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM public.cart_movies WHERE cart_id = $1 AND movie_id = $2',
      [req.params.cart_id, req.params.movie_id]
    );
    res.json({ success: true, message: 'ลบภาพยนตร์ออกจาก cart สำเร็จ' });
  } catch (err) {
    console.error('Remove from cart error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

module.exports = router;
