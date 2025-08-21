require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Client } = require('pg');

async function createAdmin() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔗 Connecting to database...');
    await client.connect();
    
    // Check if admin user exists
    const existingAdmin = await client.query("SELECT * FROM users WHERE email = 'admin@fredora.com'");
    
    if (existingAdmin.rows.length > 0) {
      console.log('✅ Admin user already exists');
      return;
    }
    
    console.log('📝 Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await client.query(`
      INSERT INTO users (username, email, password, name, role, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, ['admin', 'admin@fredora.com', hashedPassword, 'Administrator', 'admin', true]);
    
    console.log('✅ Admin user created successfully!');
    console.log('Username: admin@fredora.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await client.end();
  }
}

createAdmin();