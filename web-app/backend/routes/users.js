const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const db = require('../config/database');
const bcrypt = require('bcryptjs');

const router = express.Router();

router.use(protect);

// Get all users (admin only)
router.get('/', authorize(['admin']), async (req, res) => {
  try {
    const users = await db('users')
      .select('id', 'username', 'email', 'name', 'role', 'is_active', 'created_at')
      .orderBy('created_at', 'desc');
    
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
});

// Bulk assign classes to multiple teachers (admin only) - More efficient
router.post('/teachers/bulk-assign', authorize(['admin']), async (req, res) => {
  const trx = await db.transaction();
  
  try {
    const { assignments } = req.body; // Array of { teacher_id, class_ids }
    
    if (!Array.isArray(assignments) || assignments.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'assignments must be a non-empty array' 
      });
    }

    // Validate all teachers exist
    const teacherIds = assignments.map(a => a.teacher_id);
    const existingTeachers = await trx('users')
      .select('id', 'name')
      .whereIn('id', teacherIds)
      .where('role', 'teacher');

    if (existingTeachers.length !== teacherIds.length) {
      await trx.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'One or more teachers not found' 
      });
    }

    // Validate all classes exist
    const allClassIds = [...new Set(assignments.flatMap(a => a.class_ids))];
    const existingClasses = await trx('classes')
      .select('id', 'name')
      .whereIn('id', allClassIds);

    if (existingClasses.length !== allClassIds.length) {
      await trx.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'One or more classes not found' 
      });
    }

    // Check for conflicts
    const conflictingAssignments = await trx('teacher_class_assignments')
      .select('class_id', 'teacher_id')
      .whereIn('class_id', allClassIds);

    if (conflictingAssignments.length > 0) {
      await trx.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Some classes are already assigned to teachers' 
      });
    }

    // Process assignments
    for (const assignment of assignments) {
      const { teacher_id, class_ids } = assignment;
      
      // Remove existing assignments for this teacher
      await trx('teacher_class_assignments')
        .where('teacher_id', teacher_id)
        .del();

      // Insert new assignments
      if (class_ids.length > 0) {
        const newAssignments = class_ids.map(classId => ({
          teacher_id,
          class_id: classId,
          created_at: trx.fn.now()
        }));
        
        await trx('teacher_class_assignments').insert(newAssignments);
      }
    }

    await trx.commit();

    res.json({ 
      success: true, 
      message: 'Bulk assignment completed successfully',
      data: { processed_assignments: assignments.length }
    });
  } catch (error) {
    await trx.rollback();
    console.error('Error in bulk assignment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error in bulk assignment. Please try again.' 
    });
  }
});

// Diagnostic endpoint - check teacher assignment status
router.get('/teachers/diagnostics/assignments', authorize(['admin']), async (req, res) => {
  try {
    // Get all teachers
    const teachers = await db('users')
      .select('id', 'name', 'username')
      .where('role', 'teacher')
      .orderBy('name');

    // Get all assignments
    const allAssignments = await db('teacher_class_assignments')
      .select(
        'teacher_class_assignments.teacher_id',
        'teacher_class_assignments.class_id',
        'classes.name as class_name',
        'users.name as teacher_name'
      )
      .join('classes', 'teacher_class_assignments.class_id', 'classes.id')
      .join('users', 'teacher_class_assignments.teacher_id', 'users.id')
      .orderBy('users.name')
      .orderBy('classes.name');

    // Group assignments by teacher
    const assignmentsByTeacher = {};
    allAssignments.forEach(assignment => {
      if (!assignmentsByTeacher[assignment.teacher_id]) {
        assignmentsByTeacher[assignment.teacher_id] = [];
      }
      assignmentsByTeacher[assignment.teacher_id].push({
        class_id: assignment.class_id,
        class_name: assignment.class_name
      });
    });

    // Build diagnostic report
    const diagnosticReport = teachers.map(teacher => ({
      teacher_id: teacher.id,
      teacher_name: teacher.name,
      username: teacher.username,
      assigned_classes: assignmentsByTeacher[teacher.id] || [],
      assignment_count: (assignmentsByTeacher[teacher.id] || []).length
    }));

    // Check for potential issues
    const issues = [];
    
    // Check for teachers with no assignments
    const teachersWithNoAssignments = diagnosticReport.filter(t => t.assignment_count === 0);
    if (teachersWithNoAssignments.length > 0) {
      issues.push({
        type: 'no_assignments',
        message: `${teachersWithNoAssignments.length} teachers have no class assignments`,
        teachers: teachersWithNoAssignments.map(t => t.teacher_name)
      });
    }

    // Check for duplicate class assignments
    const classAssignments = {};
    allAssignments.forEach(assignment => {
      if (!classAssignments[assignment.class_id]) {
        classAssignments[assignment.class_id] = [];
      }
      classAssignments[assignment.class_id].push(assignment.teacher_name);
    });

    const duplicateAssignments = Object.entries(classAssignments)
      .filter(([classId, teachers]) => teachers.length > 1)
      .map(([classId, teachers]) => ({
        class_id: classId,
        teachers: teachers
      }));

    if (duplicateAssignments.length > 0) {
      issues.push({
        type: 'duplicate_assignments',
        message: `${duplicateAssignments.length} classes are assigned to multiple teachers`,
        details: duplicateAssignments
      });
    }

    res.json({
      success: true,
      data: {
        summary: {
          total_teachers: teachers.length,
          total_assignments: allAssignments.length,
          teachers_with_assignments: diagnosticReport.filter(t => t.assignment_count > 0).length,
          teachers_without_assignments: teachersWithNoAssignments.length
        },
        teachers: diagnosticReport,
        issues: issues,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error in diagnostic check:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error running diagnostics' 
    });
  }
});

// Data recovery endpoint - restore teacher assignments from backup or fix corruption
router.post('/teachers/recovery/restore-assignments', authorize(['admin']), async (req, res) => {
  const trx = await db.transaction();
  
  try {
    const { teacher_id, class_ids } = req.body;
    
    if (!teacher_id || !Array.isArray(class_ids)) {
      return res.status(400).json({ 
        success: false, 
        message: 'teacher_id and class_ids array are required' 
      });
    }

    // Verify teacher exists
    const teacher = await trx('users')
      .where({ id: teacher_id, role: 'teacher' })
      .first();

    if (!teacher) {
      await trx.rollback();
      return res.status(404).json({ 
        success: false, 
        message: 'Teacher not found' 
      });
    }

    // Verify classes exist
    const existingClasses = await trx('classes')
      .select('id', 'name')
      .whereIn('id', class_ids);

    if (existingClasses.length !== class_ids.length) {
      await trx.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'One or more classes not found' 
      });
    }

    // Clear any corrupted assignments for this teacher
    await trx('teacher_class_assignments')
      .where('teacher_id', teacher_id)
      .del();

    // Restore assignments
    if (class_ids.length > 0) {
      const assignments = class_ids.map(classId => ({
        teacher_id,
        class_id: classId,
        created_at: trx.fn.now()
      }));

      await trx('teacher_class_assignments').insert(assignments);
      console.log(`Recovery: Restored ${assignments.length} class assignments for teacher ${teacher_id}`);
    }

    await trx.commit();

    // Get updated assignments for response
    const restoredAssignments = await db('teacher_class_assignments')
      .select('classes.id', 'classes.name', 'classes.level')
      .join('classes', 'teacher_class_assignments.class_id', 'classes.id')
      .where('teacher_class_assignments.teacher_id', teacher_id)
      .orderBy('classes.level')
      .orderBy('classes.name');

    res.json({ 
      success: true, 
      message: 'Teacher assignments restored successfully',
      data: {
        teacher_id,
        restored_classes: restoredAssignments
      }
    });
  } catch (error) {
    await trx.rollback();
    console.error('Error in assignment recovery:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error restoring assignments. Please try again.' 
    });
  }
});

// Get all teachers with their assignments (admin only) - optimized for dashboard
router.get('/teachers/with-assignments', authorize(['admin']), async (req, res) => {
  try {
    const teachers = await db('users')
      .select(
        'users.id',
        'users.username',
        'users.email',
        'users.name',
        'users.is_active'
      )
      .where('users.role', 'teacher')
      .orderBy('users.name');

    // Get all teacher assignments in a single query
    const allAssignments = await db('teacher_class_assignments')
      .select(
        'teacher_class_assignments.teacher_id',
        'classes.name as class_name',
        'classes.level'
      )
      .join('classes', 'teacher_class_assignments.class_id', 'classes.id')
      .orderBy('classes.level')
      .orderBy('classes.name');

    // Group assignments by teacher
    const assignmentsByTeacher = {};
    allAssignments.forEach(assignment => {
      if (!assignmentsByTeacher[assignment.teacher_id]) {
        assignmentsByTeacher[assignment.teacher_id] = [];
      }
      assignmentsByTeacher[assignment.teacher_id].push({
        name: assignment.class_name,
        level: assignment.level
      });
    });

    // Combine teachers with their assignments
    const teachersWithAssignments = teachers.map(teacher => ({
      id: teacher.id,
      username: teacher.username,
      email: teacher.email,
      name: teacher.name,
      is_active: teacher.is_active,
      assigned_classes: assignmentsByTeacher[teacher.id] || []
    }));

    res.json({ 
      success: true, 
      data: teachersWithAssignments 
    });
  } catch (error) {
    console.error('Error fetching teachers with assignments:', error);
    res.status(500).json({ success: false, message: 'Error fetching teachers with assignments' });
  }
});

// Get all teachers (admin only)
router.get('/teachers', authorize(['admin']), async (req, res) => {
  try {
    const teachers = await db('users')
      .select('id', 'username', 'email', 'name', 'is_active')
      .where('role', 'teacher')
      .orderBy('name');
    
    res.json({ success: true, data: teachers });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ success: false, message: 'Error fetching teachers' });
  }
});

// Get teacher's assigned classes
router.get('/teachers/:teacherId/classes', authorize(['admin']), async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Verify teacher exists
    const teacher = await db('users')
      .select('id', 'name', 'email')
      .where({ id: teacherId, role: 'teacher' })
      .first();

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Get assigned classes
    const assignedClasses = await db('teacher_class_assignments')
      .select(
        'classes.id',
        'classes.name',
        'classes.level',
        'classes.max_students',
        'teacher_class_assignments.created_at as assigned_at'
      )
      .join('classes', 'teacher_class_assignments.class_id', 'classes.id')
      .where('teacher_class_assignments.teacher_id', teacherId)
      .orderBy('classes.level')
      .orderBy('classes.name');

    // Get all available classes for assignment
    const allClasses = await db('classes')
      .select('id', 'name', 'level', db.raw('max_students as capacity'))
      .orderBy('level')
      .orderBy('name');

    res.json({ 
      success: true, 
      data: {
        teacher,
        assigned_classes: assignedClasses,
        available_classes: allClasses
      }
    });
  } catch (error) {
    console.error('Error fetching teacher classes:', error);
    res.status(500).json({ success: false, message: 'Error fetching teacher classes' });
  }
});

// Assign classes to teacher (admin only) - FIXED VERSION
router.post('/teachers/:teacherId/classes', authorize(['admin']), async (req, res) => {
  // Use a transaction to ensure data consistency
  const trx = await db.transaction();
  
  try {
    const { teacherId } = req.params;
    const { class_ids } = req.body; // Array of class IDs

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

    // Check for existing assignments to prevent conflicts
    const existingAssignments = await trx('teacher_class_assignments')
      .select('class_id')
      .whereIn('class_id', class_ids);

    if (existingAssignments.length > 0) {
      // Check if any of these classes are already assigned to other teachers
      const conflictingAssignments = await trx('teacher_class_assignments')
        .select('class_id')
        .whereIn('class_id', class_ids)
        .whereNot('teacher_id', teacherId);

      if (conflictingAssignments.length > 0) {
        await trx.rollback();
        return res.status(400).json({ 
          success: false, 
          message: 'One or more classes are already assigned to other teachers' 
        });
      }
    }

    // Remove existing assignments for this teacher ONLY
    await trx('teacher_class_assignments')
      .where('teacher_id', teacherId)
      .del();

    // Insert new assignments with proper error handling
    if (class_ids.length > 0) {
      const assignments = class_ids.map(classId => ({
        teacher_id: teacherId,
        class_id: classId,
        created_at: trx.fn.now()
      }));

      await trx('teacher_class_assignments').insert(assignments);
      console.log(`Successfully assigned ${assignments.length} classes to teacher ${teacherId}`);
    }

    // Commit the transaction
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
    // Rollback transaction on error
    await trx.rollback();
    console.error('Error assigning classes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error assigning classes. Please try again.' 
    });
  }
});

// Remove class assignment from teacher (admin only)
router.delete('/teachers/:teacherId/classes/:classId', authorize(['admin']), async (req, res) => {
  try {
    const { teacherId, classId } = req.params;

    const deleted = await db('teacher_class_assignments')
      .where({ teacher_id: teacherId, class_id: classId })
      .del();

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    res.json({ success: true, message: 'Class assignment removed successfully' });
  } catch (error) {
    console.error('Error removing class assignment:', error);
    res.status(500).json({ success: false, message: 'Error removing assignment' });
  }
});

// Get current user's assigned classes (for teachers)
router.get('/my-classes', protect, async (req, res) => {
  try {
    console.log('=== MY-CLASSES ENDPOINT ===');
    console.log('User:', req.user);
    
    const { role, id: userId } = req.user;

    if (role !== 'teacher') {
      console.log('Access denied: User is not a teacher');
      return res.status(403).json({ success: false, message: 'Only teachers can access this endpoint' });
    }

    console.log(`Fetching classes for teacher ID: ${userId}`);
    
    // First check if there are any assignments for this teacher
    const assignmentCount = await db('teacher_class_assignments')
      .where('teacher_id', userId)
      .count('* as count')
      .first();
    
    console.log(`Assignment count for teacher ${userId}:`, assignmentCount);

    const assignedClasses = await db('teacher_class_assignments')
      .select(
        'classes.id',
        'classes.name',
        'classes.level',
        'classes.max_students as capacity',
        'teacher_class_assignments.created_at as assigned_at'
      )
      .join('classes', 'teacher_class_assignments.class_id', 'classes.id')
      .where('teacher_class_assignments.teacher_id', userId)
      .orderBy('classes.level')
      .orderBy('classes.name');

    console.log(`Teacher ${userId} assigned classes:`, assignedClasses);
    res.json({ success: true, data: assignedClasses });
  } catch (error) {
    console.error('Error fetching assigned classes:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, message: 'Error fetching assigned classes', error: error.message });
  }
});

// Create new teacher (admin only)
router.post('/teachers', authorize(['admin']), async (req, res) => {
  try {
    const { username, email, name, password, phone, address, qualification, experience } = req.body;

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

    // Hash password with optimized rounds for faster processing
    const hashedPassword = await bcrypt.hash(password, 10); // Reduced from 12 to 10 for better performance

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

// Update teacher (admin only)
router.put('/teachers/:teacherId', authorize(['admin']), async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { username, email, name, phone, address, is_active } = req.body;

    // Check if teacher exists
    const teacher = await db('users')
      .where({ id: teacherId, role: 'teacher' })
      .first();

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Check if username or email already exists for other users
    if (username || email) {
      const existingUser = await db('users')
        .where(function() {
          if (username) this.where('username', username);
          if (email) this.orWhere('email', email);
        })
        .where('id', '!=', teacherId)
        .first();

      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Username or email already exists' });
      }
    }

    // Update teacher data
    const updateData = {
      updated_at: db.fn.now()
    };

    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (is_active !== undefined) updateData.is_active = is_active;

    await db('users').where('id', teacherId).update(updateData);

    // Return updated teacher data
    const updatedTeacher = await db('users')
      .select('id', 'username', 'email', 'name', 'role', 'phone', 'address', 'is_active', 'updated_at')
      .where('id', teacherId)
      .first();

    res.json({ 
      success: true, 
      message: 'Teacher updated successfully', 
      data: updatedTeacher 
    });
  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).json({ success: false, message: 'Error updating teacher' });
  }
});

// Delete teacher (admin only)
router.delete('/teachers/:teacherId', authorize(['admin']), async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Check if teacher exists
    const teacher = await db('users')
      .where({ id: teacherId, role: 'teacher' })
      .first();

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Delete teacher assignments first (due to foreign key constraints)
    await db('teacher_class_assignments').where('teacher_id', teacherId).del();

    // Delete teacher
    await db('users').where('id', teacherId).del();

    res.json({ 
      success: true, 
      message: 'Teacher deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({ success: false, message: 'Error deleting teacher' });
  }
});

// Reset teacher password (admin only)
router.post('/teachers/:teacherId/reset-password', authorize(['admin']), async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Check if teacher exists
    const teacher = await db('users')
      .where({ id: teacherId, role: 'teacher' })
      .first();

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password
    await db('users')
      .where('id', teacherId)
      .update({
        password: hashedPassword,
        updated_at: db.fn.now()
      });

    res.json({ 
      success: true, 
      message: 'Password reset successfully' 
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ success: false, message: 'Error resetting password' });
  }
});

// Debug endpoint to check database state
router.get('/debug/database', protect, authorize(['admin']), async (req, res) => {
  try {
    const teachers = await db('users').where('role', 'teacher').count('* as count').first();
    const classes = await db('classes').count('* as count').first();
    const assignments = await db('teacher_class_assignments').count('* as count').first();
    const students = await db('students').count('* as count').first();
    
    // Get sample data
    const sampleTeacher = await db('users').where('role', 'teacher').first();
    const sampleAssignments = await db('teacher_class_assignments').limit(5);
    
    res.json({
      success: true,
      data: {
        counts: { teachers, classes, assignments, students },
        samples: { sampleTeacher, sampleAssignments }
      }
    });
  } catch (error) {
    console.error('Debug database error:', error);
    res.status(500).json({ success: false, message: 'Debug error', error: error.message });
  }
});

module.exports = router;


