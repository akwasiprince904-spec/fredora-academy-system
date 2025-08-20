exports.up = function (knex) {
  return knex.schema.createTable('teacher_subject_assignments', (t) => {
    t.increments('id').primary();
    t.integer('teacher_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    t.integer('subject_id').unsigned().notNullable()
      .references('id').inTable('subjects').onDelete('CASCADE');
    t.integer('class_id').unsigned().notNullable()
      .references('id').inTable('classes').onDelete('CASCADE');
    t.boolean('is_active').defaultTo(true).notNullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes
    t.index(['teacher_id']);
    t.index(['subject_id']);
    t.index(['class_id']);
    t.index(['is_active']);
    
    // Unique constraint to prevent duplicate assignments
    t.unique(['teacher_id', 'subject_id', 'class_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('teacher_subject_assignments');
};
