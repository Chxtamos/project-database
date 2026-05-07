const pool = require('./db');

(async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ลบ payment เก่าที่ไม่มี slip (ทดสอบจากระบบเก่า)
    const deleted = await client.query(`
      DELETE FROM public.payment WHERE slip_id IS NULL RETURNING payment_id
    `);
    console.log('Deleted old payments (no slip):', deleted.rows.map(r => r.payment_id));

    // ลบ cart_movies ที่ว่าง (cart ที่ถูก clear แล้ว)
    // และสร้าง cart ใหม่สำหรับ user 13
    const existingCart = await client.query(
      `SELECT cart_id FROM public.cart WHERE user_id = 13 
       AND NOT EXISTS (
         SELECT 1 FROM public.payment p WHERE p.cart_id = cart.cart_id AND p.status = 1
       )
       ORDER BY cart_id DESC LIMIT 1`,
    );
    
    let cartId;
    if (existingCart.rows.length > 0) {
      cartId = existingCart.rows[0].cart_id;
      console.log('Using existing cart:', cartId);
    } else {
      const newCart = await client.query(
        `INSERT INTO public.cart (user_id) VALUES (13) RETURNING cart_id`
      );
      cartId = newCart.rows[0].cart_id;
      console.log('Created new cart:', cartId);
    }

    await client.query('COMMIT');
    console.log('\n✅ Reset complete. User 13 can now use cart:', cartId);
    process.exit(0);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    client.release();
  }
})();
