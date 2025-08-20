exports.up = function(knex) {
  return knex.schema.createTable('classes', function(table) {
    table.increments('id').primary();
    table.string('name', 50).unique().notNullable(); // Creche, KG1, KG2, Grade 1-6, JHS 1-3
    table.string('display_name', 100).notNullable();
    table.integer('level').notNullable(); // Numeric level for sorting
    table.text('description');
    table.integer('max_students').defaultTo(30);
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['name']);
    table.index(['level']);
    table.index(['is_active']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('classes');
};
