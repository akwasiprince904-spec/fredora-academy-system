const express = require('express');
const { protect } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

router.use(protect);

router.get('/', async (req, res) => {
  const records = await db('attendance').select('*').limit(50);
  res.json({ success: true, data: records });
});

module.exports = router;


