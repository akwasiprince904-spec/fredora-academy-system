const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const knex = require('knex');
const path = require('path');

// Database configuration
const db = knex({
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, 'database/fredora_academy.db')
  },
  useNullAsDefault: true
});

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Minimal server is running',
    timestamp: new Date().toISOString()
  });
});

// Simple authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await db('users')
      .where({ username, is_active: true })
      .first();

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// Get teachers endpoint
app.get('/api/users/teachers', authenticateToken, async (req, res) => {
  try {
    const teachers = await db('users')
      .select('id', 'username', 'email', 'name', 'phone', 'address', 'is_active', 'created_at')
      .where('role', 'teacher')
      .orderBy('name');

    res.json({ success: true, data: teachers });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ success: false, message: 'Error fetching teachers' });
  }
});

// Create teacher endpoint
app.post('/api/users/teachers', authenticateToken, async (req, res) => {
  try {
    const { username, email, name, password, phone, address } = req.body;

    // Validation
    if (!username || !email || !name || !password) {
      return res.status(400).json({ success: false, message: 'Username, email, name, and password are required' });
    }

    // Check if username or email already exists
    const existingUser = await db('users')
      .where('username', username)
      .orWhere('email', email)
      .first();

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create teacher
    const teacherData = {
      username,
      email,
      name,
      password_hash: hashedPassword,
      role: 'teacher',
      phone: phone || null,
      address: address || null,
      is_active: true,
      created_at: db.fn.now(),
      updated_at: db.fn.now()
    };

    const [teacherId] = await db('users').insert(teacherData);

    // Return teacher data without password
    const newTeacher = await db('users')
      .select('id', 'username', 'email', 'name', 'role', 'phone', 'address', 'is_active', 'created_at')
      .where('id', teacherId)
      .first();

    res.status(201).json({ 
      success: true, 
      message: 'Teacher created successfully', 
      data: newTeacher 
    });
  } catch (error) {
    console.error('Error creating teacher:', error);
    res.status(500).json({ success: false, message: 'Error creating teacher' });
  }
});

// Get classes endpoint
app.get('/api/classes', authenticateToken, async (req, res) => {
  try {
    const classes = await db('classes')
      .select('*')
      .orderBy('level')
      .orderBy('name');

    res.json({ success: true, data: classes });
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ success: false, message: 'Error fetching classes' });
  }
});

// Assign classes to teacher endpoint
app.post('/api/users/teachers/:teacherId/classes', authenticateToken, async (req, res) => {
  const trx = await db.transaction();
  
  try {
    const { teacherId } = req.params;
    const { class_ids } = req.body;

    if (!Array.isArray(class_ids) || class_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'class_ids must be a non-empty array' });
    }

    // Verify teacher exists
    const teacher = await trx('users')
      .where({ id: teacherId, role: 'teacher' })
      .first();

    if (!teacher) {
      await trx.rollback();
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Verify all classes exist
    const existingClasses = await trx('classes')
      .select('id')
      .whereIn('id', class_ids);

    if (existingClasses.length !== class_ids.length) {
      await trx.rollback();
      return res.status(400).json({ success: false, message: 'One or more classes not found' });
    }

    // Remove existing assignments for this teacher
    await trx('teacher_class_assignments')
      .where('teacher_id', teacherId)
      .del();

    // Insert new assignments
    if (class_ids.length > 0) {
      const assignments = class_ids.map(classId => ({
        teacher_id: teacherId,
        class_id: classId,
        created_at: trx.fn.now()
      }));

      await trx('teacher_class_assignments').insert(assignments);
    }

    await trx.commit();

    // Get updated assigned classes for response
    const assignedClasses = await db('teacher_class_assignments')
      .select('classes.id', 'classes.name', 'classes.level')
      .join('classes', 'teacher_class_assignments.class_id', 'classes.id')
      .where('teacher_class_assignments.teacher_id', teacherId)
      .orderBy('classes.level')
      .orderBy('classes.name');

    res.json({ 
      success: true, 
      message: 'Classes assigned successfully',
      data: {
        teacher_id: teacherId,
        assigned_classes: assignedClasses
      }
    });
  } catch (error) {
    await trx.rollback();
    console.error('Error assigning classes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error assigning classes. Please try again.' 
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Minimal server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log('✅ Server started successfully!');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
