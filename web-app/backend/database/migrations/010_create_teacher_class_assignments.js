exports.up = function (knex) {
  return knex.schema.createTable('teacher_class_assignments', (t) => {
    t.increments('id').primary();
    t.integer('teacher_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    t.integer('class_id').unsigned().notNullable()
      .references('id').inTable('classes').onDelete('CASCADE');
    t.unique(['teacher_id', 'class_id']);
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('teacher_class_assignments');
};