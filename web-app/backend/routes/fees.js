const express = require('express');
const { protect } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

router.use(protect);

router.get('/', async (req, res) => {
  const fees = await db('fees').select('*').limit(100);
  res.json({ success: true, data: fees });
});

module.exports = router;


