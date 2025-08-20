const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

router.use(protect);

// Get all grades (admin) or assigned class grades (teacher)
router.get('/', async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    let query = db('grades')
      .select(
        'grades.*',
        db.raw("(students.first_name || ' ' || students.last_name) as student_name"),
        'students.id as student_id',
        'subjects.name as subject_name',
        'classes.name as class_name',
        'grades.id as grade_id',
        db.raw('100 as max_score')
      )
      .join('students', 'grades.student_id', 'students.id')
      .join('subjects', 'grades.subject_id', 'subjects.id')
      .join('classes', 'students.class_id', 'classes.id');

    if (role === 'teacher') {
      // Only show grades for classes assigned to this teacher
      query = query.join('teacher_class_assignments', 'classes.id', 'teacher_class_assignments.class_id')
        .where('teacher_class_assignments.teacher_id', userId);
    }

    const grades = await query.orderBy('grades.created_at', 'desc');
    res.json({ success: true, data: grades });
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).json({ success: false, message: 'Error fetching grades' });
  }
});

// Get grades for a specific student
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { role, id: userId } = req.user;

    let query = db('grades')
      .select('grades.*', 'subjects.name as subject_name', 'grades.id as grade_id', db.raw('100 as max_score'))
      .join('subjects', 'grades.subject_id', 'subjects.id')
      .where('grades.student_id', studentId);

    if (role === 'teacher') {
      // Verify teacher has access to this student's class
      const student = await db('students').select('class_id').where('id', studentId).first();
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }

      const hasAccess = await db('teacher_class_assignments')
        .where({ teacher_id: userId, class_id: student.class_id })
        .first();

      if (!hasAccess) {
        return res.status(403).json({ success: false, message: 'Access denied to this student' });
      }
    }

    const grades = await query.orderBy('term').orderBy('academic_year');
    res.json({ success: true, data: grades });
  } catch (error) {
    console.error('Error fetching student grades:', error);
    res.status(500).json({ success: false, message: 'Error fetching student grades' });
  }
});

// Create or update grade (teachers and admins)
router.post('/', async (req, res) => {
  try {
    const { student_id, subject_id, term, academic_year, assessment_type, score, max_score, remarks } = req.body;
    const { role, id: userId } = req.user;

    // Validation
    if (!student_id || !subject_id || !term || !academic_year || !assessment_type || score === undefined || !max_score) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    const effectiveMax = Number(max_score) || 100;
    if (score < 0 || score > effectiveMax) {
      return res.status(400).json({ success: false, message: 'Score must be between 0 and 100' });
    }

    // Check if teacher has access to this student's class
    if (role === 'teacher') {
      const student = await db('students').select('class_id').where('id', student_id).first();
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }

      const hasAccess = await db('teacher_class_assignments')
        .where({ teacher_id: userId, class_id: student.class_id })
        .first();

      if (!hasAccess) {
        return res.status(403).json({ success: false, message: 'Access denied to this student' });
      }
    }

    // Check if grade already exists
    const existingGrade = await db('grades')
      .where({ student_id, subject_id, term, academic_year, assessment_type })
      .first();

    const gradeData = {
      student_id,
      subject_id,
      term,
      academic_year,
      assessment_type,
      score,
      // Calculate weighted score based on assessment type (CA 40%, EXAM 60%)
      weighted_score: assessment_type === 'EXAM' || assessment_type === 'exam'
        ? (Number(score) / effectiveMax) * 60
        : (Number(score) / effectiveMax) * 40,
      remarks: remarks || null,
      updated_at: db.fn.now()
    };

    if (existingGrade) {
      // Update existing grade
      await db('grades')
        .where({ student_id, subject_id, term, academic_year, assessment_type })
        .update(gradeData);
      
      res.json({ success: true, message: 'Grade updated successfully', data: { id: existingGrade.id, ...gradeData } });
    } else {
      // Create new grade
      gradeData.created_at = db.fn.now();
      const [gradeId] = await db('grades').insert(gradeData);
      
      res.status(201).json({ success: true, message: 'Grade created successfully', data: { id: gradeId, ...gradeData } });
    }
  } catch (error) {
    console.error('Error creating/updating grade:', error);
    res.status(500).json({ success: false, message: 'Error saving grade' });
  }
});

// Update grade (alternative endpoint)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { score, max_score, remarks } = req.body;
    const { role, id: userId } = req.user;

    const effectiveMax = Number(max_score) || 100;
    if (score < 0 || score > effectiveMax) {
      return res.status(400).json({ success: false, message: 'Score must be between 0 and 100' });
    }

    // Check if grade exists and teacher has access
    const grade = await db('grades')
      .select('grades.*', 'students.class_id')
      .join('students', 'grades.student_id', 'students.id')
      .where('grades.id', id)
      .first();

    if (!grade) {
      return res.status(404).json({ success: false, message: 'Grade not found' });
    }

    if (role === 'teacher') {
      const hasAccess = await db('teacher_class_assignments')
        .where({ teacher_id: userId, class_id: grade.class_id })
        .first();

      if (!hasAccess) {
        return res.status(403).json({ success: false, message: 'Access denied to this grade' });
      }
    }

    await db('grades')
      .where('id', id)
      .update({
        score,
        remarks: remarks || null,
        updated_at: db.fn.now()
      });

    res.json({ success: true, message: 'Grade updated successfully' });
  } catch (error) {
    console.error('Error updating grade:', error);
    res.status(500).json({ success: false, message: 'Error updating grade' });
  }
});

// Delete grade (admin only)
router.delete('/:id', authorize(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await db('grades').where('id', id).del();
    
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Grade not found' });
    }

    res.json({ success: true, message: 'Grade deleted successfully' });
  } catch (error) {
    console.error('Error deleting grade:', error);
    res.status(500).json({ success: false, message: 'Error deleting grade' });
  }
});

// Get grades for teacher's assigned classes
router.get('/my-students', async (req, res) => {
  try {
    console.log('=== MY-STUDENTS ENDPOINT ===');
    console.log('User:', req.user);
    
    const { role, id: userId } = req.user;

    if (role !== 'teacher') {
      console.log('Access denied: User is not a teacher');
      return res.status(403).json({ success: false, message: 'Only teachers can access this endpoint' });
    }

    console.log(`Fetching students for teacher ID: ${userId}`);

    // Get all students in teacher's assigned classes with their grades
    const studentsWithGrades = await db('students')
      .select(
        'students.id as student_id',
        db.raw("(students.first_name || ' ' || students.last_name) as student_name"),
        'students.student_id as admission_number',
        'classes.name as class_name',
        'classes.level as class_level',
        'grades.id as grade_id',
        'grades.subject_id',
        'grades.term',
        'grades.academic_year',
        'grades.assessment_type',
        'grades.score',
        'grades.max_score',
        'grades.remarks',
        'subjects.name as subject_name'
      )
      .join('classes', 'students.class_id', 'classes.id')
      .join('teacher_class_assignments', 'classes.id', 'teacher_class_assignments.class_id')
      .leftJoin('grades', 'students.id', 'grades.student_id')
      .leftJoin('subjects', 'grades.subject_id', 'subjects.id')
      .where('teacher_class_assignments.teacher_id', userId)
      .orderBy('students.first_name')
      .orderBy('subjects.name');

    console.log(`Found ${studentsWithGrades.length} student records for teacher ${userId}`);
    res.json({ success: true, data: studentsWithGrades });
  } catch (error) {
    console.error('Error fetching student grades:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, message: 'Error fetching student grades', error: error.message });
  }
});

// Get subjects for a specific class (for grade entry)
router.get('/class/:classId/subjects', async (req, res) => {
  try {
    const { classId } = req.params;
    const { role, id: userId } = req.user;

    // Verify teacher has access to this class
    if (role === 'teacher') {
      const hasAccess = await db('teacher_class_assignments')
        .where({ teacher_id: userId, class_id: classId })
        .first();

      if (!hasAccess) {
        return res.status(403).json({ success: false, message: 'Access denied to this class' });
      }
    }

    // Get subjects (generic list for now)
    const subjects = await db('subjects')
      .select('id', 'name', 'code')
      .where('is_active', true)
      .orderBy('name');

    // Get students in the class (compose full name from first/last)
    const students = await db('students')
      .select(
        'students.id as id',
        db.raw("(students.first_name || ' ' || students.last_name) as name"),
        'students.student_id as admission_number'
      )
      .where('class_id', classId)
      .orderBy('students.first_name');

    res.json({ 
      success: true, 
      data: {
        subjects,
        students
      }
    });
  } catch (error) {
    console.error('Error fetching class subjects:', error);
    res.status(500).json({ success: false, message: 'Error fetching class subjects' });
  }
});

// Batch update grades for multiple students
router.post('/batch-update', async (req, res) => {
  try {
    const { grades } = req.body; // Array of grade objects
    const { role, id: userId } = req.user;

    if (!Array.isArray(grades) || grades.length === 0) {
      return res.status(400).json({ success: false, message: 'Grades array is required' });
    }

    // Validate and process each grade
    const processedGrades = [];
    for (const grade of grades) {
      const { student_id, subject_id, term, academic_year, assessment_type, score, max_score, remarks } = grade;

      // Validation
      if (!student_id || !subject_id || !term || !academic_year || !assessment_type || score === undefined || !max_score) {
        return res.status(400).json({ success: false, message: 'All required fields must be provided for each grade' });
      }

      if (score < 0 || score > max_score) {
        return res.status(400).json({ success: false, message: 'Score must be between 0 and max_score' });
      }

      // Check teacher access if applicable
      if (role === 'teacher') {
        const student = await db('students').select('class_id').where('id', student_id).first();
        if (!student) {
          return res.status(404).json({ success: false, message: `Student with ID ${student_id} not found` });
        }

        const hasAccess = await db('teacher_class_assignments')
          .where({ teacher_id: userId, class_id: student.class_id })
          .first();

        if (!hasAccess) {
          return res.status(403).json({ success: false, message: `Access denied to student ${student_id}` });
        }
      }

      processedGrades.push({
        student_id,
        subject_id,
        term,
        academic_year,
        assessment_type,
        score,
        max_score,
        remarks: remarks || null,
        updated_at: db.fn.now()
      });
    }

    // Process grades - update existing or insert new ones
    const results = [];
    for (const gradeData of processedGrades) {
      const existingGrade = await db('grades')
        .where({
          student_id: gradeData.student_id,
          subject_id: gradeData.subject_id,
          term: gradeData.term,
          academic_year: gradeData.academic_year,
          assessment_type: gradeData.assessment_type
        })
        .first();

      if (existingGrade) {
        // Update existing grade
        await db('grades')
          .where('id', existingGrade.id)
          .update(gradeData);
        results.push({ id: existingGrade.id, action: 'updated', ...gradeData });
      } else {
        // Insert new grade
        gradeData.created_at = db.fn.now();
        const [gradeId] = await db('grades').insert(gradeData);
        results.push({ id: gradeId, action: 'created', ...gradeData });
      }
    }

    res.json({
      success: true,
      message: `${results.length} grades processed successfully`,
      data: results
    });
  } catch (error) {
    console.error('Error batch updating grades:', error);
    res.status(500).json({ success: false, message: 'Error batch updating grades' });
  }
});

module.exports = router;


