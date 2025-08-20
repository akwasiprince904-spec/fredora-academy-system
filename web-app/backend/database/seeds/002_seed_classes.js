exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('classes').del();

  // Inserts seed entries
  return knex('classes').insert([
    {
      name: 'Creche',
      display_name: 'Creche',
      level: 1,
      description: 'Early childhood development for ages 2-3',
      max_students: 20,
      is_active: true
    },
    {
      name: 'KG1',
      display_name: 'Kindergarten 1',
      level: 2,
      description: 'Kindergarten 1 for ages 3-4',
      max_students: 25,
      is_active: true
    },
    {
      name: 'KG2',
      display_name: 'Kindergarten 2',
      level: 3,
      description: 'Kindergarten 2 for ages 4-5',
      max_students: 25,
      is_active: true
    },
    {
      name: 'Grade 1',
      display_name: 'Grade 1',
      level: 4,
      description: 'Primary 1 for ages 5-6',
      max_students: 30,
      is_active: true
    },
    {
      name: 'Grade 2',
      display_name: 'Grade 2',
      level: 5,
      description: 'Primary 2 for ages 6-7',
      max_students: 30,
      is_active: true
    },
    {
      name: 'Grade 3',
      display_name: 'Grade 3',
      level: 6,
      description: 'Primary 3 for ages 7-8',
      max_students: 30,
      is_active: true
    },
    {
      name: 'Grade 4',
      display_name: 'Grade 4',
      level: 7,
      description: 'Primary 4 for ages 8-9',
      max_students: 30,
      is_active: true
    },
    {
      name: 'Grade 5',
      display_name: 'Grade 5',
      level: 8,
      description: 'Primary 5 for ages 9-10',
      max_students: 30,
      is_active: true
    },
    {
      name: 'Grade 6',
      display_name: 'Grade 6',
      level: 9,
      description: 'Primary 6 for ages 10-11',
      max_students: 30,
      is_active: true
    },
    {
      name: 'JHS 1',
      display_name: 'Junior High School 1',
      level: 10,
      description: 'Junior High School 1 for ages 11-12',
      max_students: 35,
      is_active: true
    },
    {
      name: 'JHS 2',
      display_name: 'Junior High School 2',
      level: 11,
      description: 'Junior High School 2 for ages 12-13',
      max_students: 35,
      is_active: true
    },
    {
      name: 'JHS 3',
      display_name: 'Junior High School 3',
      level: 12,
      description: 'Junior High School 3 for ages 13-14',
      max_students: 35,
      is_active: true
    }
  ]);
};
