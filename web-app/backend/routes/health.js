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
// @access  Public
router.get('/database', async (req, res) => {
  try {
    // Prefer a lightweight count; cast to int for consistent shape
    const result = await db.raw('SELECT COUNT(*)::int as count FROM students');
    const rows = result?.rows || result;
    const studentCount = rows && rows[0] && (rows[0].count ?? rows[0]['count']) ? Number(rows[0].count) : 0;
    
    res.json({ 
      success: true, 
      message: 'Database is healthy',
      timestamp: new Date().toISOString(),
      studentCount,
      database: 'connected'
    });
  } catch (primaryError) {
    logger.warn('Primary DB health query failed, attempting fallback:', primaryError.message);
    try {
      // Fallback simple query just to verify connectivity
      await db.raw('SELECT NOW()');
      res.json({
        success: true,
        message: 'Database connected (fallback)',
        timestamp: new Date().toISOString(),
        studentCount: 0,
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
  }
});

module.exports = router;
