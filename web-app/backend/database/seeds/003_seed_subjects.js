exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('subjects').del();

  // Inserts seed entries
  return knex('subjects').insert([
    {
      name: 'English Language',
      code: 'ENG',
      description: 'English Language and Literature',
      is_core: true,
      is_active: true
    },
    {
      name: 'Mathematics',
      code: 'MATH',
      description: 'Mathematics and Problem Solving',
      is_core: true,
      is_active: true
    },
    {
      name: 'Integrated Science',
      code: 'SCI',
      description: 'General Science and Scientific Method',
      is_core: true,
      is_active: true
    },
    {
      name: 'Social Studies',
      code: 'SOC',
      description: 'History, Geography, and Citizenship',
      is_core: true,
      is_active: true
    },
    {
      name: 'Religious and Moral Education',
      code: 'RME',
      description: 'Religious Studies and Moral Values',
      is_core: true,
      is_active: true
    },
    {
      name: 'Creative Arts',
      code: 'ART',
      description: 'Visual Arts, Music, and Drama',
      is_core: false,
      is_active: true
    },
    {
      name: 'Physical Education',
      code: 'PE',
      description: 'Physical Education and Sports',
      is_core: false,
      is_active: true
    },
    {
      name: 'French',
      code: 'FRE',
      description: 'French Language and Culture',
      is_core: false,
      is_active: true
    },
    {
      name: 'Information and Communication Technology',
      code: 'ICT',
      description: 'Computer Science and Technology',
      is_core: false,
      is_active: true
    },
    {
      name: 'Home Economics',
      code: 'HOME',
      description: 'Home Economics and Life Skills',
      is_core: false,
      is_active: true
    },
    {
      name: 'Agricultural Science',
      code: 'AGRIC',
      description: 'Agriculture and Farming',
      is_core: false,
      is_active: true
    },
    {
      name: 'Pre-Technical Skills',
      code: 'PTS',
      description: 'Technical and Vocational Skills',
      is_core: false,
      is_active: true
    }
  ]);
};
