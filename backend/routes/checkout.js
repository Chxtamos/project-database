const express = require('express');
const multer  = require('multer');
const path    = require('path');
const pool    = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const PAYMENT_QR_REF = '/qr_codes/promptpay_qr.jpg';

// ─── Multer for slip image upload ──────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/slips')),
  filename:    (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    cb(null, /jpeg|jpg|png|webp|pdf/.test(file.mimetype));
  },
});

// ─────────────────────────────────────────────
// POST /api/checkout
// Body (multipart): user_id, cart_id, amount, slip (file)
// 1. Upload slip image
// 2. Insert transfer_slip record
// 3. Create payment record linked to slip (status=0 pending)
// NOTE: Movies are NOT added to library until admin approves payment
// ─────────────────────────────────────────────
router.post('/', authMiddleware, upload.single('slip'), async (req, res) => {
  const { user_id, cart_id, amount } = req.body;

  if (!user_id || !cart_id || !amount || !req.file) {
    return res.status(400).json({
      success: false,
      message: 'user_id, cart_id, amount และรูปสลิป เป็นข้อมูลที่จำเป็น'
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 0. ตรวจสอบว่า cart มี movies อยู่จริง
    const cartMoviesCheck = await client.query(
      `SELECT COUNT(*) FROM public.cart_movies WHERE cart_id = $1`,
      [cart_id]
    );
    if (parseInt(cartMoviesCheck.rows[0].count) === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'ไม่มีสินค้าใน cart กรุณาเพิ่มหนังก่อน checkout' });
    }

    // 0b. ตรวจสอบว่า cart นี้ยังไม่มี payment pending อยู่
    const pendingCheck = await client.query(
      `SELECT payment_id FROM public.payment WHERE cart_id = $1 AND status = 0`,
      [cart_id]
    );
    if (pendingCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'cart นี้มีการชำระเงินที่รอการยืนยันอยู่แล้ว กรุณารอ Admin ตรวจสอบ' });
    }

    const slip_image = `/uploads/slips/${req.file.filename}`;

    // 1. Insert transfer_slip
    const slipResult = await client.query(
      `INSERT INTO public.transfer_slip (user_id, slip_image, amount)
       VALUES ($1, $2, $3) RETURNING *`,
      [user_id, slip_image, parseFloat(amount)]
    );
    const slip = slipResult.rows[0];

    // 2. Create payment record (status 0 = pending, waiting admin approve)
    const paymentResult = await client.query(
      `INSERT INTO public.payment (user_id, cart_id, amount, slip_id, qr_ref, status, payment_date, expired_at)
       VALUES ($1, $2, $3, $4, $5, 0, NOW(), NOW() + INTERVAL '24 hours') RETURNING *`,
      [user_id, cart_id, parseFloat(amount), slip.slip_id, PAYMENT_QR_REF]
    );

    await client.query('COMMIT');
    res.status(201).json({
      success: true,
      message: 'ส่งหลักฐานการโอนเงินสำเร็จ กรุณารอการยืนยันจากผู้ดูแลระบบ',
      payment: paymentResult.rows[0],
      slip: slip
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Checkout error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  } finally {
    client.release();
  }
});

// ─────────────────────────────────────────────
// GET /api/checkout/slip/:slip_id
// ดึงข้อมูล slip รายตัว
// ─────────────────────────────────────────────
router.get('/slip/:slip_id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM public.transfer_slip WHERE slip_id = $1',
      [req.params.slip_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบ slip' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Get slip error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ─────────────────────────────────────────────
// GET /api/checkout/slips/:user_id
// ดึงประวัติ slip ของ user
// ─────────────────────────────────────────────
router.get('/slips/:user_id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ts.*, p.status, p.amount AS payment_amount, p.payment_date
       FROM public.transfer_slip ts
       LEFT JOIN public.payment p ON ts.slip_id = p.slip_id
       WHERE ts.user_id = $1
       ORDER BY ts.uploaded_at DESC`,
      [req.params.user_id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Get slips error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

module.exports = router;
