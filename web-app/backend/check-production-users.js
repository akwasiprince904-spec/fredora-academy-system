require('dotenv').config();
const { Client } = require('pg');

async function checkProductionUsers() {
  const client = new Client({
    connectionString: 'postgresql://postgres.olfaiomhrywwgvrmghzg:Thinker6A$@aws-1-eu-north-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔗 Connecting to production database...');
    await client.connect();
    
    // Check all users in the public.users table
    const users = await client.query("SELECT id, username, email, role, is_active FROM users");
    
    console.log('📊 Users in production database:');
    if (users.rows.length === 0) {
      console.log('   ❌ No users found!');
    } else {
      users.rows.forEach(user => {
        console.log(`   - ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role}, Active: ${user.is_active}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error.message);
  } finally {
    await client.end();
  }
}

checkProductionUsers();