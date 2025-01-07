const mysql = require('mysql2');
require('dotenv').config();

// Create a pool of connections for better performance in a serverless environment
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,    // Make sure the app waits for connections to become available
  connectionLimit: 10,         // Set the maximum number of connections allowed
  queueLimit: 0                // Set to 0 to allow an unlimited queue of waiting connections
});

// Use the promise API for async/await support
const promisePool = pool.promise();

// Test connection (for debugging)
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to database `db_propersv2` successfully!');
  connection.release(); // Release the connection back to the pool
});

module.exports = promisePool;
