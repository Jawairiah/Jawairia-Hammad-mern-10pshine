// src/config/database.js
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

// Initialize database (run initdb.sql)
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

initDB();

module.exports = pool;
