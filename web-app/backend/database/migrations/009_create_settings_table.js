exports.up = function(knex) {
  return knex.schema.createTable('settings', function(table) {
    table.increments('id').primary();
    table.string('key', 100).unique().notNullable();
    table.text('value');
    table.string('type', 50).defaultTo('string'); // string, number, boolean, json
    table.text('description');
    table.boolean('is_public').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['key']);
    table.index(['type']);
    table.index(['is_public']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('settings');
};
