const express = require('express');
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/genres — ดึง genres ทั้งหมด
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.genre ORDER BY genre_name');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Get genres error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// GET /api/genres/:id — ดึง genre เดี่ยว
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.genre WHERE genre_id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบ genre' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// POST /api/genres — เพิ่ม genre (admin)
router.post('/', authMiddleware, async (req, res) => {
  const { genre_name } = req.body;
  if (!genre_name) {
    return res.status(400).json({ success: false, message: 'genre_name เป็นข้อมูลที่จำเป็น' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO public.genre (genre_name) VALUES ($1) RETURNING *',
      [genre_name]
    );
    res.status(201).json({ success: true, message: 'เพิ่ม genre สำเร็จ', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// PUT /api/genres/:id — แก้ไข genre (admin)
router.put('/:id', authMiddleware, async (req, res) => {
  const { genre_name } = req.body;
  try {
    const result = await pool.query(
      'UPDATE public.genre SET genre_name = $1 WHERE genre_id = $2 RETURNING *',
      [genre_name, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบ genre' });
    }
    res.json({ success: true, message: 'อัปเดต genre สำเร็จ', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// DELETE /api/genres/:id — ลบ genre (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM public.genre WHERE genre_id = $1 RETURNING genre_id',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบ genre' });
    }
    res.json({ success: true, message: 'ลบ genre สำเร็จ' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

module.exports = router;
