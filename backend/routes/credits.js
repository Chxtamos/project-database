const express = require('express');
const pool = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

const TABLES = {
  actors: {
    table: 'actor',
    id: 'actor_id',
    name: 'actor_name',
    relation: 'movie_actor',
  },
  authors: {
    table: 'author',
    id: 'author_id',
    name: 'author_name',
    relation: 'movie_author',
  },
};

const getConfig = (type) => TABLES[type];

const listItems = async (type, res) => {
  const config = getConfig(type);
  if (!config) {
    return res.status(404).json({ success: false, message: 'Invalid credit type.' });
  }

  const result = await pool.query(
    `SELECT
       c.${config.id},
       c.${config.name},
       COUNT(r.movie_id)::int AS movie_count
     FROM public.${config.table} c
     LEFT JOIN public.${config.relation} r ON c.${config.id} = r.${config.id}
     GROUP BY c.${config.id}, c.${config.name}
     ORDER BY c.${config.name}`
  );
  return res.json({ success: true, data: result.rows });
};

const createItem = async (type, req, res) => {
  const config = getConfig(type);
  const name = req.body?.name?.trim();
  if (!config) {
    return res.status(404).json({ success: false, message: 'Invalid credit type.' });
  }
  if (!name) {
    return res.status(400).json({ success: false, message: 'Name is required.' });
  }

  const duplicate = await pool.query(
    `SELECT ${config.id} FROM public.${config.table} WHERE LOWER(${config.name}) = LOWER($1) LIMIT 1`,
    [name]
  );
  if (duplicate.rows.length > 0) {
    return res.status(409).json({ success: false, message: 'This name already exists.' });
  }

  const result = await pool.query(
    `INSERT INTO public.${config.table} (${config.name}) VALUES ($1) RETURNING *`,
    [name]
  );
  return res.status(201).json({ success: true, data: result.rows[0] });
};

const updateItem = async (type, req, res) => {
  const config = getConfig(type);
  const name = req.body?.name?.trim();
  if (!config) {
    return res.status(404).json({ success: false, message: 'Invalid credit type.' });
  }
  if (!name) {
    return res.status(400).json({ success: false, message: 'Name is required.' });
  }

  const duplicate = await pool.query(
    `SELECT ${config.id} FROM public.${config.table} WHERE LOWER(${config.name}) = LOWER($1) AND ${config.id} <> $2 LIMIT 1`,
    [name, req.params.id]
  );
  if (duplicate.rows.length > 0) {
    return res.status(409).json({ success: false, message: 'This name already exists.' });
  }

  const result = await pool.query(
    `UPDATE public.${config.table}
     SET ${config.name} = $1
     WHERE ${config.id} = $2
     RETURNING *`,
    [name, req.params.id]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Item not found.' });
  }
  return res.json({ success: true, data: result.rows[0] });
};

const deleteItem = async (type, req, res) => {
  const config = getConfig(type);
  if (!config) {
    return res.status(404).json({ success: false, message: 'Invalid credit type.' });
  }

  const result = await pool.query(
    `DELETE FROM public.${config.table} WHERE ${config.id} = $1 RETURNING ${config.id}`,
    [req.params.id]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Item not found.' });
  }
  return res.json({ success: true });
};

router.get('/actors', async (req, res) => {
  try {
    await listItems('actors', res);
  } catch (err) {
    console.error('Get actors error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

router.get('/authors', async (req, res) => {
  try {
    await listItems('authors', res);
  } catch (err) {
    console.error('Get authors error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

router.post('/:type', authMiddleware, adminOnly, async (req, res) => {
  try {
    await createItem(req.params.type, req, res);
  } catch (err) {
    console.error('Create credit error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

router.put('/:type/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await updateItem(req.params.type, req, res);
  } catch (err) {
    console.error('Update credit error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

router.delete('/:type/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await deleteItem(req.params.type, req, res);
  } catch (err) {
    console.error('Delete credit error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

module.exports = router;
