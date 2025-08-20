const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

router.use(protect);

// Get academic report for a student
router.get('/academic/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { term, academic_year } = req.query;
    const { role, id: userId } = req.user;

    // Verify student exists and teacher has access
    const student = await db('students')
      .select('students.*', 'classes.name as class_name')
      .join('classes', 'students.class_id', 'classes.id')
      .where('students.id', studentId)
      .first();

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (role === 'teacher') {
      const hasAccess = await db('teacher_class_assignments')
        .where({ teacher_id: userId, class_id: student.class_id })
        .first();

      if (!hasAccess) {
        return res.status(403).json({ success: false, message: 'Access denied to this student' });
      }
    }

    // Build grades query
    let gradesQuery = db('grades')
      .select('grades.*', 'subjects.name as subject_name', 'subjects.code as subject_code')
      .join('subjects', 'grades.subject_id', 'subjects.id')
      .where('grades.student_id', studentId);

    if (term) gradesQuery = gradesQuery.where('grades.term', term);
    if (academic_year) gradesQuery = gradesQuery.where('grades.academic_year', academic_year);

    const grades = await gradesQuery.orderBy('subjects.name').orderBy('grades.assessment_type');

    // Calculate subject averages (60% exam + 40% continuous assessment)
    const subjectGrades = {};
    grades.forEach(grade => {
      const key = `${grade.subject_id}-${grade.term}-${grade.academic_year}`;
      if (!subjectGrades[key]) {
        subjectGrades[key] = {
          subject_id: grade.subject_id,
          subject_name: grade.subject_name,
          subject_code: grade.subject_code,
          term: grade.term,
          academic_year: grade.academic_year,
          exam_score: 0,
          exam_max: 0,
          ca_score: 0,
          ca_max: 0,
          ca_count: 0
        };
      }

      if (grade.assessment_type === 'exam') {
        subjectGrades[key].exam_score = grade.score;
        subjectGrades[key].exam_max = grade.max_score;
      } else {
        subjectGrades[key].ca_score += grade.score;
        subjectGrades[key].ca_max += grade.max_score;
        subjectGrades[key].ca_count++;
      }
    });

    // Calculate final scores and grades
    const reportCard = Object.values(subjectGrades).map(subject => {
      const examPercentage = subject.exam_max > 0 ? (subject.exam_score / subject.exam_max) * 100 : 0;
      const caPercentage = subject.ca_max > 0 ? (subject.ca_score / subject.ca_max) * 100 : 0;
      
      const finalScore = (examPercentage * 0.6) + (caPercentage * 0.4);
      
      let letterGrade = 'F';
      let remarks = 'Poor';
      
      if (finalScore >= 80) { letterGrade = 'A'; remarks = 'Excellent'; }
      else if (finalScore >= 70) { letterGrade = 'B'; remarks = 'Very Good'; }
      else if (finalScore >= 60) { letterGrade = 'C'; remarks = 'Good'; }
      else if (finalScore >= 50) { letterGrade = 'D'; remarks = 'Fair'; }
      else if (finalScore >= 40) { letterGrade = 'E'; remarks = 'Pass'; }

      return {
        ...subject,
        exam_percentage: Math.round(examPercentage * 100) / 100,
        ca_percentage: Math.round(caPercentage * 100) / 100,
        final_score: Math.round(finalScore * 100) / 100,
        letter_grade: letterGrade,
        remarks
      };
    });

    // Calculate overall average
    const totalScore = reportCard.reduce((sum, subject) => sum + subject.final_score, 0);
    const overallAverage = reportCard.length > 0 ? totalScore / reportCard.length : 0;

    // Class statistics (optional)
    const classStats = await db('students')
      .select(db.raw('COUNT(*) as total_students'))
      .where('class_id', student.class_id)
      .first();

    const report = {
      student: {
        id: student.id,
        name: student.name,
        class: student.class_name,
        admission_number: student.admission_number
      },
      academic_info: {
        term: term || 'All Terms',
        academic_year: academic_year || 'All Years'
      },
      subjects: reportCard,
      summary: {
        total_subjects: reportCard.length,
        overall_average: Math.round(overallAverage * 100) / 100,
        class_size: classStats.total_students
      },
      generated_at: new Date().toISOString(),
      generated_by: req.user.name
    };

    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Error generating academic report:', error);
    res.status(500).json({ success: false, message: 'Error generating report' });
  }
});

// Get class report (all students in a class)
router.get('/class/:classId', async (req, res) => {
  try {
    const { classId } = req.params;
    const { term, academic_year } = req.query;
    const { role, id: userId } = req.user;

    // Check access for teachers
    if (role === 'teacher') {
      const hasAccess = await db('teacher_class_assignments')
        .where({ teacher_id: userId, class_id: classId })
        .first();

      if (!hasAccess) {
        return res.status(403).json({ success: false, message: 'Access denied to this class' });
      }
    }

    // Get class info
    const classInfo = await db('classes').where('id', classId).first();
    if (!classInfo) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    // Get all students in the class
    const students = await db('students')
      .where('class_id', classId)
      .where('status', 'active')
      .orderBy('name');

    const classReport = {
      class: classInfo,
      term: term || 'All Terms',
      academic_year: academic_year || 'All Years',
      students: [],
      generated_at: new Date().toISOString(),
      generated_by: req.user.name
    };

    // Generate mini report for each student
    for (const student of students) {
      let gradesQuery = db('grades')
        .select('grades.*', 'subjects.name as subject_name')
        .join('subjects', 'grades.subject_id', 'subjects.id')
        .where('grades.student_id', student.id);

      if (term) gradesQuery = gradesQuery.where('grades.term', term);
      if (academic_year) gradesQuery = gradesQuery.where('grades.academic_year', academic_year);

      const grades = await gradesQuery;

      // Calculate average for this student
      const subjectAverages = {};
      grades.forEach(grade => {
        const key = `${grade.subject_id}`;
        if (!subjectAverages[key]) {
          subjectAverages[key] = { exam: 0, ca: 0, ca_count: 0, exam_max: 0, ca_max: 0 };
        }

        if (grade.assessment_type === 'exam') {
          subjectAverages[key].exam = grade.max_score > 0 ? (grade.score / grade.max_score) * 100 : 0;
        } else {
          subjectAverages[key].ca += grade.max_score > 0 ? (grade.score / grade.max_score) * 100 : 0;
          subjectAverages[key].ca_count++;
        }
      });

      const finalAverages = Object.values(subjectAverages).map(subject => {
        const caAvg = subject.ca_count > 0 ? subject.ca / subject.ca_count : 0;
        return (subject.exam * 0.6) + (caAvg * 0.4);
      });

      const overallAverage = finalAverages.length > 0 ? 
        finalAverages.reduce((sum, avg) => sum + avg, 0) / finalAverages.length : 0;

      classReport.students.push({
        id: student.id,
        name: student.name,
        admission_number: student.admission_number,
        subjects_count: finalAverages.length,
        overall_average: Math.round(overallAverage * 100) / 100
      });
    }

    // Sort students by average (highest first)
    classReport.students.sort((a, b) => b.overall_average - a.overall_average);

    res.json({ success: true, data: classReport });
  } catch (error) {
    console.error('Error generating class report:', error);
    res.status(500).json({ success: false, message: 'Error generating class report' });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, report: 'Reports endpoint is alive' });
});

module.exports = router;


