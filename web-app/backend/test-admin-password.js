// Test admin password - 2025-08-21
const db = require('./config/database');
const bcrypt = require('bcryptjs');

async function testAdminPassword() {
  try {
    console.log('🔍 Testing admin password...');
    
    // Get admin user
    const adminUser = await db('users')
      .where('email', 'admin@fredora.com')
      .first();
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:');
    console.log(`   Username: ${adminUser.username}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Password hash: ${adminUser.password_hash ? 'Present' : 'Missing'}`);
    
    if (adminUser.password_hash) {
      // Test password
      const isValid = await bcrypt.compare('admin123', adminUser.password_hash);
      console.log(`   Password 'admin123' is valid: ${isValid}`);
      
      if (!isValid) {
        console.log('   Testing other common passwords...');
        const testPasswords = ['admin', 'password', '123456', 'admin1234'];
        for (const testPass of testPasswords) {
          const isValid = await bcrypt.compare(testPass, adminUser.password_hash);
          if (isValid) {
            console.log(`   Found valid password: '${testPass}'`);
            break;
          }
        }
      }
    } else {
      console.log('❌ No password hash found');
    }
    
    await db.destroy();
    
  } catch (error) {
    console.error('❌ Error testing admin password:', error.message);
  }
}

testAdminPassword();
