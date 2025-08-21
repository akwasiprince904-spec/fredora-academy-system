const knex = require('knex');
const bcrypt = require('bcryptjs');

// Connect to Supabase (production database)
const db = knex({
  client: 'pg',
  connection: 'postgresql://postgres.olfaiomhrywwgvrmghzg:Thinker6A$@aws-1-eu-north-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function createAdminInProduction() {
  try {
    console.log('🔗 Connecting to Supabase database...');
    
    // Check if admin user already exists
    const existingAdmin = await db('users').where('email', 'admin@fredora.com').first();
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists in production database');
      console.log('Username:', existingAdmin.username);
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      return;
    }
    
    console.log('📝 Creating admin user in production database...');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await db('users').insert({
      username: 'admin',
      email: 'admin@fredora.com',
      password: hashedPassword,
      name: 'Administrator',
      role: 'admin',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    console.log('✅ Admin user created successfully in Supabase!');
    console.log('Username: admin');
    console.log('Email: admin@fredora.com');
    console.log('Password: admin123');
    console.log('Role: admin');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await db.destroy();
  }
}

createAdminInProduction();