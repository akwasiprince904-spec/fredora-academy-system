exports.up = function(knex) {
  return knex.schema.raw(`
    -- Add indexes for better query performance
    
    -- Users table indexes
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
    
    -- Teacher class assignments indexes
    CREATE INDEX IF NOT EXISTS idx_teacher_class_assignments_teacher_id ON teacher_class_assignments(teacher_id);
    CREATE INDEX IF NOT EXISTS idx_teacher_class_assignments_class_id ON teacher_class_assignments(class_id);
    CREATE INDEX IF NOT EXISTS idx_teacher_class_assignments_teacher_class ON teacher_class_assignments(teacher_id, class_id);
    
    -- Classes table indexes
    CREATE INDEX IF NOT EXISTS idx_classes_level ON classes(level);
    CREATE INDEX IF NOT EXISTS idx_classes_name ON classes(name);
    
    -- Students table indexes
    CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
    CREATE INDEX IF NOT EXISTS idx_students_is_active ON students(is_active);
    
    -- Subjects table indexes
    CREATE INDEX IF NOT EXISTS idx_subjects_is_core ON subjects(is_core);
    CREATE INDEX IF NOT EXISTS idx_subjects_is_active ON subjects(is_active);
    
    -- Grades table indexes
    CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades(student_id);
    CREATE INDEX IF NOT EXISTS idx_grades_subject_id ON grades(subject_id);
    CREATE INDEX IF NOT EXISTS idx_grades_class_id ON grades(class_id);
  `);
};

exports.down = function(knex) {
  return knex.schema.raw(`
    -- Remove performance indexes
    
    DROP INDEX IF EXISTS idx_users_role;
    DROP INDEX IF EXISTS idx_users_username;
    DROP INDEX IF EXISTS idx_users_email;
    DROP INDEX IF EXISTS idx_users_is_active;
    
    DROP INDEX IF EXISTS idx_teacher_class_assignments_teacher_id;
    DROP INDEX IF EXISTS idx_teacher_class_assignments_class_id;
    DROP INDEX IF EXISTS idx_teacher_class_assignments_teacher_class;
    
    DROP INDEX IF EXISTS idx_classes_level;
    DROP INDEX IF EXISTS idx_classes_name;
    
    DROP INDEX IF EXISTS idx_students_class_id;
    DROP INDEX IF EXISTS idx_students_is_active;
    
    DROP INDEX IF EXISTS idx_subjects_is_core;
    DROP INDEX IF EXISTS idx_subjects_is_active;
    
    DROP INDEX IF EXISTS idx_grades_student_id;
    DROP INDEX IF EXISTS idx_grades_subject_id;
    DROP INDEX IF EXISTS idx_grades_class_id;
  `);
};
