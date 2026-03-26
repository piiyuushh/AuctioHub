const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

function getSslConfig(connectionString) {
  try {
    const hostname = new URL(connectionString).hostname;
    const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';
    return isLocalHost ? false : { rejectUnauthorized: false };
  } catch {
    return { rejectUnauthorized: false };
  }
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: getSslConfig(process.env.DATABASE_URL)
});

async function setupDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Connected to database successfully!');
    
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Executing schema...');
    
    // Execute schema
    await client.query(schema);
    
    console.log('Database schema created successfully!');
    console.log('\nTables created:');
    console.log('  - users');
    console.log('  - carousel_images');
    console.log('  - new_arrivals');
    console.log('  - admin_settings');
    console.log('  - products');
    console.log('  - bids');
    console.log('  - chat_messages');
    
  } catch (error) {
    console.error('Error setting up database:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase();
