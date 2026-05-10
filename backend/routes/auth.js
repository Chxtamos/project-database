const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { touchOnlineUser } = require('../onlineUsers');
require('dotenv').config();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sendTestEmail = async (to, subject, text) => {
  try {
    let testAccount = await nodemailer.createTestAccount();
    let transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    let info = await transporter.sendMail({
      from: '"FlimHub Admin" <noreply@flimhub.com>',
      to: to,
      subject: subject,
      text: text,
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return nodemailer.getTestMessageUrl(info);
  } catch (error) {
    console.error("Email error:", error);
  }
};

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
       RETURNING user_id, username, email, telephone, register_date`,
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
  const nextEmail = typeof email === 'string' ? email.trim() : email;

  if (!nextEmail || !password) {
    return res.status(400).json({ success: false, message: 'กรุณากรอก email และ password' });
  }

  if (!EMAIL_PATTERN.test(nextEmail)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  }

  try {
    // 1. Check admins table
    let result = await pool.query('SELECT * FROM public.admins WHERE email = $1', [nextEmail]);
    let role = 'admin';
    let user = null;

    if (result.rows.length > 0) {
      user = result.rows[0];
    } else {
      // 2. If not admin, check users table
      result = await pool.query('SELECT * FROM public.users WHERE email = $1', [nextEmail]);
      if (result.rows.length > 0) {
        user = result.rows[0];
        role = 'user';
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Email หรือรหัสผ่านไม่ถูกต้อง' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email หรือรหัสผ่านไม่ถูกต้อง' });
    }

    const userId = role === 'admin' ? user.admin_id : user.user_id;

    const token = jwt.sign(
      { id: userId, email: user.email, username: user.username, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    touchOnlineUser({ id: userId, role });

    res.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: {
        user_id:   userId,
        username:  user.username,
        email:     user.email,
        role:      role,
        ...(role === 'user' && { telephone: user.telephone })
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/forgot-password
// ─────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'กรุณากรอก email' });

  try {
    const result = await pool.query('SELECT user_id FROM public.users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบอีเมลนี้ในระบบ' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 3600000); // 1 hour

    await pool.query(
      'UPDATE public.users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3',
      [resetToken, resetExpiry, email]
    );

    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}&email=${email}`;
    const previewUrl = await sendTestEmail(email, 'FlimHub - Reset Password', `กรุณาคลิกลิงก์นี้เพื่อรีเซ็ตรหัสผ่านของคุณ:\n\n${resetUrl}`);

    res.json({ success: true, message: 'ส่งอีเมลรีเซ็ตรหัสผ่านเรียบร้อยแล้ว (ตรวจสอบ Console)', previewUrl });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/reset-password
// ─────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword) return res.status(400).json({ success: false, message: 'ข้อมูลไม่ครบถ้วน' });

  try {
    const result = await pool.query(
      'SELECT user_id FROM public.users WHERE email = $1 AND reset_token = $2 AND reset_token_expiry > NOW()',
      [email, token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Token ไม่ถูกต้องหรือหมดอายุ' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE public.users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE email = $2',
      [hashed, email]
    );

    res.json({ success: true, message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/request-email-change
// ─────────────────────────────────────────────
router.post('/request-email-change', async (req, res) => {
  const { currentEmail, newEmail } = req.body;
  if (!currentEmail || !newEmail) return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบ' });

  try {
    const existing = await pool.query('SELECT user_id FROM public.users WHERE email = $1', [newEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'อีเมลใหม่นี้ถูกใช้งานแล้ว' });
    }

    const verifyToken = crypto.randomBytes(32).toString('hex');
    const verifyExpiry = new Date(Date.now() + 3600000); // 1 hour

    await pool.query(
      'UPDATE public.users SET new_email_pending = $1, verify_email_token = $2, verify_email_expiry = $3 WHERE email = $4',
      [newEmail, verifyToken, verifyExpiry, currentEmail]
    );

    const verifyUrl = `http://localhost:5173/verify-email?token=${verifyToken}&email=${currentEmail}`;
    const previewUrl = await sendTestEmail(currentEmail, 'FlimHub - Verify Email Change', `กรุณาคลิกลิงก์นี้เพื่อยืนยันการเปลี่ยนอีเมลเป็น ${newEmail}:\n\n${verifyUrl}`);

    res.json({ success: true, message: 'ส่งอีเมลยืนยันไปยังอีเมลเดิมของคุณแล้ว', previewUrl });
  } catch (err) {
    console.error('Request email change error:', err);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/verify-email-change
// ─────────────────────────────────────────────
router.post('/verify-email-change', async (req, res) => {
  const { email, token } = req.body;
  if (!email || !token) return res.status(400).json({ success: false, message: 'ข้อมูลไม่ครบถ้วน' });

  try {
    const result = await pool.query(
      'SELECT user_id, new_email_pending FROM public.users WHERE email = $1 AND verify_email_token = $2 AND verify_email_expiry > NOW()',
      [email, token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Token ไม่ถูกต้องหรือหมดอายุ' });
    }

    const newEmail = result.rows[0].new_email_pending;
    
    await pool.query(
      'UPDATE public.users SET email = $1, new_email_pending = NULL, verify_email_token = NULL, verify_email_expiry = NULL WHERE email = $2',
      [newEmail, email]
    );

    res.json({ success: true, message: 'เปลี่ยนอีเมลสำเร็จ', newEmail });
  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

module.exports = router;
