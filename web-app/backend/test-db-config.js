// Test database configuration - 2025-08-21
console.log('🔍 Testing database configuration...');

try {
  const db = require('./config/database');
  console.log('✅ Database config loaded successfully');
  console.log('   Database client:', db.client.config.client);
  console.log('   Connection type:', typeof db.client.config.connection);
  
  if (typeof db.client.config.connection === 'string') {
    console.log('   Connection string length:', db.client.config.connection.length);
    console.log('   Connection starts with:', db.client.config.connection.substring(0, 20) + '...');
  } else {
    console.log('   Connection object keys:', Object.keys(db.client.config.connection));
  }
  
} catch (error) {
  console.error('❌ Error loading database config:', error.message);
  console.error('   Full error:', error);
}
