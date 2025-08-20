exports.up = function(knex) {
  return knex.schema.createTable('grades', function(table) {
    table.increments('id').primary();
    table.integer('student_id').unsigned().references('id').inTable('students').onDelete('CASCADE');
    table.integer('subject_id').unsigned().references('id').inTable('subjects').onDelete('CASCADE');
    table.integer('class_id').unsigned().references('id').inTable('classes').onDelete('CASCADE');
    table.string('term', 20).notNullable(); // First Term, Second Term, Third Term
    table.integer('academic_year').notNullable();
    // Use Knex enu which becomes TEXT + CHECK on SQLite
    table.enu('assessment_type', ['exam', 'continuous_assessment', 'project', 'assignment']).notNullable();
    table.decimal('score', 5, 2).notNullable(); // Score out of 100
    table.decimal('weighted_score', 5, 2); // Weighted score based on assessment type
    table.string('grade_letter', 5); // A, B, C, D, F
    table.decimal('grade_point', 3, 2); // 4.0, 3.0, 2.0, 1.0, 0.0
    table.text('remarks');
    table.integer('recorded_by').unsigned().references('id').inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Composite unique constraint
    table.unique(['student_id', 'subject_id', 'term', 'academic_year', 'assessment_type']);
    
    // Indexes
    table.index(['student_id']);
    table.index(['subject_id']);
    table.index(['class_id']);
    table.index(['term', 'academic_year']);
    table.index(['assessment_type']);
    table.index(['recorded_by']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('grades');
};
