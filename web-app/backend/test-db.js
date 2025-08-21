require('dotenv').config();

console.log('🔍 Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL);

const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('\n🔗 Testing database connection...');
    await client.connect();
    console.log('✅ Connected to database successfully!');
    
    const result = await client.query('SELECT current_database(), current_user');
    console.log('Database:', result.rows[0].current_database);
    console.log('User:', result.rows[0].current_user);
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await client.end();
  }
}

testConnection();