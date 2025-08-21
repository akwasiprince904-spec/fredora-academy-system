require('dotenv').config();

const { Client } = require('pg');

async function createTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔗 Connecting to database...');
    await client.connect();
    
    console.log('   Creating tables...');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'teacher',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');
    
    // Create classes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS classes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        grade_level VARCHAR(50),
        capacity INTEGER DEFAULT 30,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Classes table created');
    
    // Create subjects table
    await client.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Subjects table created');
    
    // Create teacher_class_assignments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS teacher_class_assignments (
        id SERIAL PRIMARY KEY,
        teacher_id INTEGER REFERENCES users(id),
        class_id INTEGER REFERENCES classes(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(teacher_id, class_id)
      )
    `);
    console.log('✅ Teacher class assignments table created');
    
    // Create teacher_subject_assignments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS teacher_subject_assignments (
        id SERIAL PRIMARY KEY,
        teacher_id INTEGER REFERENCES users(id),
        subject_id INTEGER REFERENCES subjects(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(teacher_id, subject_id)
      )
    `);
    console.log('✅ Teacher subject assignments table created');
    
    console.log('\n   All tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  } finally {
    await client.end();
  }
}

createTables();