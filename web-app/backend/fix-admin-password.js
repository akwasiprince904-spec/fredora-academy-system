require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Client } = require('pg');

async function fixAdminPassword() {
  const client = new Client({
    connectionString: 'postgresql://postgres.olfaiomhrywwgvrmghzg:Thinker6A$@aws-1-eu-north-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔗 Connecting to Supabase database...');
    await client.connect();
    
    console.log('🔧 Fixing admin user password field...');
    
    // Hash the password 'admin123'
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Update the admin user to have password_hash instead of password
    await client.query(`
      UPDATE users 
      SET password_hash = $1, password = NULL
      WHERE email = 'admin@fredora.com'
    `, [hashedPassword]);
    
    console.log('✅ Admin user password field fixed!');
    console.log('Username: admin@fredora.com');
    console.log('Password: admin123');
    console.log('Field: password_hash (now correct)');
    
    // Verify the fix
    const adminUser = await client.query("SELECT * FROM users WHERE email = 'admin@fredora.com'");
    const admin = adminUser.rows[0];
    console.log(`\n✅ Verification:`);
    console.log(`   - Has password_hash: ${admin.password_hash ? 'Yes' : 'No'}`);
    console.log(`   - Has password: ${admin.password ? 'Yes' : 'No'}`);
    
  } catch (error) {
    console.error('❌ Error fixing admin password:', error.message);
  } finally {
    await client.end();
  }
}

fixAdminPassword();