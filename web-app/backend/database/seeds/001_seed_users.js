const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del();

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const teacherPassword = await bcrypt.hash('teacher123', 10);

  // Inserts seed entries
  return knex('users').insert([
    {
      username: 'admin',
      email: 'admin@fredora.com',
      password_hash: adminPassword,
      name: 'Administrator',
      role: 'admin',
      phone: '+233 24 123 4567',
      address: 'Accra, Ghana',
      is_active: true
    },
    {
      username: 'teacher1',
      email: 'teacher@fredora.com',
      password_hash: teacherPassword,
      name: 'Mrs. Sarah Addo',
      role: 'teacher',
      phone: '+233 20 987 6543',
      address: 'Kumasi, Ghana',
      is_active: true
    },
    {
      username: 'teacher2',
      email: 'teacher2@fredora.com',
      password_hash: teacherPassword,
      name: 'Mr. Kwame Mensah',
      role: 'teacher',
      phone: '+233 26 555 1234',
      address: 'Tema, Ghana',
      is_active: true
    }
  ]);
};
