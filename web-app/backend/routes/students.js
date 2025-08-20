const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const db = require('../config/database');
const { logger } = require('../utils/logger');
const { generateStudentId } = require('../utils/studentUtils');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// IMPORTANT: Stats route must be defined BEFORE dynamic :id route to avoid
// Express catching "stats" as an :id. This early route exposes an overview
// for dashboard metrics and class distribution.
// @desc    Get student statistics (overview + class distribution)
// @route   GET /api/students/stats/overview
// @access  Private (Admin, Teacher)
router.get('/stats/overview', async (req, res) => {
  try {
    // Add timeout to prevent hanging queries
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database query timeout')), 10000);
    });

    const statsPromise = db('students')
      .select(
        db.raw('COUNT(*) as total_students'),
        db.raw('COUNT(CASE WHEN status = "active" THEN 1 END) as active_students'),
        db.raw('COUNT(CASE WHEN status = "inactive" THEN 1 END) as inactive_students'),
        db.raw('COUNT(CASE WHEN status = "graduated" THEN 1 END) as graduated_students'),
        db.raw('COUNT(CASE WHEN gender = "Male" THEN 1 END) as male_students'),
        db.raw('COUNT(CASE WHEN gender = "Female" THEN 1 END) as female_students'),
        db.raw('SUM(fee_balance) as total_fee_balance')
      )
      .first();

    const classDistributionPromise = db('students')
      .select(
        'classes.name as class_name',
        'classes.display_name as class_display_name',
        db.raw('COUNT(students.id) as student_count')
      )
      .leftJoin('classes', 'students.class_id', 'classes.id')
      .where('students.status', 'active')
      .groupBy('classes.id', 'classes.name', 'classes.display_name')
      .orderBy('classes.level');

    // Execute both queries with timeout
    const [stats, classDistribution] = await Promise.race([
      Promise.all([statsPromise, classDistributionPromise]),
      timeoutPromise
    ]);

    res.json({ success: true, data: { overview: stats, classDistribution } });
  } catch (error) {
    logger.error('Get student stats error:', error);
    if (error.message === 'Database query timeout') {
      res.status(408).json({ success: false, message: 'Request timeout - database is taking too long to respond' });
    } else {
      res.status(500).json({ success: false, message: 'Server error while fetching student statistics' });
    }
  }
});

// @desc    Get all students with pagination and filters
// @route   GET /api/students
// @access  Private (Admin, Teacher)
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('class').optional().isString().withMessage('Class must be a string'),
  query('status').optional().isIn(['active', 'inactive', 'graduated', 'transferred']).withMessage('Invalid status'),
  query('sortBy').optional().isIn(['name', 'student_id', 'enrollment_date', 'class']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 10,
      search,
      class: classFilter,
      status,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const offset = (page - 1) * limit;

    // Build query
    let query = db('students')
      .select(
        'students.*',
        'classes.name as class_name',
        'classes.display_name as class_display_name'
      )
      .leftJoin('classes', 'students.class_id', 'classes.id');

    // Apply filters
    if (search) {
      query = query.where(function() {
        this.where('students.first_name', 'like', `%${search}%`)
          .orWhere('students.last_name', 'like', `%${search}%`)
          .orWhere('students.student_id', 'like', `%${search}%`)
          .orWhere('students.parent_name', 'like', `%${search}%`);
      });
    }

    if (classFilter) {
      query = query.where('classes.name', classFilter);
    }

    if (status) {
      query = query.where('students.status', status);
    }

    // Apply sorting
    const sortField = sortBy === 'name' ? 'students.first_name' : `students.${sortBy}`;
    query = query.orderBy(sortField, sortOrder);

    // Get total count for pagination
    const countQuery = query.clone();
    const total = await countQuery.count('* as count').first();

    // Apply pagination
    const students = await query.limit(limit).offset(offset);

    // Calculate pagination info
    const totalPages = Math.ceil(total.count / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: students,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total.count,
        itemsPerPage: parseInt(limit),
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    logger.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching students'
    });
  }
});

// @desc    Get single student by ID
// @route   GET /api/students/:id
// @access  Private (Admin, Teacher)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const student = await db('students')
      .select(
        'students.*',
        'classes.name as class_name',
        'classes.display_name as class_display_name'
      )
      .leftJoin('classes', 'students.class_id', 'classes.id')
      .where('students.id', id)
      .first();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    logger.error('Get student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching student'
    });
  }
});

// @desc    Create new student
// @route   POST /api/students
// @access  Private (Admin only)
router.post('/', [
  authorize('admin'),
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('dateOfBirth')
    .notEmpty()
    .withMessage('Date of birth is required')
    .isISO8601()
    .withMessage('Date of birth must be a valid date'),
  body('gender')
    .notEmpty()
    .withMessage('Gender is required')
    .isIn(['Male', 'Female'])
    .withMessage('Gender must be Male or Female'),
  body('class')
    .notEmpty()
    .withMessage('Class is required'),
  body('parentName')
    .notEmpty()
    .withMessage('Parent name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Parent name must be between 2 and 100 characters'),
  body('parentPhone')
    .notEmpty()
    .withMessage('Parent phone is required')
    .matches(/^\+233\s?\d{2}\s?\d{3}\s?\d{4}$/)
    .withMessage('Please provide a valid Ghanaian phone number'),
  body('address')
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Address must be between 10 and 500 characters'),
  body('parentEmail')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('enrollmentDate')
    .optional()
    .isISO8601()
    .withMessage('Enrollment date must be a valid date'),
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      class: className,
      parentName,
      parentPhone,
      parentEmail,
      address,
      emergencyContact,
      emergencyPhone,
      medicalConditions,
      allergies,
      bloodGroup,
      medications,
      specialNeeds,
      additionalNotes,
      enrollmentDate = new Date().toISOString().split('T')[0]
    } = req.body;

    // Get class ID
    const classRecord = await db('classes')
      .where('name', className)
      .first();

    if (!classRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid class selected'
      });
    }

    // Generate student ID
    const studentId = await generateStudentId();

    // Validate age (2-18 years)
    const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
    if (age < 2 || age > 18) {
      return res.status(400).json({
        success: false,
        message: 'Student must be between 2 and 18 years old'
      });
    }

    // Insert student
    const [student] = await db('students').insert({
      student_id: studentId,
      first_name: firstName,
      last_name: lastName,
      date_of_birth: dateOfBirth,
      gender,
      class_id: classRecord.id,
      parent_name: parentName,
      parent_phone: parentPhone,
      parent_email: parentEmail,
      address,
      emergency_contact: emergencyContact,
      emergency_phone: emergencyPhone,
      medical_conditions: medicalConditions,
      allergies,
      blood_group: bloodGroup,
      medications,
      special_needs: specialNeeds,
      additional_notes: additionalNotes,
      enrollment_date: enrollmentDate,
      status: 'active',
      fee_balance: 0.00
    }).returning('*');

    logger.info(`New student created: ${studentId} - ${firstName} ${lastName}`);

    res.status(201).json({
      success: true,
      message: 'Student enrolled successfully',
      data: {
        ...student,
        class_name: classRecord.name,
        class_display_name: classRecord.display_name
      }
    });
  } catch (error) {
    logger.error('Create student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating student'
    });
  }
});

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (Admin only)
router.put('/:id', [
  authorize('admin'),
  body('firstName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date'),
  body('gender')
    .optional()
    .isIn(['Male', 'Female'])
    .withMessage('Gender must be Male or Female'),
  body('parentName')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Parent name must be between 2 and 100 characters'),
  body('parentPhone')
    .optional()
    .matches(/^\+233\s?\d{2}\s?\d{3}\s?\d{4}$/)
    .withMessage('Please provide a valid Ghanaian phone number'),
  body('parentEmail')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'graduated', 'transferred'])
    .withMessage('Invalid status'),
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = {};

    // Check if student exists
    const existingStudent = await db('students')
      .where('id', id)
      .first();

    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Build update data
    const allowedFields = [
      'firstName', 'lastName', 'dateOfBirth', 'gender', 'parentName',
      'parentPhone', 'parentEmail', 'address', 'emergencyContact',
      'emergencyPhone', 'medicalConditions', 'allergies', 'bloodGroup',
      'medications', 'specialNeeds', 'additionalNotes', 'status'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        const dbField = field.replace(/([A-Z])/g, '_$1').toLowerCase();
        updateData[dbField] = req.body[field];
      }
    });

    // Validate age if date of birth is being updated
    if (updateData.date_of_birth) {
      const age = new Date().getFullYear() - new Date(updateData.date_of_birth).getFullYear();
      if (age < 2 || age > 18) {
        return res.status(400).json({
          success: false,
          message: 'Student must be between 2 and 18 years old'
        });
      }
    }

    // Update student
    await db('students')
      .where('id', id)
      .update({
        ...updateData,
        updated_at: db.fn.now()
      });

    // Get updated student
    const updatedStudent = await db('students')
      .select(
        'students.*',
        'classes.name as class_name',
        'classes.display_name as class_display_name'
      )
      .leftJoin('classes', 'students.class_id', 'classes.id')
      .where('students.id', id)
      .first();

    logger.info(`Student updated: ${existingStudent.student_id} - ${existingStudent.first_name} ${existingStudent.last_name}`);

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent
    });
  } catch (error) {
    logger.error('Update student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating student'
    });
  }
});

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if student exists
    const student = await db('students')
      .where('id', id)
      .first();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Soft delete by setting status to inactive
    await db('students')
      .where('id', id)
      .update({
        status: 'inactive',
        updated_at: db.fn.now()
      });

    logger.info(`Student deleted: ${student.student_id} - ${student.first_name} ${student.last_name}`);

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    logger.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting student'
    });
  }
});

module.exports = router;










