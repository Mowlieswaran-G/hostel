const express = require('express');
const router = express.Router();
const pool = require('../config/db');

function formatUser(u) {
  return {
    uid: u.id,
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    rollNumber: u.roll_number,
    phone: u.phone,
    roomNumber: u.room_number,
    floor: u.floor,
    hostel: u.hostel,
    createdAt: u.created_at,
  };
}

// GET profile by ID or email
router.get('/profile/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE id = ? OR email = ? LIMIT 1',
      [identifier, identifier]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(formatUser(rows[0]));
  } catch (err) {
    console.error('Error getting profile:', err);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// POST login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    let query = 'SELECT * FROM users WHERE (LOWER(email) = LOWER(?) OR LOWER(id) = LOWER(?) OR LOWER(roll_number) = LOWER(?))';
    const params = [email, email, email];

    if (password) {
      query += ' AND password = ?';
      params.push(password);
    }
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    const [rows] = await pool.query(query, params);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials or role' });
    }

    res.json({
      message: 'Login successful',
      user: formatUser(rows[0]),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST register user
router.post('/register', async (req, res) => {
  try {
    const {
      id = `user-${Date.now()}`,
      name,
      email,
      password = null,
      role = 'resident',
      rollNumber = null,
      phone = null,
      roomNumber = null,
      floor = null,
    } = req.body;

    await pool.query(
      `INSERT INTO users (id, name, email, password, role, roll_number, phone, room_number, floor)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         roll_number = COALESCE(VALUES(roll_number), roll_number),
         phone = COALESCE(VALUES(phone), phone),
         room_number = COALESCE(VALUES(room_number), room_number)`,
      [id, name, email, password, role, rollNumber, phone, roomNumber, floor]
    );

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    res.status(201).json({
      message: 'User registered/updated successfully',
      user: formatUser(rows[0]),
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST sync profile (for Google Auth or Firebase users)
router.post('/sync', async (req, res) => {
  try {
    const { uid, email, name, role = 'resident', rollNumber, roomNumber } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const defaultRoll = rollNumber || email.split('@')[0].toUpperCase();
    const defaultRoom = roomNumber || '101';
    const userId = uid || `uid-${Date.now()}`;
    await pool.query(
      `INSERT INTO users (id, name, email, role, roll_number, room_number, floor)
       VALUES (?, ?, ?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE
         name = COALESCE(VALUES(name), name),
         role = COALESCE(role, VALUES(role)),
         roll_number = COALESCE(roll_number, VALUES(roll_number)),
         room_number = COALESCE(room_number, VALUES(room_number))`,
      [userId, name || email.split('@')[0], email, role, defaultRoll, defaultRoom]
    );

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    res.json({
      user: formatUser(rows[0]),
    });
  } catch (err) {
    console.error('Sync error:', err);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

module.exports = router;
