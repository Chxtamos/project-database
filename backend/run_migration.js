require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function runMigration() {
  const fileName = process.argv[2];
  
  if (!fileName) {
    console.error('❌ Error: Please provide an SQL file name.');
    console.error('👉 Usage: node run_migration.js <filename.sql>');
    process.exit(1);
  }

  try {
    const sqlPath = path.join(__dirname, 'db', fileName);
    
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`File not found: ${sqlPath}`);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log(`Running migration: ${fileName}...`);
    await pool.query(sql);
    console.log(`✅ Migration successful! Executed ${fileName}.`);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

runMigration();
