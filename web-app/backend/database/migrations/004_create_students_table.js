exports.up = function(knex) {
  return knex.schema.createTable('students', function(table) {
    table.increments('id').primary();
    table.string('student_id', 20).unique().notNullable(); // FA[YEAR][SEQUENTIAL_NUMBER]
    table.string('first_name', 50).notNullable();
    table.string('last_name', 50).notNullable();
    table.string('middle_name', 50);
    table.date('date_of_birth').notNullable();
    // Use Knex enu which becomes TEXT + CHECK on SQLite
    table.enu('gender', ['male', 'female']).notNullable();
    table.integer('class_id').unsigned().references('id').inTable('classes').onDelete('CASCADE');
    table.date('enrollment_date').notNullable();
    table.string('photo', 255);
    table.text('address');
    table.string('phone', 20);
    table.string('email', 100);
    
    // Parent/Guardian Information
    table.string('parent_name', 100).notNullable();
    table.string('parent_phone', 20).notNullable();
    table.string('parent_email', 100);
    table.string('parent_occupation', 100);
    table.text('parent_address');
    table.string('emergency_contact_name', 100);
    table.string('emergency_contact_phone', 20);
    table.string('emergency_contact_relationship', 50);
    
    // Medical Information
    table.text('medical_conditions');
    table.text('allergies');
    table.text('medications');
    table.string('blood_group', 10);
    table.text('special_needs');
    
    // Academic Information
    table.string('previous_school', 200);
    table.text('previous_academic_record');
    table.decimal('admission_score', 5, 2);
    
    // Status
    table.enu('status', ['active', 'inactive', 'graduated', 'transferred']).defaultTo('active');
    table.text('notes');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['student_id']);
    table.index(['first_name', 'last_name']);
    table.index(['class_id']);
    table.index(['status']);
    table.index(['enrollment_date']);
    table.index(['parent_phone']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('students');
};



