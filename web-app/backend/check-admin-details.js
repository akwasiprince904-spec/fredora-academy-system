require('dotenv').config();
const { Client } = require('pg');

async function checkAdminDetails() {
  const client = new Client({
    connectionString: 'postgresql://postgres.olfaiomhrywwgvrmghzg:Thinker6A$@aws-1-eu-north-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔗 Connecting to Supabase database...');
    await client.connect();
    
    // Check all users in database
    const users = await client.query("SELECT id, username, email, role, is_active FROM users");
    console.log('📊 All users in database:');
    users.rows.forEach(user => {
      console.log(`   - ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role}, Active: ${user.is_active}`);
    });
    
    // Check admin user specifically
    const adminUser = await client.query("SELECT * FROM users WHERE email = 'admin@fredora.com'");
    
    if (adminUser.rows.length > 0) {
      const admin = adminUser.rows[0];
      console.log('\n   Admin user details:');
      console.log(`   - ID: ${admin.id}`);
      console.log(`   - Username: ${admin.username}`);
      console.log(`   - Email: ${admin.email}`);
      console.log(`   - Role: ${admin.role}`);
      console.log(`   - Active: ${admin.is_active}`);
      console.log(`   - Has password_hash: ${admin.password_hash ? 'Yes' : 'No'}`);
      console.log(`   - Has password: ${admin.password ? 'Yes' : 'No'}`);
      
      if (admin.password_hash) {
        console.log(`   - Password hash length: ${admin.password_hash.length}`);
      }
    } else {
      console.log('\n❌ Admin user not found!');
    }
    
  } catch (error) {
    console.error('❌ Error checking admin:', error.message);
  } finally {
    await client.end();
  }
}

checkAdminDetails();