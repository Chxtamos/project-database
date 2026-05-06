const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();

const router = express.Router();

// ─────────────────────────────────────────────
// POST /api/auth/register
// Fields: username, email, telephone, password
// ─────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { username, email, telephone, password } = req.body;

  if (!username || !email || !telephone || !password) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบ (username, email, telephone, password)' });
  }

  try {
    // ตรวจสอบ email ซ้ำ
    const existing = await pool.query('SELECT user_id FROM public.users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Email นี้ถูกใช้งานแล้ว' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO public.users (username, email, telephone, password)
       VALUES ($1, $2, $3, $4)
       RETURNING user_id, username, email, telephone, created_at`,
      [username, email, telephone, hashed]
    );

    res.status(201).json({ success: true, message: 'สมัครสมาชิกสำเร็จ', user: result.rows[0] });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/login
// Fields: email, password
// ─────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'กรุณากรอก email และ password' });
  }

  try {
    const result = await pool.query('SELECT * FROM public.users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Email หรือรหัสผ่านไม่ถูกต้อง' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email หรือรหัสผ่านไม่ถูกต้อง' });
    }

    const token = jwt.sign(
      { id: user.user_id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: {
        user_id:   user.user_id,
        username:  user.username,
        email:     user.email,
        telephone: user.telephone,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

module.exports = router;
