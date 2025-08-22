exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('settings').del();

  // Inserts seed entries
  return knex('settings').insert([
    {
      key: 'school_name',
      value: 'Fredora\'s Academy',
      type: 'string',
      description: 'Name of the school',
      is_public: true
    },
    {
      key: 'school_address',
      value: 'Accra, Ghana',
      type: 'string',
      description: 'School address',
      is_public: true
    },
    {
      key: 'school_phone',
      value: '+233 24 123 4567',
      type: 'string',
      description: 'School phone number',
      is_public: true
    },
    {
      key: 'school_email',
      value: 'info@fredora.com',
      type: 'string',
      description: 'School email address',
      is_public: true
    },
    {
      key: 'academic_year',
      value: '2024',
      type: 'number',
      description: 'Current academic year',
      is_public: true
    },
    {
      key: 'current_term',
      value: 'First Term',
      type: 'string',
      description: 'Current academic term',
      is_public: true
    },
    {
      key: 'exam_weight',
      value: '60',
      type: 'number',
      description: 'Weight percentage for final exams',
      is_public: false
    },
    {
      key: 'ca_weight',
      value: '40',
      type: 'number',
      description: 'Weight percentage for continuous assessment',
      is_public: false
    },
    {
      key: 'attendance_threshold',
      value: '75',
      type: 'number',
      description: 'Minimum attendance percentage required',
      is_public: false
    },
    {
      key: 'late_threshold_minutes',
      value: '15',
      type: 'number',
      description: 'Minutes after which a student is considered late',
      is_public: false
    },
    {
      key: 'currency',
      value: 'GHS',
      type: 'string',
      description: 'School currency',
      is_public: true
    },
    {
      key: 'timezone',
      value: 'Africa/Accra',
      type: 'string',
      description: 'School timezone',
      is_public: false
    },
    {
      key: 'system_theme',
      value: JSON.stringify({
        primary: '#722F37',
        secondary: '#FFFFFF',
        accent: '#8B3D47'
      }),
      type: 'json',
      description: 'System theme colors',
      is_public: false
    }
  ]);
};














