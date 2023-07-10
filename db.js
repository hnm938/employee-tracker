const mysql = require("mysql2");

// Create collections pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "mmps23",
  database: "employee_tracker",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Export pool to be used
module.exports = pool.promise();