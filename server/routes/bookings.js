const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { v4: uuidv4 } = require('crypto');

function formatBooking(b) {
  let members = [];
  if (b.member_roll_numbers) {
    try {
      members = typeof b.member_roll_numbers === 'string' 
        ? JSON.parse(b.member_roll_numbers) 
        : b.member_roll_numbers;
    } catch (e) {
      members = [];
    }
  }
  return {
    id: b.id,
    roomId: b.room_id,
    roomNumber: b.room_number,
    leaderId: b.leader_id,
    leaderRoll: b.leader_roll,
    memberRollNumbers: members,
    members: members,
    status: b.status,
    rejectionReason: b.rejection_reason,
    createdAt: b.created_at,
    updatedAt: b.updated_at,
  };
}

// GET all bookings
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM booking_groups ORDER BY created_at DESC');
    res.json(rows.map(formatBooking));
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// GET booking status for user
router.get('/status/:uid', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM booking_groups WHERE leader_id = ? ORDER BY created_at DESC LIMIT 1', [req.params.uid]);
    if (rows.length === 0) {
      return res.json({ data: null });
    }
    res.json({ data: formatBooking(rows[0]) });
  } catch (err) {
    console.error('Error fetching booking status:', err);
    res.status(500).json({ error: 'Failed to fetch booking status' });
  }
});

// POST create booking
router.post('/', async (req, res) => {
  try {
    const { roomId, roomNumber, memberRollNumbers = [], leaderId, leaderRoll } = req.body;
    const id = `bg-${Date.now()}`;
    const membersJson = JSON.stringify(memberRollNumbers);

    await pool.query(
      `INSERT INTO booking_groups (id, room_id, room_number, leader_id, leader_roll, member_roll_numbers, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [id, roomId, roomNumber, leaderId, leaderRoll, membersJson]
    );

    res.status(201).json({ id, message: 'Booking created successfully' });
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// PUT approve booking
router.put('/approve', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id, roomId, memberCount = 1 } = req.body;
    await connection.beginTransaction();

    await connection.query(
      "UPDATE booking_groups SET status = 'approved', updated_at = NOW() WHERE id = ?",
      [id]
    );

    if (roomId) {
      await connection.query(
        "UPDATE rooms SET occupied_beds = LEAST(capacity, occupied_beds + ?) WHERE id = ? OR room_number = ?",
        [memberCount, roomId, roomId]
      );
    }

    await connection.commit();
    res.json({ message: 'Booking approved successfully' });
  } catch (err) {
    await connection.rollback();
    console.error('Error approving booking:', err);
    res.status(500).json({ error: 'Failed to approve booking' });
  } finally {
    connection.release();
  }
});

// PUT reject booking
router.put('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = '' } = req.body;
    await pool.query(
      "UPDATE booking_groups SET status = 'rejected', rejection_reason = ?, updated_at = NOW() WHERE id = ?",
      [reason, id]
    );
    res.json({ message: 'Booking rejected' });
  } catch (err) {
    console.error('Error rejecting booking:', err);
    res.status(500).json({ error: 'Failed to reject booking' });
  }
});

router.put('/reject', async (req, res) => {
  try {
    const { id, reason = '' } = req.body;
    await pool.query(
      "UPDATE booking_groups SET status = 'rejected', rejection_reason = ?, updated_at = NOW() WHERE id = ?",
      [reason, id]
    );
    res.json({ message: 'Booking rejected' });
  } catch (err) {
    console.error('Error rejecting booking:', err);
    res.status(500).json({ error: 'Failed to reject booking' });
  }
});

module.exports = router;
