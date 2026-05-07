const express = require('express');
const multer = require('multer');
const path = require('path');
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// ─── Multer สำหรับอัพโหลด poster ───────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/posters')),
  filename:    (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, /jpeg|jpg|png|webp/.test(file.mimetype));
  },
});

// ─────────────────────────────────────────────
// GET /api/movies
// ดึง movies พร้อม genres (JOIN) + search/filter/pagination
// Query: ?search=&genre_id=&page=1&limit=10
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  const { search = '', genre_id = '', page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (search) {
      conditions.push(`m.movie_name ILIKE $${idx++}`);
      values.push(`%${search}%`);
    }
    if (genre_id) {
      conditions.push(`mg.genre_id = $${idx++}`);
      values.push(parseInt(genre_id));
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // นับ total (ใช้ subquery เพื่อหลีกเลี่ยง duplicate จาก JOIN)
    const countResult = await pool.query(
      `SELECT COUNT(DISTINCT m.movie_id)
       FROM public.movies m
       LEFT JOIN public.movie_genre mg ON m.movie_id = mg.movie_id
       ${where}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    values.push(parseInt(limit), offset);
    const result = await pool.query(
      `SELECT
         m.movie_id,
         m.movie_name,
         m.movie_cost,
         m.movie_rating,
         m.movie_releasedate,
         m.movie_poster,
         COALESCE(
           json_agg(DISTINCT jsonb_build_object('genre_id', g.genre_id, 'genre_name', g.genre_name))
           FILTER (WHERE g.genre_id IS NOT NULL),
           '[]'
         ) AS genres
       FROM public.movies m
       LEFT JOIN public.movie_genre mg ON m.movie_id = mg.movie_id
       LEFT JOIN public.genre g ON mg.genre_id = g.genre_id
       ${where}
       GROUP BY m.movie_id
       ORDER BY m.movie_id DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      values
    );

    res.json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: result.rows,
    });
  } catch (err) {
    console.error('Get movies error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ─────────────────────────────────────────────
// GET /api/movies/:id
// ─────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         m.*,
         COALESCE(json_agg(DISTINCT jsonb_build_object('genre_id', g.genre_id, 'genre_name', g.genre_name)) FILTER (WHERE g.genre_id IS NOT NULL), '[]') AS genres,
         COALESCE(json_agg(DISTINCT jsonb_build_object('actor_id', a.actor_id, 'actor_name', a.actor_name)) FILTER (WHERE a.actor_id IS NOT NULL), '[]') AS actors,
         COALESCE(json_agg(DISTINCT jsonb_build_object('author_id', au.author_id, 'author_name', au.author_name)) FILTER (WHERE au.author_id IS NOT NULL), '[]') AS authors
       FROM public.movies m
       LEFT JOIN public.movie_genre mg ON m.movie_id = mg.movie_id
       LEFT JOIN public.genre g ON mg.genre_id = g.genre_id
       LEFT JOIN public.movie_actor ma ON m.movie_id = ma.movie_id
       LEFT JOIN public.actor a ON ma.actor_id = a.actor_id
       LEFT JOIN public.movie_author mau ON m.movie_id = mau.movie_id
       LEFT JOIN public.author au ON mau.author_id = au.author_id
       WHERE m.movie_id = $1
       GROUP BY m.movie_id`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบภาพยนตร์' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Get movie error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ─────────────────────────────────────────────
// POST /api/movies
// Body: movie_name, movie_cost, movie_rating, movie_releasedate
// File: poster (multipart)
// genre_ids: comma-separated string "1,2,3"
// ─────────────────────────────────────────────
router.post('/', authMiddleware, upload.single('poster'), async (req, res) => {
  const { movie_name, movie_cost, movie_rating, movie_releasedate, genre_ids, poster_url } = req.body;

  if (!movie_name || !movie_cost || !movie_releasedate) {
    return res.status(400).json({ success: false, message: 'movie_name, movie_cost, movie_releasedate เป็นข้อมูลที่จำเป็น' });
  }

  const poster = req.file
    ? `/uploads/posters/${req.file.filename}`
    : (poster_url || 'https://example.com/default-poster.png');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const movieResult = await client.query(
      `INSERT INTO public.movies (movie_name, movie_cost, movie_rating, movie_releasedate, movie_poster)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [movie_name, parseFloat(movie_cost), movie_rating ? parseInt(movie_rating) : null, movie_releasedate, poster]
    );
    const newMovie = movieResult.rows[0];

    // เพิ่ม genres ถ้ามี
    if (genre_ids) {
      let ids = [];
      if (Array.isArray(genre_ids)) {
        ids = genre_ids.map(id => parseInt(id)).filter(Boolean);
      } else if (typeof genre_ids === 'string') {
        ids = genre_ids.split(',').map(id => parseInt(id.trim())).filter(Boolean);
      }
      for (const gid of ids) {
        await client.query(
          'INSERT INTO public.movie_genre (movie_id, genre_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [newMovie.movie_id, gid]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ success: true, message: 'เพิ่มภาพยนตร์สำเร็จ', data: newMovie });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create movie error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  } finally {
    client.release();
  }
});

// ─────────────────────────────────────────────
// PUT /api/movies/:id
// ─────────────────────────────────────────────
router.put('/:id', authMiddleware, upload.single('poster'), async (req, res) => {
  const { movie_name, movie_cost, movie_rating, movie_releasedate, genre_ids, poster_url } = req.body;

  const client = await pool.connect();
  try {
    const existing = await client.query('SELECT * FROM public.movies WHERE movie_id = $1', [req.params.id]);
    if (existing.rows.length === 0) {
      client.release();
      return res.status(404).json({ success: false, message: 'ไม่พบภาพยนตร์' });
    }

    const old = existing.rows[0];
    const poster = req.file ? `/uploads/posters/${req.file.filename}` : (poster_url || old.movie_poster);

    await client.query('BEGIN');

    const result = await client.query(
      `UPDATE public.movies SET
         movie_name        = $1,
         movie_cost        = $2,
         movie_rating      = $3,
         movie_releasedate = $4,
         movie_poster      = $5
       WHERE movie_id = $6
       RETURNING *`,
      [
        movie_name        ?? old.movie_name,
        movie_cost        ? parseFloat(movie_cost) : old.movie_cost,
        movie_rating      ? parseInt(movie_rating) : old.movie_rating,
        movie_releasedate ?? old.movie_releasedate,
        poster,
        req.params.id,
      ]
    );

    // อัปเดต genres ถ้ามี genre_ids ส่งมา
    if (genre_ids !== undefined) {
      await client.query('DELETE FROM public.movie_genre WHERE movie_id = $1', [req.params.id]);
      let ids = [];
      if (Array.isArray(genre_ids)) {
        ids = genre_ids.map(id => parseInt(id)).filter(Boolean);
      } else if (typeof genre_ids === 'string') {
        ids = genre_ids.split(',').map(id => parseInt(id.trim())).filter(Boolean);
      }
      for (const gid of ids) {
        await client.query(
          'INSERT INTO public.movie_genre (movie_id, genre_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [req.params.id, gid]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'อัปเดตภาพยนตร์สำเร็จ', data: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Update movie error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  } finally {
    client.release();
  }
});

// ─────────────────────────────────────────────
// DELETE /api/movies/:id
// ─────────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM public.movies WHERE movie_id = $1 RETURNING movie_id',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบภาพยนตร์' });
    }
    res.json({ success: true, message: 'ลบภาพยนตร์สำเร็จ' });
  } catch (err) {
    console.error('Delete movie error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

module.exports = router;
