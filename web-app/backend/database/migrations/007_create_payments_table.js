exports.up = function(knex) {
  return knex.schema.createTable('payments', function(table) {
    table.increments('id').primary();
    table.integer('student_id').unsigned().references('id').inTable('students').onDelete('CASCADE');
    table.integer('fee_id').unsigned().references('id').inTable('fees').onDelete('CASCADE');
    table.decimal('amount_paid', 10, 2).notNullable();
    table.decimal('amount_due', 10, 2).notNullable();
    // Use Knex enu which becomes TEXT + CHECK on SQLite
    table.enu('payment_method', ['cash', 'bank_transfer', 'mobile_money', 'check', 'card']).defaultTo('cash');
    table.string('reference_number', 100);
    table.string('receipt_number', 100);
    table.enu('status', ['pending', 'completed', 'failed', 'refunded']).defaultTo('completed');
    table.date('payment_date').notNullable();
    table.string('term', 20); // First Term, Second Term, Third Term
    table.integer('academic_year').notNullable();
    table.text('notes');
    table.integer('recorded_by').unsigned().references('id').inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['student_id']);
    table.index(['fee_id']);
    table.index(['payment_date']);
    table.index(['status']);
    table.index(['term', 'academic_year']);
    table.index(['reference_number']);
    table.index(['receipt_number']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('payments');
};
