exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments('id').primary();
    table.string('username', 50).unique().notNullable();
    table.string('email', 100).unique().notNullable();
    table.string('password_hash', 255).notNullable();
    table.string('name', 100).notNullable();
    // Use Knex enu which becomes TEXT + CHECK on SQLite
    table.enu('role', ['admin', 'teacher']).defaultTo('teacher');
    table.string('phone', 20);
    table.text('address');
    table.string('profile_photo', 255);
    table.boolean('is_active').defaultTo(true);
    table.timestamp('last_login');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['username']);
    table.index(['email']);
    table.index(['role']);
    table.index(['is_active']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
