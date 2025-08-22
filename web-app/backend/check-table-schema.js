require('dotenv').config();
const { Client } = require('pg');

async function checkTableSchema() {
  const client = new Client({
    connectionString: 'postgresql://postgres.olfaiomhrywwgvrmghzg:Thinker6A$@aws-1-eu-north-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔗 Connecting to Supabase database...');
    await client.connect();
    
    // Check what columns exist in users table
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Users table columns:');
    columns.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
    });
    
    // Check if password_hash column exists
    const hasPasswordHash = columns.rows.some(col => col.column_name === 'password_hash');
    console.log(`\n🔍 Has password_hash column: ${hasPasswordHash ? 'Yes' : 'No'}`);
    
    // Check if password column exists
    const hasPassword = columns.rows.some(col => col.column_name === 'password');
    console.log(`🔍 Has password column: ${hasPassword ? 'Yes' : 'No'}`);
    
  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
  } finally {
    await client.end();
  }
}

checkTableSchema();