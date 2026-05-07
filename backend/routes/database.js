const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// ─── GET /api/database/tables ─────────────────────────────────
// List all tables in public schema with metadata
router.get('/tables', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        t.table_name,
        t.table_type,
        COALESCE(pg_size_pretty(pg_total_relation_size('"' || t.table_name || '"')), '?') AS total_size,
        COALESCE(
          (SELECT COUNT(*) FROM information_schema.columns c
           WHERE c.table_schema = 'public' AND c.table_name = t.table_name), 0
        ) AS column_count,
        obj_description(pc.oid, 'pg_class') AS comment
      FROM information_schema.tables t
      LEFT JOIN pg_class pc ON pc.relname = t.table_name AND pc.relkind IN ('r','v')
      WHERE t.table_schema = 'public'
      ORDER BY t.table_type, t.table_name
    `);
    res.json({ success: true, tables: result.rows });
  } catch (err) {
    console.error('Error listing tables:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/database/tables/:name ───────────────────────────
// Get columns info and preview rows for a specific table
router.get('/tables/:name', async (req, res) => {
  const { name } = req.params;
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  // Validate table name to prevent injection
  const validTable = await pool.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name=$1`,
    [name]
  );
  if (validTable.rows.length === 0) {
    return res.status(404).json({ success: false, message: `Table "${name}" not found.` });
  }

  try {
    // Column definitions
    const columns = await pool.query(`
      SELECT
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `, [name]);

    // Row count
    const countRes = await pool.query(`SELECT COUNT(*) AS total FROM "${name}"`);
    const total = parseInt(countRes.rows[0].total);

    // Data preview
    const dataRes = await pool.query(`SELECT * FROM "${name}" LIMIT $1 OFFSET $2`, [limit, offset]);

    res.json({
      success: true,
      table: name,
      columns: columns.rows,
      total,
      limit,
      offset,
      rows: dataRes.rows,
    });
  } catch (err) {
    console.error('Error fetching table data:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/database/query ──────────────────────────────────
// Execute arbitrary SQL (SELECT, CREATE, ALTER, INSERT, etc.)
router.post('/query', async (req, res) => {
  const { sql } = req.body;
  if (!sql || !sql.trim()) {
    return res.status(400).json({ success: false, message: 'SQL query is required.' });
  }

  const startTime = Date.now();
  try {
    const result = await pool.query(sql);
    const duration = Date.now() - startTime;

    res.json({
      success: true,
      command: result.command,
      rowCount: result.rowCount,
      fields: result.fields ? result.fields.map(f => ({ name: f.name, dataTypeID: f.dataTypeID })) : [],
      rows: result.rows || [],
      duration_ms: duration,
    });
  } catch (err) {
    const duration = Date.now() - startTime;
    console.error('SQL Error:', err.message);
    res.status(400).json({
      success: false,
      message: err.message,
      detail: err.detail || null,
      hint: err.hint || null,
      duration_ms: duration,
    });
  }
});

// ─── GET /api/database/info ────────────────────────────────────
// Database server info
router.get('/info', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        version() AS version,
        current_database() AS database,
        current_schema() AS schema,
        pg_size_pretty(pg_database_size(current_database())) AS db_size,
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public') AS table_count
    `);
    res.json({ success: true, info: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
