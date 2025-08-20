exports.up = function(knex) {
  return knex.schema.createTable('attendance', function(table) {
    table.increments('id').primary();
    table.integer('student_id').unsigned().references('id').inTable('students').onDelete('CASCADE');
    table.integer('class_id').unsigned().references('id').inTable('classes').onDelete('CASCADE');
    table.date('date').notNullable();
    // Use Knex enu which becomes TEXT + CHECK on SQLite
    table.enu('status', ['present', 'absent', 'late', 'excused']).defaultTo('present');
    table.time('time_in');
    table.time('time_out');
    table.text('remarks');
    table.integer('marked_by').unsigned().references('id').inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Composite unique constraint
    table.unique(['student_id', 'date']);
    
    // Indexes
    table.index(['student_id']);
    table.index(['class_id']);
    table.index(['date']);
    table.index(['status']);
    table.index(['marked_by']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('attendance');
};
