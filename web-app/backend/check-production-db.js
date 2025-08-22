// Check production database status - 2025-08-21
const db = require('./config/database');

async function checkProductionDB() {
  try {
    console.log('🔍 Checking production database...');
    
    // Test basic connection
    const result = await db.raw('SELECT NOW() as current_time');
    console.log('✅ Database connection successful!');
    console.log('   Current time:', result.rows[0].current_time);
    
    // Check if users table exists
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
      
      // Check admin user specifically
      const adminUser = await db('users')
        .where('email', 'admin@fredora.com')
        .orWhere('username', 'admin')
        .first();
      
      if (adminUser) {
        console.log('✅ Admin user found:');
        console.log(`   ID: ${adminUser.id}`);
        console.log(`   Username: ${adminUser.username}`);
        console.log(`   Email: ${adminUser.email}`);
        console.log(`   Role: ${adminUser.role}`);
        console.log(`   Active: ${adminUser.is_active}`);
        console.log(`   Has password_hash: ${!!adminUser.password_hash}`);
        console.log(`   Has password: ${!!adminUser.password}`);
      } else {
        console.log('❌ Admin user not found!');
        
        // List all users
        const allUsers = await db('users').select('id', 'username', 'email', 'role');
        console.log('   Available users:');
        allUsers.forEach(user => {
          console.log(`     - ${user.username} (${user.email}) - ${user.role}`);
        });
      }
    } else {
      console.log('❌ Users table does not exist');
      
      // List all tables
      const allTables = await db.raw(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      console.log('   Available tables:');
      allTables.rows.forEach(table => {
        console.log(`     - ${table.table_name}`);
      });
    }
    
    await db.destroy();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    console.error('   Full error:', error);
  }
}

checkProductionDB();
