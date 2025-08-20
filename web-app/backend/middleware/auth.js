const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'fredora-academy-secret-key-2024';

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user from database (token payload uses { id })
    const user = await db('users')
      .where({ id: decoded.id, is_active: true })
      .first();

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }

    // Remove password from user object
    delete user.password_hash;
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

// Middleware to check if user has required role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }

    next();
  };
};

// Middleware to check if user has required permission
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const userRole = req.user.role;

    // Admin has all permissions
    if (userRole === 'admin') {
      return next();
    }

    // Define teacher permissions
    const teacherPermissions = [
      'view_students',
      'view_attendance',
      'mark_attendance',
      'view_grades',
      'update_grades',
      'view_reports'
    ];

    if (userRole === 'teacher' && teacherPermissions.includes(permission)) {
      return next();
    }

    return res.status(403).json({ 
      success: false, 
      message: 'Insufficient permissions' 
    });
  };
};

// Middleware to check if user can access specific class
const canAccessClass = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const classId = req.params.classId || req.body.classId;
    
    if (!classId) {
      return next(); // No class specified, allow access
    }

    const userRole = req.user.role;

    // Admin can access all classes
    if (userRole === 'admin') {
      return next();
    }

    // For teachers, check if they are assigned to this class
    // This would require a teacher_class_assignments table
    // For now, we'll allow teachers to access all classes
    if (userRole === 'teacher') {
      return next();
    }

    return res.status(403).json({ 
      success: false, 
      message: 'Access denied to this class' 
    });
  } catch (error) {
    console.error('Class access check error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Middleware to check if user can access specific student
const canAccessStudent = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const studentId = req.params.studentId || req.body.studentId;
    
    if (!studentId) {
      return next(); // No student specified, allow access
    }

    const userRole = req.user.role;

    // Admin can access all students
    if (userRole === 'admin') {
      return next();
    }

    // For teachers, check if the student is in their assigned class
    if (userRole === 'teacher') {
      const student = await db('students')
        .where({ id: studentId })
        .first();

      if (!student) {
        return res.status(404).json({ 
          success: false, 
          message: 'Student not found' 
        });
      }

      // For now, allow teachers to access all students
      // In a real implementation, you'd check teacher-class assignments
      return next();
    }

    return res.status(403).json({ 
      success: false, 
      message: 'Access denied to this student' 
    });
  } catch (error) {
    console.error('Student access check error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Alias names expected by routes
const protect = authenticateToken;
const authorize = requireRole;

module.exports = {
  // Common names used across routes
  protect,
  authorize,
  // Original implementations
  authenticateToken,
  requireRole,
  requirePermission,
  canAccessClass,
  canAccessStudent
};
