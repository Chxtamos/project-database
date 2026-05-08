const express = require('express');
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// ─────────────────────────────────────────────
// GET /api/playlists/:user_id
// ดึง playlists ทั้งหมดของ user พร้อมจำนวนหนัง
// ─────────────────────────────────────────────
router.get('/:user_id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         p.playlist_id,
         p.playlist_name,
         l.library_id,
         l.user_id,
         COUNT(pm.movie_id) AS movie_count
       FROM public.playlist p
       JOIN public.library l ON p.library_id = l.library_id
       LEFT JOIN public.playlist_movie pm ON p.playlist_id = pm.playlist_id
       WHERE l.user_id = $1
       GROUP BY p.playlist_id, p.playlist_name, l.library_id, l.user_id
       ORDER BY p.playlist_id DESC`,
      [req.params.user_id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Get playlists error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ─────────────────────────────────────────────
// GET /api/playlists/:playlist_id/movies
// ดึงหนังใน playlist
// ─────────────────────────────────────────────
router.get('/:playlist_id/movies', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*
       FROM public.playlist_movie pm
       JOIN public.movies m ON pm.movie_id = m.movie_id
       WHERE pm.playlist_id = $1
       ORDER BY m.movie_id`,
      [req.params.playlist_id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Get playlist movies error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ─────────────────────────────────────────────
// POST /api/playlists
// สร้าง playlist ใหม่
// Body: user_id, playlist_name
// ─────────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  const { user_id, playlist_name } = req.body;
  if (!user_id || !playlist_name) {
    return res.status(400).json({ success: false, message: 'user_id, playlist_name เป็นข้อมูลที่จำเป็น' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // หรือสร้าง library entry ชั่วคราวเพื่อ link playlist
    // ตรวจว่า user มี library entry อยู่แล้วไหม ถ้าไม่มีให้หา movie ตัวแรกมาสร้าง
    let libraryRes = await client.query(
      'SELECT library_id FROM public.library WHERE user_id = $1 LIMIT 1',
      [user_id]
    );

    let library_id;
    if (libraryRes.rows.length > 0) {
      library_id = libraryRes.rows[0].library_id;
    } else {
      // สร้าง placeholder library entry ด้วย movie ตัวแรกที่มี
      const movieRes = await client.query('SELECT movie_id FROM public.movies LIMIT 1');
      if (movieRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'ไม่พบหนังในระบบ ไม่สามารถสร้าง playlist ได้' });
      }
      const newLib = await client.query(
        'INSERT INTO public.library (user_id, movie_id) VALUES ($1, $2) RETURNING library_id',
        [user_id, movieRes.rows[0].movie_id]
      );
      library_id = newLib.rows[0].library_id;
    }

    const result = await client.query(
      'INSERT INTO public.playlist (playlist_name, library_id) VALUES ($1, $2) RETURNING *',
      [playlist_name, library_id]
    );

    await client.query('COMMIT');
    res.status(201).json({ success: true, message: 'สร้าง playlist สำเร็จ', data: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create playlist error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  } finally {
    client.release();
  }
});

// ─────────────────────────────────────────────
// POST /api/playlists/:playlist_id/movies
// เพิ่มหนังเข้า playlist
// Body: movie_id
// ─────────────────────────────────────────────
router.post('/:playlist_id/movies', authMiddleware, async (req, res) => {
  const { movie_id } = req.body;
  if (!movie_id) {
    return res.status(400).json({ success: false, message: 'movie_id เป็นข้อมูลที่จำเป็น' });
  }
  try {
    await pool.query(
      'INSERT INTO public.playlist_movie (playlist_id, movie_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.params.playlist_id, movie_id]
    );
    res.json({ success: true, message: 'เพิ่มหนังเข้า playlist สำเร็จ' });
  } catch (err) {
    console.error('Add to playlist error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ─────────────────────────────────────────────
// PATCH /api/playlists/:playlist_id/rename
// เปลี่ยนชื่อ playlist
// Body: { playlist_name }
// ─────────────────────────────────────────────
router.patch('/:playlist_id/rename', authMiddleware, async (req, res) => {
  const { playlist_name } = req.body;
  if (!playlist_name || !playlist_name.trim()) {
    return res.status(400).json({ success: false, message: 'กรุณาระบุชื่อ playlist' });
  }
  try {
    const result = await pool.query(
      'UPDATE public.playlist SET playlist_name = $1 WHERE playlist_id = $2 RETURNING *',
      [playlist_name.trim(), req.params.playlist_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบ playlist' });
    }
    res.json({ success: true, message: 'เปลี่ยนชื่อสำเร็จ', data: result.rows[0] });
  } catch (err) {
    console.error('Rename playlist error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ─────────────────────────────────────────────
// PUT /api/playlists/:playlist_id/movies/sync
// บันทึกหนังใน playlist ใหม่ทั้งหมด (replace)
// Body: { movie_ids: [1, 2, 3, ...] }
// ─────────────────────────────────────────────
router.put('/:playlist_id/movies/sync', authMiddleware, async (req, res) => {
  const { movie_ids } = req.body;
  if (!Array.isArray(movie_ids)) {
    return res.status(400).json({ success: false, message: 'movie_ids ต้องเป็น array' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // ลบหนังทั้งหมดใน playlist ก่อน
    await client.query(
      'DELETE FROM public.playlist_movie WHERE playlist_id = $1',
      [req.params.playlist_id]
    );
    // เพิ่มหนังใหม่ทั้งหมด
    for (const movie_id of movie_ids) {
      await client.query(
        'INSERT INTO public.playlist_movie (playlist_id, movie_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [req.params.playlist_id, movie_id]
      );
    }
    await client.query('COMMIT');
    res.json({ success: true, message: 'บันทึก playlist สำเร็จ', count: movie_ids.length });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Sync playlist movies error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  } finally {
    client.release();
  }
});

// ─────────────────────────────────────────────
// DELETE /api/playlists/:playlist_id
// ─────────────────────────────────────────────
router.delete('/:playlist_id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM public.playlist_movie WHERE playlist_id = $1', [req.params.playlist_id]);
    await pool.query('DELETE FROM public.playlist WHERE playlist_id = $1', [req.params.playlist_id]);
    res.json({ success: true, message: 'ลบ playlist สำเร็จ' });
  } catch (err) {
    console.error('Delete playlist error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/playlists/:playlist_id/movies/:movie_id
// ลบหนังออกจาก playlist
// ─────────────────────────────────────────────
router.delete('/:playlist_id/movies/:movie_id', authMiddleware, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM public.playlist_movie WHERE playlist_id = $1 AND movie_id = $2',
      [req.params.playlist_id, req.params.movie_id]
    );
    res.json({ success: true, message: 'ลบหนังออกจาก playlist สำเร็จ' });
  } catch (err) {
    console.error('Remove from playlist error:', err.message);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

module.exports = router;
