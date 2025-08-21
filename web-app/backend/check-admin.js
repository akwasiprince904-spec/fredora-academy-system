const knex = require('knex');
const path = require('path');
const bcrypt = require('bcryptjs');

// Database configuration - FIXED PATH
const db = knex({
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, 'database.sqlite')
  },
  useNullAsDefault: true
});

async function checkAdminUser() {
  try {
    console.log('🔍 Checking admin user in database...\n');

    // Check if users table exists
    const tables = await db.raw("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
    if (tables.length === 0) {
      console.log('❌ Users table does not exist!');
      return;
    }
    console.log('✅ Users table exists');

    // Get all users
    const users = await db('users').select('*');
    console.log(`📊 Found ${users.length} users in database:`);
    
    users.forEach(user => {
      console.log(`   - ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role}, Active: ${user.is_active}`);
    });

    // Check for admin user specifically
    const adminUser = await db('users')
      .where('username', 'admin')
      .orWhere('email', 'admin@fredora.com')
      .first();

    if (adminUser) {
      console.log('\n✅ Admin user found:');
      console.log(`   - ID: ${adminUser.id}`);
      console.log(`   - Username: ${adminUser.username}`);
      console.log(`   - Email: ${adminUser.email}`);
      console.log(`   - Role: ${adminUser.role}`);
      console.log(`   - Active: ${adminUser.is_active}`);
      console.log(`   - Has password: ${adminUser.password_hash ? 'Yes' : 'No'}`);

      // Test password
      if (adminUser.password_hash) {
        const isValidPassword = await bcrypt.compare('admin123', adminUser.password_hash);
        console.log(`   - Password 'admin123' is valid: ${isValidPassword}`);
        
        if (!isValidPassword) {
          console.log('   - Testing other common passwords...');
          const testPasswords = ['admin', 'password', '123456', 'admin1234'];
          for (const testPass of testPasswords) {
            const isValid = await bcrypt.compare(testPass, adminUser.password_hash);
            if (isValid) {
              console.log(`   - Found valid password: '${testPass}'`);
              break;
            }
          }
        }
      }
    } else {
      console.log('\n❌ Admin user not found!');
      console.log('Creating admin user...');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const [adminId] = await db('users').insert({
        username: 'admin',
        email: 'admin@fredora.com',
        name: 'Administrator',
        password_hash: hashedPassword,
        role: 'admin',
        is_active: true,
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      });
      
      console.log(`✅ Admin user created with ID: ${adminId}`);
    }

    // Check if there are any users with admin role
    const adminUsers = await db('users').where('role', 'admin');
    console.log(`\n   Found ${adminUsers.length} admin users:`);
    adminUsers.forEach(user => {
      console.log(`   - ${user.username} (${user.email})`);
    });

  } catch (error) {
    console.error('❌ Error checking admin user:', error);
  } finally {
    await db.destroy();
  }
}

checkAdminUser();