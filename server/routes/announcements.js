const express = require('express');
const router = express.Router();
const pool = require('../config/db');

function formatAnnouncement(a) {
  return {
    id: a.id,
    title: a.title,
    message: a.message,
    priority: a.priority,
    author: a.author,
    createdAt: a.created_at,
  };
}

// GET all announcements
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM announcements ORDER BY created_at DESC');
    res.json(rows.map(formatAnnouncement));
  } catch (err) {
    console.error('Error fetching announcements:', err);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// POST new announcement
router.post('/', async (req, res) => {
  try {
    const { title, message, priority = 'normal', author = 'Hostel Warden' } = req.body;
    const id = `ann-${Date.now()}`;
    await pool.query(
      'INSERT INTO announcements (id, title, message, priority, author) VALUES (?, ?, ?, ?, ?)',
      [id, title, message, priority, author]
    );
    res.status(201).json({ id, message: 'Announcement created successfully' });
  } catch (err) {
    console.error('Error creating announcement:', err);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

module.exports = router;
