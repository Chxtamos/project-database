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
  await client.connect();
  const hashedPassword = await bcrypt.hash('admin', 10);
  const email = 'admin@movie.com';
  
  // Update the user directly based on the telephone we used before
  const res = await client.query(
    "UPDATE public.users SET email = $1, password = $2 WHERE telephone = '0000000000'",
    [email, hashedPassword]
  );
  
  if (res.rowCount > 0) {
    console.log('Updated existing user to admin@movie.com');
  } else {
    // If no user found, insert
    await client.query(
      'INSERT INTO public.users (username, email, telephone, password) VALUES ($1, $2, $3, $4)',
      ['Admin', email, '0000000000', hashedPassword]
    );
    console.log('Inserted new admin user admin@movie.com');
  }
  
  await client.end();
}

run().catch(console.error);
