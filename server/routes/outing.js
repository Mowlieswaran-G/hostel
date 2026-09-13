const express = require('express');
const router = express.Router();
const pool = require('../config/db');

function formatOuting(o) {
  return {
    id: o.id,
    userId: o.user_id,
    residentName: o.resident_name,
    residentEmail: o.resident_email,
    rollNumber: o.roll_number,
    roomNumber: o.room_number,
    reason: o.reason,
    destination: o.destination,
    outDate: o.out_date,
    returnDate: o.return_date,
    status: o.status,
    createdAt: o.created_at,
    updatedAt: o.updated_at,
  };
}

// GET all outings (warden view)
router.get('/all', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM outing_requests ORDER BY created_at DESC');
    res.json(rows.map(formatOuting));
  } catch (err) {
    console.error('Error fetching outings:', err);
    res.status(500).json({ error: 'Failed to fetch outings' });
  }
});

// GET outings (optionally filtered by rollNumber or userId)
router.get('/', async (req, res) => {
  try {
    const { rollNumber, userId } = req.query;
    let query = 'SELECT * FROM outing_requests';
    const params = [];

    if (rollNumber) {
      query += ' WHERE roll_number = ?';
      params.push(rollNumber);
    } else if (userId) {
      query += ' WHERE user_id = ?';
      params.push(userId);
    }

    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows.map(formatOuting));
  } catch (err) {
    console.error('Error fetching outings:', err);
    res.status(500).json({ error: 'Failed to fetch outings' });
  }
});

// POST submit outing
router.post('/', async (req, res) => {
  try {
    const {
      reason,
      destination,
      outDate,
      returnDate,
      residentName = 'Resident',
      residentEmail = '',
      rollNumber = '',
      roomNumber = 'N/A',
      userId = null,
    } = req.body;

    const id = `out-${Date.now()}`;

    await pool.query(
      `INSERT INTO outing_requests 
        (id, user_id, resident_name, resident_email, roll_number, room_number, reason, destination, out_date, return_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [id, userId, residentName, residentEmail, rollNumber, roomNumber, reason, destination, outDate, returnDate]
    );

    res.status(201).json({ id, message: 'Outing request submitted successfully' });
  } catch (err) {
    console.error('Error submitting outing request:', err);
    res.status(500).json({ error: 'Failed to submit outing request' });
  }
});

// PUT approve / reject outing
router.put('/approve', async (req, res) => {
  try {
    const { id, status = 'approved' } = req.body;
    await pool.query(
      'UPDATE outing_requests SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );
    res.json({ message: `Outing request ${status}` });
  } catch (err) {
    console.error('Error updating outing:', err);
    res.status(500).json({ error: 'Failed to update outing' });
  }
});

// PUT update outing by id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query(
      'UPDATE outing_requests SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );
    res.json({ message: `Outing request updated to ${status}` });
  } catch (err) {
    console.error('Error updating outing by id:', err);
    res.status(500).json({ error: 'Failed to update outing' });
  }
});

module.exports = router;
