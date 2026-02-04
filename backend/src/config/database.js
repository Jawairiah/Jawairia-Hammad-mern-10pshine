const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const isTestEnvironment = process.env.NODE_ENV === 'test';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: isTestEnvironment 
    ? (process.env.DB_TEST_NAME || 'notes_test_db')
    : process.env.DB_NAME,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

const initDB = async () => {
  try {
    const sqlPath = path.join(__dirname, "../init-db.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    await pool.query(sql);

    const res = await pool.query("SELECT current_database()");
    console.log("✅ DB connected:", res.rows[0].current_database);
    console.log("✅ Users table ensured");
  } catch (err) {
    console.error("❌ DB init error:", err.message);
  }
};

// Only initialize DB if not in test mode
if (!isTestEnvironment) {
  initDB();
}

module.exports = pool;