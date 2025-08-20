exports.up = function(knex) {
  return knex.schema.createTable('fees', function(table) {
    table.increments('id').primary();
    table.integer('class_id').unsigned().references('id').inTable('classes').onDelete('CASCADE');
    table.string('fee_type', 100).notNullable(); // Tuition, Library, Sports, etc.
    table.decimal('amount', 10, 2).notNullable();
    // Use Knex enu which becomes TEXT + CHECK on SQLite
    table.enu('frequency', ['monthly', 'termly', 'yearly', 'one-time']).defaultTo('termly');
    table.text('description');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['class_id']);
    table.index(['fee_type']);
    table.index(['is_active']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('fees');
};
