exports.seed = async function(knex) {
  // Delete existing assignments - teachers start with no classes assigned
  await knex('teacher_class_assignments').del();
  console.log('✓ Cleared all teacher class assignments - teachers start with no assigned classes');
};
