const express = require('express');
const router = express.Router();
const pool = require('../config/db');

function formatTask(m) {
  return {
    id: m.id,
    residentName: m.resident_name,
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

// GET all tasks for technician
router.get('/tasks', async (req, res) => {
  try {
    const { technicianName } = req.query;
    let query = 'SELECT * FROM maintenance_requests';
    const params = [];

    if (technicianName) {
      query += ' WHERE assigned_to = ? OR status = "pending"';
      params.push(technicianName);
    }

    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows.map(formatTask));
  } catch (err) {
    console.error('Error fetching technician tasks:', err);
    res.status(500).json({ error: 'Failed to fetch technician tasks' });
  }
});

// PUT update technician task status
router.put('/update', async (req, res) => {
  try {
    const { id, status, assignedTo, resolutionNotes } = req.body;
    await pool.query(
      `UPDATE maintenance_requests
       SET status = COALESCE(?, status),
           assigned_to = COALESCE(?, assigned_to),
           resolution_notes = COALESCE(?, resolution_notes),
           resolved_at = CASE WHEN ? = 'resolved' THEN NOW() ELSE resolved_at END,
           updated_at = NOW()
       WHERE id = ?`,
      [status, assignedTo, resolutionNotes, status, id]
    );
    res.json({ message: 'Task updated successfully' });
  } catch (err) {
    console.error('Error updating technician task:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

module.exports = router;
