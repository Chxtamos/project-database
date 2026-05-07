const pool = require('./db');

(async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Create transfer_slip table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.transfer_slip (
        slip_id        SERIAL PRIMARY KEY,
        user_id        INTEGER NOT NULL REFERENCES public.users(user_id),
        slip_image     TEXT NOT NULL,
        amount         NUMERIC(10, 2) NOT NULL,
        uploaded_at    TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Created table: transfer_slip');

    // 2. Drop old transaction_ref column (varchar) and add new one as FK
    // First check if column already references transfer_slip
    const fkCheck = await client.query(`
      SELECT constraint_name FROM information_schema.table_constraints
      WHERE table_name = 'payment' AND constraint_name = 'fk_payment_slip'
    `);

    if (fkCheck.rows.length === 0) {
      // Rename old column if exists
      const colCheck = await client.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_name='payment' AND column_name='transaction_ref'
      `);
      if (colCheck.rows.length > 0) {
        await client.query(`ALTER TABLE public.payment DROP COLUMN transaction_ref`);
        console.log('✅ Dropped old transaction_ref column');
      }

      // Add new slip_id FK column
      await client.query(`
        ALTER TABLE public.payment
        ADD COLUMN slip_id INTEGER REFERENCES public.transfer_slip(slip_id) ON DELETE SET NULL;
      `);
      console.log('✅ Added slip_id FK column to payment table');
    } else {
      console.log('ℹ️  FK already exists, skipping');
    }

    await client.query('COMMIT');
    console.log('\n🎉 Migration complete!');
    process.exit(0);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
  }
})();
