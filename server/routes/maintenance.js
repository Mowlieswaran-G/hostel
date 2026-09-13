const express = require('express');
const router = express.Router();
const pool = require('../config/db');

function formatMaintenance(m) {
  return {
    id: m.id,
    userId: m.user_id,
    residentName: m.resident_name,
    residentEmail: m.resident_email,
    rollNumber: m.roll_number,
    roomNumber: m.room_number,
    floor: m.floor,
    category: m.category,
    issue: m.issue,
    priority: m.priority,
    status: m.status,
    assignedTo: m.assigned_to,
    resolutionNotes: m.resolution_notes,
    createdAt: m.created_at,
    updatedAt: m.updated_at,
    resolvedAt: m.resolved_at,
  };
}

// GET all maintenance requests
router.get('/all', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM maintenance_requests ORDER BY created_at DESC');
    res.json(rows.map(formatMaintenance));
  } catch (err) {
    console.error('Error fetching maintenance requests:', err);
    res.status(500).json({ error: 'Failed to fetch maintenance requests' });
  }
});

// GET maintenance requests (optionally filtered by rollNumber or userId via query params or token)
router.get('/', async (req, res) => {
  try {
    const { rollNumber, userId } = req.query;
    let query = 'SELECT * FROM maintenance_requests';
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
    res.json(rows.map(formatMaintenance));
  } catch (err) {
    console.error('Error fetching maintenance:', err);
    res.status(500).json({ error: 'Failed to fetch maintenance' });
  }
});

// POST submit new maintenance request
router.post('/', async (req, res) => {
  try {
    const {
      category = 'Other',
      issue = '',
      priority = 'medium',
      residentName = 'Resident',
      residentEmail = '',
      rollNumber = '',
      roomNumber = 'N/A',
      floor = null,
      userId = null,
    } = req.body;

    const id = `maint-${Date.now()}`;

    await pool.query(
      `INSERT INTO maintenance_requests 
        (id, user_id, resident_name, resident_email, roll_number, room_number, floor, category, issue, priority, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [id, userId, residentName, residentEmail, rollNumber, roomNumber, floor, category, issue, priority]
    );

    res.status(201).json({ id, message: 'Maintenance request submitted successfully' });
  } catch (err) {
    console.error('Error submitting maintenance request:', err);
    res.status(500).json({ error: 'Failed to submit maintenance request' });
  }
});

// PUT assign technician
router.put('/assign', async (req, res) => {
  try {
    const { id, assignedTo, status = 'inProgress' } = req.body;
    await pool.query(
      'UPDATE maintenance_requests SET assigned_to = ?, status = ?, updated_at = NOW() WHERE id = ?',
      [assignedTo, status, id]
    );
    res.json({ message: 'Technician assigned successfully' });
  } catch (err) {
    console.error('Error assigning technician:', err);
    res.status(500).json({ error: 'Failed to assign technician' });
  }
});

// PUT complete / resolve request
router.put('/complete', async (req, res) => {
  try {
    const { id, resolutionNotes = null, status = 'resolved' } = req.body;
    await pool.query(
      'UPDATE maintenance_requests SET status = ?, resolution_notes = ?, resolved_at = NOW(), updated_at = NOW() WHERE id = ?',
      [status, resolutionNotes, id]
    );
    res.json({ message: 'Maintenance request marked as resolved' });
  } catch (err) {
    console.error('Error completing maintenance request:', err);
    res.status(500).json({ error: 'Failed to complete maintenance request' });
  }
});

// PUT general update / approve
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo, status, resolutionNotes } = req.body;

    await pool.query(
      `UPDATE maintenance_requests 
       SET assigned_to = COALESCE(?, assigned_to),
           status = COALESCE(?, status),
           resolution_notes = COALESCE(?, resolution_notes),
           resolved_at = CASE WHEN ? = 'resolved' THEN NOW() ELSE resolved_at END,
           updated_at = NOW()
       WHERE id = ?`,
      [assignedTo, status, resolutionNotes, status, id]
    );

    res.json({ message: 'Maintenance request updated' });
  } catch (err) {
    console.error('Error updating maintenance request:', err);
    res.status(500).json({ error: 'Failed to update maintenance request' });
  }
});

module.exports = router;
