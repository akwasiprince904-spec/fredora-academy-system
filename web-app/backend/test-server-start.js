const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Basic middleware
app.use(cors());
app.use(express.json());

// Simple health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Test server is running',
    timestamp: new Date().toISOString()
  });
});

// Test teacher endpoint
app.post('/api/users/teachers', (req, res) => {
  console.log('Teacher creation request:', req.body);
  res.status(201).json({
    success: true,
    message: 'Teacher created successfully (test)',
    data: {
      id: 999,
      username: req.body.username,
      email: req.body.email,
      name: req.body.name
    }
  });
});

// Test class assignment endpoint
app.post('/api/users/teachers/:teacherId/classes', (req, res) => {
  console.log('Class assignment request:', req.params.teacherId, req.body);
  res.json({
    success: true,
    message: 'Classes assigned successfully (test)',
    data: {
      teacher_id: req.params.teacherId,
      assigned_classes: req.body.class_ids.map(id => ({ id, name: `Class ${id}` }))
    }
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
