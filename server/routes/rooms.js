const express = require('express');
const router = express.Router();
const pool = require('../config/db');

function formatRoom(r) {
  const capacity = Number(r.capacity || 4);
  const occupiedBeds = Number(r.occupied_beds || 0);
  const vacantBeds = Math.max(0, capacity - occupiedBeds);
  const status = r.status || (vacantBeds <= 0 ? 'occupied' : 'available');

  return {
    id: r.id,
    roomNumber: r.room_number,
    block: r.block,
    floor: r.floor,
    capacity,
    occupiedBeds,
    vacantBeds,
    status, // 'available' (free for booking), 'occupied', 'maintenance'
    type: r.type,
    gender: r.gender,
    pricePerSemester: r.price_per_semester,
    createdAt: r.created_at,
  };
}

// GET all rooms
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM rooms ORDER BY room_number ASC');
    res.json(rows.map(formatRoom));
  } catch (err) {
    console.error('Error fetching rooms:', err);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// GET room by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM rooms WHERE id = ? OR room_number = ?', [req.params.id, req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(formatRoom(rows[0]));
  } catch (err) {
    console.error('Error fetching room:', err);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

// POST create new room (Warden only)
router.post('/', async (req, res) => {
  try {
    const {
      roomNumber,
      block = 'A Block',
      floor = 1,
      capacity = 4,
      type = 'Standard',
      gender = 'Co-ed',
      pricePerSemester = 25000,
      status = 'available',
    } = req.body;

    const id = `room-${roomNumber}-${Date.now()}`;

    await pool.query(
      `INSERT INTO rooms (id, room_number, block, floor, capacity, occupied_beds, type, gender, price_per_semester, status)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`,
      [id, roomNumber, block, floor, capacity, type, gender, pricePerSemester, status]
    );

    res.status(201).json({ id, message: 'Room created successfully' });
  } catch (err) {
    console.error('Error creating room:', err);
    res.status(500).json({ error: 'Failed to create room (may be duplicate room number)' });
  }
});

// PUT update room (Warden updates occupancy, capacity, status, roomNumber)
router.put('/:id', async (req, res) => {
  try {
    const { occupiedBeds, capacity, type, status, roomNumber, block, floor } = req.body;
    await pool.query(
      `UPDATE rooms 
       SET occupied_beds = COALESCE(?, occupied_beds), 
           capacity = COALESCE(?, capacity), 
           type = COALESCE(?, type),
           status = COALESCE(?, status),
           room_number = COALESCE(?, room_number),
           block = COALESCE(?, block),
           floor = COALESCE(?, floor)
       WHERE id = ? OR room_number = ?`,
      [occupiedBeds, capacity, type, status, roomNumber, block, floor, req.params.id, req.params.id]
    );
    res.json({ message: 'Room updated successfully' });
  } catch (err) {
    console.error('Error updating room:', err);
    res.status(500).json({ error: 'Failed to update room' });
  }
});

// PUT free up room (Warden marks room as free/available and clears occupied beds)
router.put('/:id/free', async (req, res) => {
  try {
    await pool.query(
      "UPDATE rooms SET occupied_beds = 0, status = 'available' WHERE id = ? OR room_number = ?",
      [req.params.id, req.params.id]
    );
    res.json({ message: 'Room freed up and marked available for booking' });
  } catch (err) {
    console.error('Error freeing room:', err);
    res.status(500).json({ error: 'Failed to free room' });
  }
});

// DELETE room (Warden only)
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM rooms WHERE id = ? OR room_number = ?', [req.params.id, req.params.id]);
    res.json({ message: 'Room deleted successfully' });
  } catch (err) {
    console.error('Error deleting room:', err);
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

module.exports = router;
