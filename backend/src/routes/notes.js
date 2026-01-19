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



module.exports = router;