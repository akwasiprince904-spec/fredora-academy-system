require('dotenv').config();
const { Client } = require('pg');

async function fixColumnName() {
  const client = new Client({
    connectionString: 'postgresql://postgres.olfaiomhrywwgvrmghzg:Thinker6A$@aws-1-eu-north-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔗 Connecting to Supabase database...');
    await client.connect();
    
    console.log('🔧 Renaming password column to password_hash...');
    
    // Rename the password column to password_hash
    await client.query(`
      ALTER TABLE users 
      RENAME COLUMN password TO password_hash
    `);
    
    console.log('✅ Column renamed successfully!');
    console.log('password → password_hash');
    
    // Verify the change
    const columns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'users' 
      AND column_name IN ('password', 'password_hash')
    `);
    
    console.log('\n✅ Verification:');
    columns.rows.forEach(col => {
      console.log(`   - ${col.column_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error renaming column:', error.message);
  } finally {
    await client.end();
  }
}

fixColumnName();