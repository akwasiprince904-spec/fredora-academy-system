// Fix users table - add missing columns - 2025-08-21
const db = require('./config/database');

async function fixUsersTable() {
  try {
    console.log('🔧 Fixing users table...');
    
    // Check if last_login column exists
    const columns = await db.raw(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND table_schema = 'public'
    `);
    
    const columnNames = columns.rows.map(col => col.column_name);
    console.log('Current columns:', columnNames);
    
    // Add missing columns
    if (!columnNames.includes('last_login')) {
      console.log('➕ Adding last_login column...');
      await db.raw('ALTER TABLE users ADD COLUMN last_login TIMESTAMP');
      console.log('✅ last_login column added');
    } else {
      console.log('✅ last_login column already exists');
    }
    
    if (!columnNames.includes('created_at')) {
      console.log('➕ Adding created_at column...');
      await db.raw('ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
      console.log('✅ created_at column added');
    } else {
      console.log('✅ created_at column already exists');
    }
    
    if (!columnNames.includes('updated_at')) {
      console.log('➕ Adding updated_at column...');
      await db.raw('ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
      console.log('✅ updated_at column added');
    } else {
      console.log('✅ updated_at column already exists');
    }
    
    // Verify the fix
    const updatedColumns = await db.raw(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND table_schema = 'public'
    `);
    
    console.log('Updated columns:', updatedColumns.rows.map(col => col.column_name));
    
    await db.destroy();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error fixing users table:', error.message);
    console.error('Full error:', error);
  }
}

fixUsersTable();
