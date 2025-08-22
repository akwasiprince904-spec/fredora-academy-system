const db = require('../config/database');

// Generate student ID (FA[YEAR][SEQUENTIAL_NUMBER])
const generateStudentId = async () => {
  const currentYear = new Date().getFullYear();
  const yearPrefix = `FA${currentYear}`;
  
  // Get the last student ID for this year
  const lastStudent = await db('students')
    .where('student_id', 'like', `${yearPrefix}%`)
    .orderBy('student_id', 'desc')
    .first();

  let sequenceNumber = 1;
  if (lastStudent) {
    const lastSequence = parseInt(lastStudent.student_id.replace(yearPrefix, ''));
    sequenceNumber = lastSequence + 1;
  }

  return `${yearPrefix}${String(sequenceNumber).padStart(3, '0')}`;
};

// @desc    Get all students
// @route   GET /api/students
// @access  Private
const getStudents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      classId,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;

    // Build query
    let query = db('students as s')
      .leftJoin('classes as c', 's.class_id', 'c.id')
      .select(
        's.*',
        'c.name as class_name',
        'c.display_name as class_display_name'
      );

    // Apply filters
    if (search) {
      query = query.where(function() {
        this.where('s.first_name', 'like', `%${search}%`)
          .orWhere('s.last_name', 'like', `%${search}%`)
          .orWhere('s.student_id', 'like', `%${search}%`)
          .orWhere('s.parent_name', 'like', `%${search}%`)
          .orWhere('s.parent_phone', 'like', `%${search}%`);
      });
    }

    if (classId) {
      query = query.where('s.class_id', classId);
    }

    if (status) {
      query = query.where('s.status', status);
    }

    // Get total count for pagination
    const countQuery = query.clone();
    const totalCount = await countQuery.count('s.id as count').first();

    // Apply sorting and pagination
    const students = await query
      .orderBy(`s.${sortBy}`, sortOrder)
      .limit(limit)
      .offset(offset);

    res.json({
      success: true,
      data: students,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount.count / limit),
        totalItems: totalCount.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
const getStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await db('students as s')
      .leftJoin('classes as c', 's.class_id', 'c.id')
      .select(
        's.*',
        'c.name as class_name',
        'c.display_name as class_display_name'
      )
      .where('s.id', id)
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
    console.error('Get student error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Create new student
// @route   POST /api/students
// @access  Private
const createStudent = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      middle_name,
      date_of_birth,
      gender,
      class_id,
      parent_name,
      parent_phone,
      parent_email,
      parent_occupation,
      parent_address,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relationship,
      medical_conditions,
      allergies,
      medications,
      blood_group,
      special_needs,
      previous_school,
      previous_academic_record,
      admission_score,
      address,
      phone,
      email,
      notes
    } = req.body;

    // Validation
    if (!first_name || !last_name || !date_of_birth || !gender || !class_id || !parent_name || !parent_phone) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: first_name, last_name, date_of_birth, gender, class_id, parent_name, parent_phone'
      });
    }

    // Check if class exists
    const classExists = await db('classes').where('id', class_id).first();
    if (!classExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid class ID'
      });
    }

    // Generate student ID
    const studentId = await generateStudentId();

    // Create student
    const [newStudent] = await db('students')
      .insert({
        student_id: studentId,
        first_name,
        last_name,
        middle_name,
        date_of_birth,
        gender,
        class_id,
        enrollment_date: new Date(),
        parent_name,
        parent_phone,
        parent_email,
        parent_occupation,
        parent_address,
        emergency_contact_name,
        emergency_contact_phone,
        emergency_contact_relationship,
        medical_conditions,
        allergies,
        medications,
        blood_group,
        special_needs,
        previous_school,
        previous_academic_record,
        admission_score,
        address,
        phone,
        email,
        notes,
        status: 'active'
      })
      .returning('*');

    res.status(201).json({
      success: true,
      message: 'Student enrolled successfully',
      data: newStudent
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if student exists
    const existingStudent = await db('students').where('id', id).first();
    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // If class_id is being updated, validate it
    if (updateData.class_id) {
      const classExists = await db('classes').where('id', updateData.class_id).first();
      if (!classExists) {
        return res.status(400).json({
          success: false,
          message: 'Invalid class ID'
        });
      }
    }

    // Update student
    const [updatedStudent] = await db('students')
      .where('id', id)
      .update({
        ...updateData,
        updated_at: db.fn.now()
      })
      .returning('*');

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if student exists
    const existingStudent = await db('students').where('id', id).first();
    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Soft delete by updating status
    await db('students')
      .where('id', id)
      .update({
        status: 'inactive',
        updated_at: db.fn.now()
      });

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get student statistics
// @route   GET /api/students/stats
// @access  Private
const getStudentStats = async (req, res) => {
  try {
    const totalStudents = await db('students').count('id as count').first();
    const activeStudents = await db('students').where('status', 'active').count('id as count').first();
    const inactiveStudents = await db('students').where('status', 'inactive').count('id as count').first();

    // Students by class
    const studentsByClass = await db('students as s')
      .leftJoin('classes as c', 's.class_id', 'c.id')
      .select('c.name as class_name', 'c.display_name as class_display_name')
      .count('s.id as count')
      .where('s.status', 'active')
      .groupBy('c.id', 'c.name', 'c.display_name')
      .orderBy('c.level');

    // Students by gender
    const studentsByGender = await db('students')
      .select('gender')
      .count('id as count')
      .where('status', 'active')
      .groupBy('gender');

    // Recent enrollments (last 30 days)
    const recentEnrollments = await db('students')
      .where('enrollment_date', '>=', db.raw('date("now", "-30 days")'))
      .count('id as count')
      .first();

    res.json({
      success: true,
      data: {
        total: totalStudents.count,
        active: activeStudents.count,
        inactive: inactiveStudents.count,
        byClass: studentsByClass,
        byGender: studentsByGender,
        recentEnrollments: recentEnrollments.count
      }
    });
  } catch (error) {
    console.error('Get student stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Bulk import students
// @route   POST /api/students/bulk-import
// @access  Private
const bulkImportStudents = async (req, res) => {
  try {
    const { students } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Students array is required'
      });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < students.length; i++) {
      const studentData = students[i];
      
      try {
        // Validate required fields
        if (!studentData.first_name || !studentData.last_name || !studentData.date_of_birth || 
            !studentData.gender || !studentData.class_id || !studentData.parent_name || !studentData.parent_phone) {
          errors.push({
            row: i + 1,
            error: 'Missing required fields'
          });
          continue;
        }

        // Check if class exists
        const classExists = await db('classes').where('id', studentData.class_id).first();
        if (!classExists) {
          errors.push({
            row: i + 1,
            error: 'Invalid class ID'
          });
          continue;
        }

        // Generate student ID
        const studentId = await generateStudentId();

        // Create student
        const [newStudent] = await db('students')
          .insert({
            student_id: studentId,
            first_name: studentData.first_name,
            last_name: studentData.last_name,
            middle_name: studentData.middle_name,
            date_of_birth: studentData.date_of_birth,
            gender: studentData.gender,
            class_id: studentData.class_id,
            enrollment_date: new Date(),
            parent_name: studentData.parent_name,
            parent_phone: studentData.parent_phone,
            parent_email: studentData.parent_email,
            parent_occupation: studentData.parent_occupation,
            parent_address: studentData.parent_address,
            emergency_contact_name: studentData.emergency_contact_name,
            emergency_contact_phone: studentData.emergency_contact_phone,
            emergency_contact_relationship: studentData.emergency_contact_relationship,
            medical_conditions: studentData.medical_conditions,
            allergies: studentData.allergies,
            medications: studentData.medications,
            blood_group: studentData.blood_group,
            special_needs: studentData.special_needs,
            previous_school: studentData.previous_school,
            previous_academic_record: studentData.previous_academic_record,
            admission_score: studentData.admission_score,
            address: studentData.address,
            phone: studentData.phone,
            email: studentData.email,
            notes: studentData.notes,
            status: 'active'
          })
          .returning(['id', 'student_id', 'first_name', 'last_name']);

        results.push(newStudent);
      } catch (error) {
        errors.push({
          row: i + 1,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Bulk import completed. ${results.length} students imported successfully.`,
      data: {
        imported: results,
        errors: errors
      }
    });
  } catch (error) {
    console.error('Bulk import students error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentStats,
  bulkImportStudents
};














