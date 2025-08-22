require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Client } = require('pg');

async function createTeacherUser() {
  const client = new Client({
    connectionString: 'postgresql://postgres.olfaiomhrywwgvrmghzg:Thinker6A$@aws-1-eu-north-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔗 Connecting to production database...');
    await client.connect();
    
    console.log('📝 Creating teacher user...');
    
    // Hash the password 'teacher123'
    const hashedPassword = await bcrypt.hash('teacher123', 10);
    
    // Create the teacher user
    await client.query(`
      INSERT INTO users (username, email, password_hash, name, role, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, ['teacher', 'teacher@fredora.com', hashedPassword, 'Teacher User', 'teacher', true]);
    
    console.log('✅ Teacher user created successfully!');
    console.log('Username: teacher@fredora.com');
    console.log('Password: teacher123');
    console.log('Role: teacher');
    
  } catch (error) {
    console.error('❌ Error creating teacher:', error.message);
  } finally {
    await client.end();
  }
}

createTeacherUser();