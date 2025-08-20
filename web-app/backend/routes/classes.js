const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const classes = await db('classes')
      .select('id', 'name', 'display_name', 'level', 'max_students as capacity', 'is_active')
      .orderBy('level');
    res.json({ success: true, data: classes });
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ success: false, message: 'Error fetching classes' });
  }
});

module.exports = router;


