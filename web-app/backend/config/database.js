// Production database configuration with environment variables
const knex = require('knex');
require('dotenv').config();

// Database configuration
const dbConfig = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'aws-1-eu-north-1.pooler.supabase.com',
    port: process.env.DB_PORT || 6543,
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres.olfaiomhrywwgvrmghzg',
    password: process.env.DB_PASSWORD || 'Thinker6A$',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  },
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100
  },
  debug: process.env.NODE_ENV === 'development'
};

// Create database connection
const db = knex(dbConfig);

// Test database connection
db.raw('SELECT 1')
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  });

module.exports = db;