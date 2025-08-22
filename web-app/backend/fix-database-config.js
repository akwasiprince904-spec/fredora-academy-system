// Fix database configuration
const knex = require('knex');

// Direct production configuration
const db = knex({
  client: 'pg',
  connection: 'postgresql://postgres.olfaiomhrywwgvrmghzg:Thinker6A$@aws-1-eu-north-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false },
  pool: {
    min: 2,
    max: 10
  }
});

module.exports = db;