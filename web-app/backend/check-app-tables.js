require('dotenv').config();
const { Client } = require('pg');

async function checkAppTables() {
  const client = new Client({
    connectionString: 'postgresql://postgres.olfaiomhrywwgvrmghzg:Thinker6A$@aws-1-eu-north-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔗 Connecting to Supabase database...');
    await client.connect();
    
    // Check all tables in the public schema
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📊 Tables in public schema:');
    tables.rows.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    
    // Check if users table exists in public schema
    const hasUsersTable = tables.rows.some(table => table.table_name === 'users');
    console.log(`\n   Has users table in public schema: ${hasUsersTable ? 'Yes' : 'No'}`);
    
    if (hasUsersTable) {
      // Check users table columns
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'users' 
        ORDER BY ordinal_position
      `);
      
      console.log('\n   Public users table columns:');
      columns.rows.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
  } finally {
    await client.end();
  }
}

checkAppTables();