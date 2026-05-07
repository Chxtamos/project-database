const express = require('express');
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// ─────────────────────────────────────────────
// GET /api/payments
// ดึง payment ทั้งหมด พร้อม JOIN users
// status: 0=pending, 1=success, 2=failed
// Query: ?status=&user_id=&page=1&limit=10
// ─────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  const { status = '', user_id = '', page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (status !== '') {
      conditions.push(`p.status = $${idx++}`);
      values.push(parseInt(status));
    }
    if (user_id) {
      conditions.push(`p.user_id = $${idx++}`);
      values.push(parseInt(user_id));
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countResult = await pool.query(`SELECT COUNT(*) FROM public.payment p ${where}`, values);
    const total = parseInt(countResult.rows[0].count);

    values.push(parseInt(limit), offset);
    const result = await pool.query(
      `SELECT
         p.*,
         u.username,
         u.email
       FROM public.payment p
       JOIN public.users u ON p.user_id = u.user_id
       ${where}
       ORDER BY p.payment_date DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      values
    );

    // Summary
    const summary = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 0)                     AS pending_count,
         COUNT(*) FILTER (WHERE status = 1)                     AS success_count,
         COUNT(*) FILTER (WHERE status = 2)                     AS failed_count,
         COALESCE(SUM(amount) FILTER (WHERE status = 1), 0)     AS total_revenue
       FROM public.payment`
    );

    res.json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      summary: summary.rows[0],
      data: result.rows,
    });
  } catch (err) {
    console.error('Get payments error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ─────────────────────────────────────────────
// GET /api/payments/:id
// ─────────────────────────────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.username, u.email
       FROM public.payment p
       JOIN public.users u ON p.user_id = u.user_id
       WHERE p.payment_id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบรายการชำระเงิน' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Get payment error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ─────────────────────────────────────────────
// POST /api/payments
// Body: user_id, cart_id, amount, expired_at, transaction_ref, qr_ref
// ─────────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  const { user_id, cart_id, amount, expired_at, transaction_ref, qr_ref } = req.body;

  if (!user_id || !cart_id || !amount || !expired_at) {
    return res.status(400).json({ success: false, message: 'user_id, cart_id, amount, expired_at เป็นข้อมูลที่จำเป็น' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO public.payment (user_id, cart_id, amount, transaction_ref, qr_ref, status, expired_at)
       VALUES ($1, $2, $3, $4, $5, 0, $6)
       RETURNING *`,
      [user_id, cart_id, parseFloat(amount), transaction_ref || null, qr_ref || null, expired_at]
    );
    res.status(201).json({ success: true, message: 'บันทึกการชำระเงินสำเร็จ', data: result.rows[0] });
  } catch (err) {
    console.error('Create payment error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ─────────────────────────────────────────────
// PATCH /api/payments/:id/status
// อัปเดต status: 0=pending, 1=success, 2=failed
// ─────────────────────────────────────────────
router.patch('/:id/status', authMiddleware, async (req, res) => {
  const { status } = req.body;

  if (status === undefined || ![0, 1, 2].includes(parseInt(status))) {
    return res.status(400).json({ success: false, message: 'status ต้องเป็น 0 (pending), 1 (success), หรือ 2 (failed)' });
  }

  try {
    const existing = await pool.query('SELECT * FROM public.payment WHERE payment_id = $1', [req.params.id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบรายการชำระเงิน' });
    }

    const payment = existing.rows[0];
    const newStatus = parseInt(status);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update payment status
      const result = await client.query(
        `UPDATE public.payment SET status = $1, completed_at = CASE WHEN $1 = 1 THEN NOW() ELSE completed_at END WHERE payment_id = $2 RETURNING *`,
        [newStatus, req.params.id]
      );

      // If admin approves (status = 1): add movies to library and clear cart
      if (newStatus === 1) {
        const cartMovies = await client.query(
          `SELECT movie_id FROM public.cart_movies WHERE cart_id = $1`,
          [payment.cart_id]
        );

        for (const row of cartMovies.rows) {
          await client.query(
            `INSERT INTO public.library (user_id, movie_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [payment.user_id, row.movie_id]
          );
        }

        // Clear cart after library is populated
        await client.query(
          `DELETE FROM public.cart_movies WHERE cart_id = $1`,
          [payment.cart_id]
        );
      }

      await client.query('COMMIT');
      res.json({ success: true, message: 'อัปเดตสถานะสำเร็จ', data: result.rows[0] });
    } catch (innerErr) {
      await client.query('ROLLBACK');
      throw innerErr;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Update payment status error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/payments/:id
// ─────────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM public.payment WHERE payment_id = $1 RETURNING payment_id',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบรายการชำระเงิน' });
    }
    res.json({ success: true, message: 'ลบรายการชำระเงินสำเร็จ' });
  } catch (err) {
    console.error('Delete payment error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

module.exports = router;
