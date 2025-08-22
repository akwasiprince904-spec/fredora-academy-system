require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Client } = require('pg');

async function fixAdminPasswordFinal() {
  const client = new Client({
    connectionString: 'postgresql://postgres.olfaiomhrywwgvrmghzg:Thinker6A$@aws-1-eu-north-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔗 Connecting to Supabase database...');
    await client.connect();
    
    console.log('🔧 Updating admin user password_hash...');
    
    // Hash the password 'admin123'
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Update the admin user's password_hash
    await client.query(`
      UPDATE users 
      SET password_hash = $1
      WHERE email = 'admin@fredora.com'
    `, [hashedPassword]);
    
    console.log('✅ Admin user password_hash updated!');
    console.log('Username: admin@fredora.com');
    console.log('Password: admin123');
    
    // Verify the update
    const adminUser = await client.query("SELECT * FROM users WHERE email = 'admin@fredora.com'");
    const admin = adminUser.rows[0];
    console.log(`\n✅ Verification:`);
    console.log(`   - Has password_hash: ${admin.password_hash ? 'Yes' : 'No'}`);
    console.log(`   - Password hash length: ${admin.password_hash ? admin.password_hash.length : 'N/A'}`);
    
  } catch (error) {
    console.error('❌ Error updating admin password:', error.message);
  } finally {
    await client.end();
  }
}

fixAdminPasswordFinal();