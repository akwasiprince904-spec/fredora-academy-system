// Test database connection - 2025-08-21
const db = require('./config/database');

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const result = await db.raw('SELECT NOW() as current_time');
    console.log('✅ Database connection successful!');
    console.log('   Current time:', result.rows[0].current_time);
    
    // Test if users table exists
    const tables = await db.raw(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
    `);
    
    if (tables.rows.length > 0) {
      console.log('✅ Users table exists');
      
      // Count users
      const userCount = await db('users').count('* as count');
      console.log(`   Total users: ${userCount[0].count}`);
    } else {
      console.log('❌ Users table does not exist');
    }
    
    await db.destroy();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('   This usually means the database server is not accessible');
    } else if (error.code === 'ENOTFOUND') {
      console.log('   This usually means the database host cannot be resolved');
    }
  }
}

testConnection();
