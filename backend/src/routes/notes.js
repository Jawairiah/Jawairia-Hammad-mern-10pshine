const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes are protected - require authentication
router.use(authMiddleware);

// Validation rules
const noteValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters'),
  body('content')
    .notEmpty()
    .withMessage('Content is required')
];

// GET /api/notes - Get all notes for authenticated user
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, content, created_at, updated_at FROM notes WHERE user_id = $1 ORDER BY updated_at DESC',
      [req.user.id]
    );

    res.json({
      success: true,
      notes: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching notes' 
    });
  }
});

// GET /api/notes/:id - Get a specific note
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT id, title, content, created_at, updated_at FROM notes WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Note not found or access denied' 
      });
    }

    res.json({
      success: true,
      note: result.rows[0]
    });

  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching note' 
    });
  }
});

// POST /api/notes - Create a new note
router.post('/', noteValidation, async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { title, content } = req.body;

    const result = await pool.query(
      'INSERT INTO notes (user_id, title, content) VALUES ($1, $2, $3) RETURNING id, title, content, created_at, updated_at',
      [req.user.id, title, content]
    );

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      note: result.rows[0]
    });

  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error creating note' 
    });
  }
});

// PUT /api/notes/:id - Update an existing note
router.put('/:id', noteValidation, async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const { title, content } = req.body;

    // First, check if note exists and belongs to user
    const checkResult = await pool.query(
      'SELECT id FROM notes WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Note not found or access denied' 
      });
    }

    // Update the note
    const result = await pool.query(
      'UPDATE notes SET title = $1, content = $2 WHERE id = $3 AND user_id = $4 RETURNING id, title, content, created_at, updated_at',
      [title, content, id, req.user.id]
    );

    res.json({
      success: true,
      message: 'Note updated successfully',
      note: result.rows[0]
    });

  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error updating note' 
    });
  }
});

// DELETE /api/notes/:id - Delete a note
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Note not found or access denied' 
      });
    }

    res.json({
      success: true,
      message: 'Note deleted successfully',
      deletedId: result.rows[0].id
    });

  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error deleting note' 
    });
  }
});

module.exports = router;