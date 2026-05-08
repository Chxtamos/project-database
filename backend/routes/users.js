const express = require('express');
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\d+$/;

// ─────────────────────────────────────────────
// GET /api/users
// ดึง users ทั้งหมด (พร้อม search และ pagination)
// ─────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  const { search = '', page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (search) {
      conditions.push(`(username ILIKE $${idx} OR email ILIKE $${idx} OR telephone ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countResult = await pool.query(`SELECT COUNT(*) FROM public.users ${where}`, values);
    const total = parseInt(countResult.rows[0].count);

    values.push(parseInt(limit), offset);
    const result = await pool.query(
      `SELECT user_id, username, email, telephone, register_date
       FROM public.users ${where}
       ORDER BY register_date DESC
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
    console.error('Get users error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ─────────────────────────────────────────────
// GET /api/users/:id
// ─────────────────────────────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT user_id, username, email, telephone, register_date FROM public.users WHERE user_id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Get user error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ─────────────────────────────────────────────
// PUT /api/users/:id
// แก้ไข username, email, telephone (ไม่เปลี่ยน password ที่นี่)
// ─────────────────────────────────────────────
router.put('/:id', authMiddleware, async (req, res) => {
    const { username, email, telephone } = req.body;
    const nextEmail = typeof email === 'string' ? email.trim() : email;
    const nextTelephone = typeof telephone === 'string' ? telephone.trim() : telephone;

    if (nextEmail !== undefined && !EMAIL_PATTERN.test(nextEmail)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    if (nextTelephone !== undefined && !PHONE_PATTERN.test(nextTelephone)) {
      return res.status(400).json({ success: false, message: 'Telephone must contain numbers only.' });
    }

  try {
    const existing = await pool.query('SELECT * FROM public.users WHERE user_id = $1', [req.params.id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้' });
    }

    const old = existing.rows[0];
    const result = await pool.query(
      `UPDATE public.users SET
         username  = $1,
         email     = $2,
         telephone = $3
      WHERE user_id = $4
       RETURNING user_id, username, email, telephone, register_date`,
      [username ?? old.username, nextEmail ?? old.email, nextTelephone ?? old.telephone, req.params.id]
    );
    res.json({ success: true, message: 'อัปเดตข้อมูลสำเร็จ', data: result.rows[0] });
  } catch (err) {
    console.error('Update user error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/users/:id
// ─────────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM public.users WHERE user_id = $1 RETURNING user_id',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้' });
    }
    res.json({ success: true, message: 'ลบผู้ใช้สำเร็จ' });
  } catch (err) {
    console.error('Delete user error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

module.exports = router;
