require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'business_billing',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : null
};

// Support for connection string if provided (common in platforms like Railway/Render)
const connectionString = process.env.DATABASE_URL;

async function initializeDatabase() {
  try {
    console.log(`Connecting to database ${dbConfig.database} as ${dbConfig.user}...`);
    
    // First connect without database to create it if not exists (only for local manual setups)
    // If connectionString is used, we assume the DB is already created by the host
    if (!connectionString) {
      const connection = await mysql.createConnection({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
      });
      
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
      await connection.end();
    }

    // Now connect to the database / pool
    const pool = connectionString ? mysql.createPool(connectionString) : mysql.createPool(dbConfig);
    
    // Create customers table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        notes TEXT,
        total_amount DECIMAL(10, 2) DEFAULT 0.00,
        pending_amount DECIMAL(10, 2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await pool.query(createTableQuery);

    // Migration: Add notes column if it doesn't exist (for existing tables)
    try {
      await pool.query('ALTER TABLE customers ADD COLUMN notes TEXT AFTER name');
      console.log('Migration: Added notes column to customers table.');
    } catch (err) {
      if (err.code !== 'ER_DUP_COLUMNNAME') {
        console.error('Migration error:', err.message);
      }
    }

    console.log('✅ Database and table ready!');
    
    return pool;
  } catch (error) {
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n❌ ERROR: Database access denied. Please check your DB_USER and DB_PASSWORD in the .env file.');
    } else {
      console.error('\n❌ Error initializing database:', error.message);
    }
    // Don't exit here, let the server handle the missing pool gracefully if possible
    // or provide a clearer exit message
    process.exit(1);
  }
}

let poolPromise = initializeDatabase();

module.exports = {
  query: async (sql, params) => {
    try {
      const pool = await poolPromise;
      return pool.execute(sql, params);
    } catch (error) {
      console.error('Database query error:', error.message);
      throw error;
    }
  }
};

