const express = require('express');
const db = require('../config/database');
const { logger } = require('../utils/logger');

const router = express.Router();

// @desc    Health check endpoint
// @route   GET /api/health
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Test database connection
    await db.raw('SELECT 1');
    
    res.json({ 
      success: true, 
      message: 'System is healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({ 
      success: false, 
      message: 'System is unhealthy - database connection failed',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// @desc    Database status check
// @route   GET /api/health/database
// @access  Private
router.get('/database', async (req, res) => {
  try {
    // Test database with a simple query
    const result = await db.raw('SELECT COUNT(*) as count FROM students');
    const studentCount = result[0].count;
    
    res.json({ 
      success: true, 
      message: 'Database is healthy',
      timestamp: new Date().toISOString(),
      studentCount: studentCount,
      database: 'connected'
    });
  } catch (error) {
    logger.error('Database health check failed:', error);
    res.status(503).json({ 
      success: false, 
      message: 'Database is unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

module.exports = router;
