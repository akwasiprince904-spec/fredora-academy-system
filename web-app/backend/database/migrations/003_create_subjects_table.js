exports.up = function (knex) {
  return knex.schema.createTable('subjects', (t) => {
    t.increments('id').primary();
    t.string('name').notNullable();
    t.string('code').notNullable().unique();
    t.text('description');
    t.boolean('is_core').defaultTo(false).notNullable();
    t.boolean('is_active').defaultTo(true).notNullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes
    t.index(['name']);
    t.index(['code']);
    t.index(['is_core']);
    t.index(['is_active']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('subjects');
};
