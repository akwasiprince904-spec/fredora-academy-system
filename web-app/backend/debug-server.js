console.log('🔍 Debugging server startup...');

let express;

try {
  console.log('1. Testing basic requires...');
  express = require('express');
  console.log('   ✅ Express loaded');
  
  const cors = require('cors');
  console.log('   ✅ CORS loaded');
  
  const helmet = require('helmet');
  console.log('   ✅ Helmet loaded');
  
  const compression = require('compression');
  console.log('   ✅ Compression loaded');
  
  const rateLimit = require('express-rate-limit');
  console.log('   ✅ Rate limit loaded');
  
  const slowDown = require('express-slow-down');
  console.log('   ✅ Slow down loaded');
  
  const path = require('path');
  console.log('   ✅ Path loaded');
  
  require('dotenv').config();
  console.log('   ✅ Dotenv loaded');
  
  console.log('2. Testing route requires...');
  try {
    const authRoutes = require('./routes/auth');
    console.log('   ✅ Auth routes loaded');
  } catch (error) {
    console.log('   ❌ Auth routes failed:', error.message);
  }
  
  try {
    const userRoutes = require('./routes/users');
    console.log('   ✅ User routes loaded');
  } catch (error) {
    console.log('   ❌ User routes failed:', error.message);
  }
  
  try {
    const studentRoutes = require('./routes/students');
    console.log('   ✅ Student routes loaded');
  } catch (error) {
    console.log('   ❌ Student routes failed:', error.message);
  }
  
  try {
    const classRoutes = require('./routes/classes');
    console.log('   ✅ Class routes loaded');
  } catch (error) {
    console.log('   ❌ Class routes failed:', error.message);
  }
  
  try {
    const subjectRoutes = require('./routes/subjects');
    console.log('   ✅ Subject routes loaded');
  } catch (error) {
    console.log('   ❌ Subject routes failed:', error.message);
  }
  
  console.log('3. Testing middleware requires...');
  try {
    const { errorHandler } = require('./middleware/errorHandler');
    console.log('   ✅ Error handler loaded');
  } catch (error) {
    console.log('   ❌ Error handler failed:', error.message);
  }
  
  try {
    const { logger } = require('./utils/logger');
    console.log('   ✅ Logger loaded');
  } catch (error) {
    console.log('   ❌ Logger failed:', error.message);
  }
  
  console.log('4. Testing database connection...');
  try {
    const db = require('./config/database');
    console.log('   ✅ Database config loaded');
    
    // Test database connection
    db.raw('SELECT 1 as test')
      .then(() => {
        console.log('   ✅ Database connection successful');
        startServer();
      })
      .catch((error) => {
        console.log('   ❌ Database connection failed:', error.message);
        startServer(); // Start server anyway for testing
      });
  } catch (error) {
    console.log('   ❌ Database config failed:', error.message);
    startServer(); // Start server anyway for testing
  }
  
} catch (error) {
  console.error('❌ Critical error during startup:', error);
}

function startServer() {
  console.log('5. Starting server...');
  
  const app = express();
  const PORT = 3001;
  
  // Basic middleware
  app.use(cors());
  app.use(express.json());
  
  // Health endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      message: 'Debug server is running',
      timestamp: new Date().toISOString()
    });
  });
  
  // Test endpoints
  app.post('/api/users/teachers', (req, res) => {
    console.log('📝 Teacher creation request:', req.body);
    res.status(201).json({
      success: true,
      message: 'Teacher created successfully (debug)',
      data: {
        id: 999,
        username: req.body.username,
        email: req.body.email,
        name: req.body.name
      }
    });
  });
  
  app.post('/api/users/teachers/:teacherId/classes', (req, res) => {
    console.log('📝 Class assignment request:', req.params.teacherId, req.body);
    res.json({
      success: true,
      message: 'Classes assigned successfully (debug)',
      data: {
        teacher_id: req.params.teacherId,
        assigned_classes: req.body.class_ids.map(id => ({ id, name: `Class ${id}` }))
      }
    });
  });
  
  // Start server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Debug server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log('✅ Server started successfully!');
  });
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
  });
}
