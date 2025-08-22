require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Client } = require('pg');

async function createAdminCorrect() {
  const client = new Client({
    connectionString: 'postgresql://postgres.olfaiomhrywwgvrmghzg:Thinker6A$@aws-1-eu-north-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔗 Connecting to Supabase database...');
    await client.connect();
    
    // Check if admin user already exists
    const existingAdmin = await client.query("SELECT * FROM users WHERE email = 'admin@fredora.com'");
    
    if (existingAdmin.rows.length > 0) {
      console.log('✅ Admin user already exists');
      return;
    }
    
    console.log('📝 Creating admin user with correct field names...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await client.query(`
      INSERT INTO users (username, email, password_hash, name, role, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, ['admin', 'admin@fredora.com', hashedPassword, 'Administrator', 'admin', true]);
    
    console.log('✅ Admin user created successfully!');
    console.log('Username: admin@fredora.com');
    console.log('Password: admin123');
    console.log('Field: password_hash (correct)');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await client.end();
  }
}

createAdminCorrect();