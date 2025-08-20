const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { protect, authorize } = require('../middleware/auth');

// Get all subjects
router.get('/', protect, async (req, res) => {
  try {
    const subjects = await db('subjects')
      .where('is_active', true)
      .orderBy('name');
    
    res.json({ success: true, data: subjects });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ success: false, message: 'Error fetching subjects' });
  }
});

// Get subject by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const subject = await db('subjects')
      .where('id', req.params.id)
      .first();
    
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    
    res.json({ success: true, data: subject });
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({ success: false, message: 'Error fetching subject' });
  }
});

// Get all subject assignments (for admin dashboard)
router.get('/assignments/all', protect, authorize(['admin']), async (req, res) => {
  try {
    const assignments = await db('teacher_subject_assignments')
      .select(
        'teacher_subject_assignments.id',
        'teacher_subject_assignments.teacher_id',
        'teacher_subject_assignments.class_id',
        'teacher_subject_assignments.subject_id',
        'teacher_subject_assignments.created_at',
        'subjects.name as subject_name',
        'subjects.code as subject_code',
        'classes.name as class_name',
        'classes.level as class_level',
        'users.name as teacher_name',
        'users.username as teacher_username'
      )
      .join('subjects', 'teacher_subject_assignments.subject_id', 'subjects.id')
      .join('classes', 'teacher_subject_assignments.class_id', 'classes.id')
      .join('users', 'teacher_subject_assignments.teacher_id', 'users.id')
      .where('users.role', 'teacher')
      .orderBy('subjects.name')
      .orderBy('classes.level');

    res.json({ success: true, data: assignments });
  } catch (error) {
    console.error('Error fetching subject assignments:', error);
    res.status(500).json({ success: false, message: 'Error fetching subject assignments' });
  }
});

// Get assignments for a specific subject
router.get('/:id/assignments', protect, async (req, res) => {
  try {
    const { id } = req.params;
    
    const assignments = await db('teacher_subject_assignments')
      .select(
        'teacher_subject_assignments.id',
        'teacher_subject_assignments.teacher_id',
        'teacher_subject_assignments.class_id',
        'classes.name as class_name',
        'classes.level as class_level',
        'users.name as teacher_name',
        'users.username as teacher_username'
      )
      .join('classes', 'teacher_subject_assignments.class_id', 'classes.id')
      .join('users', 'teacher_subject_assignments.teacher_id', 'users.id')
      .where('teacher_subject_assignments.subject_id', id)
      .orderBy('classes.level')
      .orderBy('classes.name');

    res.json({ success: true, data: assignments });
  } catch (error) {
    console.error('Error fetching subject assignments:', error);
    res.status(500).json({ success: false, message: 'Error fetching subject assignments' });
  }
});

// Create new subject (Admin only)
router.post('/', protect, authorize(['admin']), async (req, res) => {
  try {
    const { name, code, description, is_core } = req.body;
    
    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Name and code are required' });
    }
    
    // Check if subject code already exists
    const existingSubject = await db('subjects')
      .where('code', code)
      .first();
    
    if (existingSubject) {
      return res.status(400).json({ success: false, message: 'Subject code already exists' });
    }
    
    const [subjectId] = await db('subjects').insert({
      name,
      code,
      description: description || '',
      is_core: is_core || false,
      is_active: true,
      created_at: db.fn.now()
    });
    
    const newSubject = await db('subjects')
      .where('id', subjectId)
      .first();
    
    res.status(201).json({ success: true, data: newSubject, message: 'Subject created successfully' });
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ success: false, message: 'Error creating subject' });
  }
});

// Update subject (Admin only)
router.put('/:id', protect, authorize(['admin']), async (req, res) => {
  try {
    const { name, code, description, is_core, is_active } = req.body;
    const subjectId = req.params.id;
    
    // Check if subject exists
    const existingSubject = await db('subjects')
      .where('id', subjectId)
      .first();
    
    if (!existingSubject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    
    // Check if new code conflicts with existing subjects
    if (code && code !== existingSubject.code) {
      const codeConflict = await db('subjects')
        .where('code', code)
        .whereNot('id', subjectId)
        .first();
      
      if (codeConflict) {
        return res.status(400).json({ success: false, message: 'Subject code already exists' });
      }
    }
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code;
    if (description !== undefined) updateData.description = description;
    if (is_core !== undefined) updateData.is_core = is_core;
    if (is_active !== undefined) updateData.is_active = is_active;
    updateData.updated_at = db.fn.now();
    
    await db('subjects')
      .where('id', subjectId)
      .update(updateData);
    
    const updatedSubject = await db('subjects')
      .where('id', subjectId)
      .first();
    
    res.json({ success: true, data: updatedSubject, message: 'Subject updated successfully' });
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ success: false, message: 'Error updating subject' });
  }
});

// Delete subject (Admin only) - Soft delete
router.delete('/:id', protect, authorize(['admin']), async (req, res) => {
  try {
    const subjectId = req.params.id;
    
    // Check if subject exists
    const existingSubject = await db('subjects')
      .where('id', subjectId)
      .first();
    
    if (!existingSubject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    
    // Check if subject is being used in grades
    const gradeUsage = await db('grades')
      .where('subject_id', subjectId)
      .first();
    
    if (gradeUsage) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete subject as it has associated grades' 
      });
    }
    
    // Soft delete by setting is_active to false
    await db('subjects')
      .where('id', subjectId)
      .update({ is_active: false, updated_at: db.fn.now() });
    
    res.json({ success: true, message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ success: false, message: 'Error deleting subject' });
  }
});

// Assign subject to teacher and class (Admin only)
router.post('/assign', protect, authorize(['admin']), async (req, res) => {
  const trx = await db.transaction();
  
  try {
    const { teacher_id, subject_id, class_id } = req.body;
    
    if (!teacher_id || !subject_id || !class_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Teacher ID, Subject ID, and Class ID are required' 
      });
    }

    // Verify teacher exists and is a teacher
    const teacher = await trx('users')
      .where({ id: teacher_id, role: 'teacher', is_active: true })
      .first();

    if (!teacher) {
      await trx.rollback();
      return res.status(404).json({ 
        success: false, 
        message: 'Teacher not found or inactive' 
      });
    }

    // Verify subject exists
    const subject = await trx('subjects')
      .where({ id: subject_id, is_active: true })
      .first();

    if (!subject) {
      await trx.rollback();
      return res.status(404).json({ 
        success: false, 
        message: 'Subject not found or inactive' 
      });
    }

    // Verify class exists
    const classRecord = await trx('classes')
      .where({ id: class_id })
      .first();

    if (!classRecord) {
      await trx.rollback();
      return res.status(404).json({ 
        success: false, 
        message: 'Class not found' 
      });
    }

    // Check if assignment already exists
    const existingAssignment = await trx('teacher_subject_assignments')
      .where({ 
        teacher_id, 
        subject_id, 
        class_id 
      })
      .first();

    if (existingAssignment) {
      await trx.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'This subject is already assigned to this teacher for this class' 
      });
    }

    // Create the assignment
    const [assignmentId] = await trx('teacher_subject_assignments').insert({
      teacher_id,
      subject_id,
      class_id,
      created_at: trx.fn.now()
    });

    await trx.commit();

    // Get the created assignment with details
    const newAssignment = await db('teacher_subject_assignments')
      .select(
        'teacher_subject_assignments.id',
        'teacher_subject_assignments.teacher_id',
        'teacher_subject_assignments.subject_id',
        'teacher_subject_assignments.class_id',
        'teacher_subject_assignments.created_at',
        'subjects.name as subject_name',
        'subjects.code as subject_code',
        'classes.name as class_name',
        'classes.level as class_level',
        'users.name as teacher_name',
        'users.username as teacher_username'
      )
      .join('subjects', 'teacher_subject_assignments.subject_id', 'subjects.id')
      .join('classes', 'teacher_subject_assignments.class_id', 'classes.id')
      .join('users', 'teacher_subject_assignments.teacher_id', 'users.id')
      .where('teacher_subject_assignments.id', assignmentId)
      .first();

    res.status(201).json({ 
      success: true, 
      message: 'Subject assigned successfully',
      data: newAssignment
    });
  } catch (error) {
    await trx.rollback();
    console.error('Error assigning subject:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error assigning subject. Please try again.' 
    });
  }
});

// Remove subject assignment (Admin only)
router.delete('/assign/:assignmentId', protect, authorize(['admin']), async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    const deleted = await db('teacher_subject_assignments')
      .where('id', assignmentId)
      .del();

    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        message: 'Assignment not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Subject assignment removed successfully' 
    });
  } catch (error) {
    console.error('Error removing subject assignment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error removing assignment' 
    });
  }
});

// Get teacher-subject assignments
router.get('/assignments/teacher/:teacherId', protect, async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    
    const assignments = await db('teacher_subject_assignments')
      .select(
        'teacher_subject_assignments.id',
        'teacher_subject_assignments.subject_id',
        'teacher_subject_assignments.class_id',
        'subjects.name as subject_name',
        'subjects.code as subject_code',
        'classes.name as class_name',
        'classes.level as class_level'
      )
      .join('subjects', 'teacher_subject_assignments.subject_id', 'subjects.id')
      .join('classes', 'teacher_subject_assignments.class_id', 'classes.id')
      .where('teacher_subject_assignments.teacher_id', teacherId)
      .orderBy('subjects.name')
      .orderBy('classes.level');

    res.json({ success: true, data: assignments });
  } catch (error) {
    console.error('Error fetching teacher assignments:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching teacher assignments' 
    });
  }
});

// Get all teacher-subject assignments (Admin only)
router.get('/assignments/all', protect, authorize(['admin']), async (req, res) => {
  try {
    const assignments = await db('teacher_subject_assignments')
      .select(
        'teacher_subject_assignments.id',
        'teacher_subject_assignments.teacher_id',
        'teacher_subject_assignments.class_id',
        'teacher_subject_assignments.subject_id',
        'teacher_subject_assignments.created_at',
        'subjects.name as subject_name',
        'subjects.code as subject_code',
        'classes.name as class_name',
        'classes.level as class_level',
        'users.name as teacher_name',
        'users.username as teacher_username'
      )
      .join('subjects', 'teacher_subject_assignments.subject_id', 'subjects.id')
      .join('classes', 'teacher_subject_assignments.class_id', 'classes.id')
      .join('users', 'teacher_subject_assignments.teacher_id', 'users.id')
      .where('users.role', 'teacher')
      .orderBy('subjects.name')
      .orderBy('classes.level');

    res.json({ success: true, data: assignments });
  } catch (error) {
    console.error('Error fetching all assignments:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching assignments' 
    });
  }
});

// Get assignments for a specific subject
router.get('/:id/assignments', protect, async (req, res) => {
  try {
    const { id } = req.params;
    
    const assignments = await db('teacher_subject_assignments')
      .select(
        'teacher_subject_assignments.id',
        'teacher_subject_assignments.teacher_id',
        'teacher_subject_assignments.class_id',
        'classes.name as class_name',
        'classes.level as class_level',
        'users.name as teacher_name',
        'users.username as teacher_username'
      )
      .join('classes', 'teacher_subject_assignments.class_id', 'classes.id')
      .join('users', 'teacher_subject_assignments.teacher_id', 'users.id')
      .where('teacher_subject_assignments.subject_id', id)
      .orderBy('classes.level')
      .orderBy('classes.name');

    res.json({ success: true, data: assignments });
  } catch (error) {
    console.error('Error fetching subject assignments:', error);
    res.status(500).json({ success: false, message: 'Error fetching subject assignments' });
  }
});

module.exports = router;
