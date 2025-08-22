const db = require('../config/database');

// Generate unique student ID (FA[YEAR][SEQUENTIAL_NUMBER])
const generateStudentId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `FA${currentYear}`;
  
  // Get the last student ID for this year
  const lastStudent = await db('students')
    .where('student_id', 'like', `${prefix}%`)
    .orderBy('student_id', 'desc')
    .first();
  
  let sequence = 1;
  if (lastStudent) {
    const lastSequence = parseInt(lastStudent.student_id.replace(prefix, ''));
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${String(sequence).padStart(3, '0')}`;
};

// Validate student age
const validateStudentAge = (dateOfBirth) => {
  const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
  return age >= 2 && age <= 18;
};

// Calculate student age
const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Format student name
const formatStudentName = (firstName, lastName) => {
  return `${firstName} ${lastName}`.trim();
};

// Validate Ghanaian phone number
const validateGhanaianPhone = (phone) => {
  const phoneRegex = /^\+233\s?\d{2}\s?\d{3}\s?\d{4}$/;
  return phoneRegex.test(phone);
};

// Format Ghanaian phone number
const formatGhanaianPhone = (phone) => {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // If it starts with 0, replace with +233
  if (cleaned.startsWith('0')) {
    return '+233' + cleaned.substring(1);
  }
  
  // If it starts with 233, add +
  if (cleaned.startsWith('233')) {
    return '+' + cleaned;
  }
  
  // If it already has +233, return as is
  if (cleaned.startsWith('+233')) {
    return cleaned;
  }
  
  // If it's a 9-digit number, assume it's a Ghanaian number
  if (cleaned.length === 9) {
    return '+233' + cleaned;
  }
  
  return phone; // Return original if can't format
};

// Get student class progression
const getStudentClassProgression = (currentClass) => {
  const classLevels = {
    'Creche': 1,
    'KG1': 2,
    'KG2': 3,
    'Grade 1': 4,
    'Grade 2': 5,
    'Grade 3': 6,
    'Grade 4': 7,
    'Grade 5': 8,
    'Grade 6': 9,
    'JHS 1': 10,
    'JHS 2': 11,
    'JHS 3': 12
  };
  
  return classLevels[currentClass] || 0;
};

// Check if student can be promoted
const canPromoteStudent = (currentClass, academicPerformance) => {
  const classLevel = getStudentClassProgression(currentClass);
  
  // Can't promote beyond JHS 3
  if (classLevel >= 12) {
    return false;
  }
  
  // Check academic performance (simplified logic)
  // In a real system, this would check grades, attendance, etc.
  return academicPerformance >= 50; // Minimum 50% performance
};

// Get next class for promotion
const getNextClass = (currentClass) => {
  const classProgression = {
    'Creche': 'KG1',
    'KG1': 'KG2',
    'KG2': 'Grade 1',
    'Grade 1': 'Grade 2',
    'Grade 2': 'Grade 3',
    'Grade 3': 'Grade 4',
    'Grade 4': 'Grade 5',
    'Grade 5': 'Grade 6',
    'Grade 6': 'JHS 1',
    'JHS 1': 'JHS 2',
    'JHS 2': 'JHS 3',
    'JHS 3': null // No promotion beyond JHS 3
  };
  
  return classProgression[currentClass] || null;
};

// Calculate fee balance
const calculateFeeBalance = async (studentId) => {
  try {
    const student = await db('students')
      .select('fee_balance')
      .where('student_id', studentId)
      .first();
    
    return student ? parseFloat(student.fee_balance) : 0;
  } catch (error) {
    console.error('Error calculating fee balance:', error);
    return 0;
  }
};

// Update fee balance
const updateFeeBalance = async (studentId, amount) => {
  try {
    await db('students')
      .where('student_id', studentId)
      .update({
        fee_balance: db.raw(`fee_balance + ${amount}`),
        updated_at: db.fn.now()
      });
    
    return true;
  } catch (error) {
    console.error('Error updating fee balance:', error);
    return false;
  }
};

// Get student attendance statistics
const getStudentAttendanceStats = async (studentId, startDate, endDate) => {
  try {
    const stats = await db('attendance')
      .select(
        db.raw('COUNT(*) as total_days'),
        db.raw('COUNT(CASE WHEN status = "present" THEN 1 END) as present_days'),
        db.raw('COUNT(CASE WHEN status = "absent" THEN 1 END) as absent_days'),
        db.raw('COUNT(CASE WHEN status = "late" THEN 1 END) as late_days'),
        db.raw('COUNT(CASE WHEN status = "excused" THEN 1 END) as excused_days')
      )
      .where('student_id', studentId)
      .whereBetween('date', [startDate, endDate])
      .first();
    
    if (stats.total_days > 0) {
      stats.attendance_rate = Math.round((stats.present_days / stats.total_days) * 100);
    } else {
      stats.attendance_rate = 0;
    }
    
    return stats;
  } catch (error) {
    console.error('Error getting attendance stats:', error);
    return null;
  }
};

// Get student academic performance
const getStudentAcademicPerformance = async (studentId, term, academicYear) => {
  try {
    const grades = await db('grades')
      .select(
        'subjects.name as subject_name',
        'subjects.code as subject_code',
        db.raw('AVG(score) as average_score'),
        db.raw('COUNT(*) as assessment_count')
      )
      .join('subjects', 'grades.subject_id', 'subjects.id')
      .where('grades.student_id', studentId)
      .where('grades.term', term)
      .where('grades.academic_year', academicYear)
      .groupBy('subjects.id', 'subjects.name', 'subjects.code');
    
    const overallAverage = grades.length > 0 
      ? grades.reduce((sum, grade) => sum + parseFloat(grade.average_score), 0) / grades.length
      : 0;
    
    return {
      grades,
      overallAverage: Math.round(overallAverage * 100) / 100,
      totalSubjects: grades.length
    };
  } catch (error) {
    console.error('Error getting academic performance:', error);
    return null;
  }
};

module.exports = {
  generateStudentId,
  validateStudentAge,
  calculateAge,
  formatStudentName,
  validateGhanaianPhone,
  formatGhanaianPhone,
  getStudentClassProgression,
  canPromoteStudent,
  getNextClass,
  calculateFeeBalance,
  updateFeeBalance,
  getStudentAttendanceStats,
  getStudentAcademicPerformance
};














