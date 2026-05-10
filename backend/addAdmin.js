const bcrypt = require('bcryptjs');
const pool = require('./db');

const getArgValue = (name) => {
  const prefix = `--${name}=`;
  const inline = process.argv.find(arg => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length).trim();

  const index = process.argv.indexOf(`--${name}`);
  if (index !== -1) return (process.argv[index + 1] || '').trim();

  return '';
};

const username = getArgValue('username') || process.env.ADMIN_USERNAME;
const email = getArgValue('email') || process.env.ADMIN_EMAIL;
const password = getArgValue('password') || process.env.ADMIN_PASSWORD;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const showUsage = () => {
  console.log('Usage:');
  console.log('  node addAdmin.js --username "SuperAdmin" --email admin@example.com --password yourPassword');
  console.log('');
  console.log('Or use environment variables: ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD');
};

const addAdmin = async () => {
  if (!username || !email || !password) {
    console.error('Missing username, email, or password.');
    showUsage();
    process.exitCode = 1;
    return;
  }

  if (!EMAIL_PATTERN.test(email)) {
    console.error('Invalid email address.');
    process.exitCode = 1;
    return;
  }

  if (password.length < 4) {
    console.error('Password must be at least 4 characters.');
    process.exitCode = 1;
    return;
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.admins (
        admin_id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const existingAdmin = await pool.query(
      'SELECT admin_id FROM public.admins WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (existingAdmin.rows.length > 0) {
      console.error(`Admin already exists: ${email}`);
      process.exitCode = 1;
      return;
    }

    const existingUser = await pool.query(
      'SELECT user_id FROM public.users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.error(`This email is already used by a normal user: ${email}`);
      process.exitCode = 1;
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO public.admins (username, email, password)
       VALUES ($1, $2, $3)
       RETURNING admin_id, username, email, created_at`,
      [username, email, hashedPassword]
    );

    const admin = result.rows[0];
    console.log('Admin created successfully.');
    console.log(`ID: ${admin.admin_id}`);
    console.log(`Username: ${admin.username}`);
    console.log(`Email: ${admin.email}`);
  } catch (err) {
    console.error('Create admin failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

addAdmin();
