const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const axios   = require('axios');
const FormData = require('form-data');
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

    // ==========================================
    // EasySlip Verification
    // ==========================================
    let paymentStatus = 0; // 0 = pending
    let isAutoApproved = false;
    let easySlipMessage = '';

    try {
      const apiKey = process.env.EASYSLIP_API_KEY;
      if (apiKey && apiKey !== 'YOUR_EASYSLIP_API_KEY_HERE') {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path));

        const response = await axios.post('https://developer.easyslip.com/api/v1/verify', formData, {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${apiKey}`,
          },
        });

        if (response.data && response.data.status === 200) {
          const slipData = response.data.data;
          
          // ตรวจสอบยอดเงินว่าตรงกับที่ซื้อหรือไม่ (อนุโลมให้ถ้าโอนมามากกว่าหรือเท่ากับ)
          if (slipData.amount.amount >= parseFloat(amount)) {
            paymentStatus = 1; // 1 = success
            isAutoApproved = true;
          } else {
            // ยอดเงินไม่พอ
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, message: `ยอดเงินในสลิป (${slipData.amount.amount} บาท) ไม่ตรงกับราคาสินค้า (${amount} บาท)` });
          }
        } else {
          // สลิปปลอม หรือตรวจสอบไม่ผ่าน
          await client.query('ROLLBACK');
          return res.status(400).json({ success: false, message: 'สลิปไม่ถูกต้อง หรือไม่สามารถตรวจสอบได้' });
        }
      }
    } catch (apiErr) {
      console.error('EasySlip API Error:', apiErr.response ? apiErr.response.data : apiErr.message);
      
      const apiErrorData = apiErr.response ? apiErr.response.data : null;
      
      // หากเกิดข้อผิดพลาด 4xx จาก EasySlip (เช่น สลิปปลอม, อ่านไม่ออก, สลิปซ้ำ) ให้บล็อกทันที ไม่ยอมให้ผ่าน
      if (apiErr.response && apiErr.response.status >= 400 && apiErr.response.status < 500) {
        await client.query('ROLLBACK');
        let errMsg = 'ตรวจสอบพบสลิปมีปัญหา';
        if (apiErrorData && apiErrorData.message) errMsg += ': ' + apiErrorData.message;
        
        return res.status(400).json({ 
          success: false, 
          message: errMsg,
          errorDetail: apiErrorData
        });
      }

      // หาก API ล่ม (5xx) ให้ข้ามไปใช้ระบบรอ Admin ตรวจสอบแทน (Fallback to Manual)
      paymentStatus = 0;
      easySlipMessage = 'ระบบตรวจสอบสลิปอัตโนมัติขัดข้อง เปลี่ยนเป็นระบบรอ Admin ตรวจสอบ';
    }

    // 2. Create payment record (status = 1 if auto-approved, 0 if pending)
    const paymentResult = await client.query(
      `INSERT INTO public.payment (user_id, cart_id, amount, slip_id, qr_ref, status, payment_date, expired_at, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW() + INTERVAL '24 hours', ${isAutoApproved ? 'NOW()' : 'NULL'}) RETURNING *`,
      [user_id, cart_id, parseFloat(amount), slip.slip_id, PAYMENT_QR_REF, paymentStatus]
    );

    // 3. ถ้าอนุมัติอัตโนมัติ ให้เพิ่มหนังเข้า Library และลบตะกร้าทิ้งทันที!
    if (isAutoApproved) {
      const cartMovies = await client.query(`SELECT movie_id FROM public.cart_movies WHERE cart_id = $1`, [cart_id]);
      
      for (const row of cartMovies.rows) {
        await client.query(
          `INSERT INTO public.library (user_id, movie_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [user_id, row.movie_id]
        );
      }

      await client.query(`DELETE FROM public.cart_movies WHERE cart_id = $1`, [cart_id]);
    }

    await client.query('COMMIT');
    
    res.status(201).json({
      success: true,
      message: isAutoApproved ? 'ชำระเงินสำเร็จ หนังถูกเพิ่มเข้า Library แล้ว!' : 'ส่งหลักฐานสำเร็จ กรุณารอการยืนยัน',
      autoApproved: isAutoApproved,
      warning: easySlipMessage || undefined,
      payment: paymentResult.rows[0],
      slip: slip
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Checkout error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ'});
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
