const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const client = new Client({
  host: 'localhost',
  port: 5433,
  database: 'pgadmin4',
  user: 'root',
  password: 'root',
});

async function run() {
  try {
    await client.connect();
    
    // Create admins table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.admins (
        admin_id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Admins table created or already exists.');

    // Check if admin exists
    const email = 'admin@movie.com';
    const res = await client.query('SELECT * FROM public.admins WHERE email = $1', [email]);
    
    if (res.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin', 10);
      await client.query(
        'INSERT INTO public.admins (username, email, password) VALUES ($1, $2, $3)',
        ['SuperAdmin', email, hashedPassword]
      );
      console.log('Inserted default admin: admin@movie.com / admin');
    } else {
      console.log('Default admin already exists in the admins table.');
    }
    
  } catch (err) {
    console.error('Error creating admins table or seeding:', err);
  } finally {
    await client.end();
  }
}

run();
