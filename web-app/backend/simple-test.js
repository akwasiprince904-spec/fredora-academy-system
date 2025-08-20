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
    message: 'Simple test server is running',
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

// Token verification endpoint
app.get('/api/auth/verify', authenticateToken, async (req, res) => {
  try {
    const user = await db('users')
      .select('id', 'username', 'email', 'name', 'role', 'phone', 'address', 'is_active', 'created_at')
      .where('id', req.user.id)
      .first();

    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: 'User not found or inactive' });
    }

    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ success: false, message: 'Token verification failed' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Allow login with either username or email
    const user = await db('users')
      .where(function() {
        this.where('username', username)
            .orWhere('email', username);
      })
      .where('is_active', true)
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

// Logout endpoint
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return success since the client will clear the token
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Logout failed' });
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

// Get teachers with assignments endpoint
app.get('/api/users/teachers/with-assignments', authenticateToken, async (req, res) => {
  try {
    const teachers = await db('users')
      .select('id', 'username', 'email', 'name', 'phone', 'address', 'is_active', 'created_at')
      .where('role', 'teacher')
      .orderBy('name');

    // Get assignments for each teacher
    const teachersWithAssignments = await Promise.all(
      teachers.map(async (teacher) => {
        try {
          const assignments = await db('teacher_class_assignments')
            .select('classes.id', 'classes.name', 'classes.level')
            .join('classes', 'teacher_class_assignments.class_id', 'classes.id')
            .where('teacher_class_assignments.teacher_id', teacher.id)
            .orderBy('classes.level')
            .orderBy('classes.name');

          return {
            ...teacher,
            assigned_classes: assignments
          };
        } catch (error) {
          console.error(`Error fetching assignments for teacher ${teacher.id}:`, error);
          return {
            ...teacher,
            assigned_classes: []
          };
        }
      })
    );

    res.json({ success: true, data: teachersWithAssignments });
  } catch (error) {
    console.error('Error fetching teachers with assignments:', error);
    res.status(500).json({ success: false, message: 'Error fetching teachers with assignments' });
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

// Get subjects endpoint
app.get('/api/subjects', authenticateToken, async (req, res) => {
  try {
    const subjects = await db('subjects')
      .select('*')
      .orderBy('name');

    res.json({ success: true, data: subjects });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ success: false, message: 'Error fetching subjects' });
  }
});

// Create subject endpoint
app.post('/api/subjects', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Subject name is required' });
    }

    // Check if subject already exists
    const existingSubject = await db('subjects')
      .where('name', name)
      .first();

    if (existingSubject) {
      return res.status(400).json({ success: false, message: 'Subject already exists' });
    }

    const [subjectId] = await db('subjects').insert({
      name,
      description: description || null,
      created_at: db.fn.now(),
      updated_at: db.fn.now()
    });

    const newSubject = await db('subjects')
      .select('*')
      .where('id', subjectId)
      .first();

    res.status(201).json({ 
      success: true, 
      message: 'Subject created successfully', 
      data: newSubject 
    });
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ success: false, message: 'Error creating subject' });
  }
});

// Get classes for a specific teacher
app.get('/api/users/teachers/:teacherId/classes', authenticateToken, async (req, res) => {
  try {
    const { teacherId } = req.params;
    
    // Verify teacher exists
    const teacher = await db('users')
      .where({ id: teacherId, role: 'teacher' })
      .first();

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Get assigned classes for this teacher
    const assignedClasses = await db('teacher_class_assignments')
      .select('classes.id', 'classes.name', 'classes.level')
      .join('classes', 'teacher_class_assignments.class_id', 'classes.id')
      .where('teacher_class_assignments.teacher_id', teacherId)
      .orderBy('classes.level')
      .orderBy('classes.name');

    res.json({ 
      success: true, 
      data: {
        teacher_id: teacherId,
        assigned_classes: assignedClasses
      }
    });
  } catch (error) {
    console.error('Error fetching teacher classes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching teacher classes' 
    });
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
  console.log(`🚀 Simple test server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log('✅ Server started successfully!');
  console.log('');
  console.log('Available endpoints:');
  console.log('  GET  /health');
  console.log('  POST /api/auth/login');
  console.log('  GET  /api/auth/verify');
  console.log('  POST /api/auth/logout');
  console.log('  GET  /api/users/teachers');
  console.log('  GET  /api/users/teachers/with-assignments');
  console.log('  POST /api/users/teachers');
  console.log('  GET  /api/classes');
  console.log('  GET  /api/users/teachers/:teacherId/classes');
  console.log('  POST /api/users/teachers/:teacherId/classes');
  console.log('  GET  /api/subjects');
  console.log('  POST /api/subjects');
  console.log('');
  console.log('Test with: curl http://localhost:5000/health');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
