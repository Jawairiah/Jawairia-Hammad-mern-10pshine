
const { Pool } = require('pg');

const testPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_TEST_NAME || 'notes_test_db',
  ssl: false
});

const cleanDatabase = async () => {
  try {
    try {
      await testPool.query('DELETE FROM password_reset_otps');
    } catch (err) {
      // Table might not exist
      if (!err.message.includes('does not exist')) {
        console.warn('Warning cleaning password_reset_otps:', err.message);
      }
    }
    
    try {
      await testPool.query('DELETE FROM notes');
    } catch (err) {
      if (!err.message.includes('does not exist')) {
        console.warn('Warning cleaning notes:', err.message);
      }
    }
    
    try {
      await testPool.query('DELETE FROM users');
    } catch (err) {
      if (!err.message.includes('does not exist')) {
        console.warn('Warning cleaning users:', err.message);
      }
    }
    
    try {
      await testPool.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
      await testPool.query('ALTER SEQUENCE notes_id_seq RESTART WITH 1');
    } catch (err) {
      // Sequences might not exist yet, that's okay
      if (!err.message.includes('does not exist')) {
        console.warn('Warning resetting sequences:', err.message);
      }
    }
  } catch (err) {
    console.error('Error cleaning database:', err);
    throw err;
  }
};


const initTestDatabase = async () => {
  try {
    await testPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create notes table
    await testPool.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create password_reset_otps table
    await testPool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_otps (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        otp VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await testPool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await testPool.query('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
    await testPool.query('CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id)');
    await testPool.query('CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC)');
    await testPool.query('CREATE INDEX IF NOT EXISTS idx_otp_user_id ON password_reset_otps(user_id)');

    // Create or replace the update trigger function
    await testPool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    // Create trigger for notes table
    await testPool.query('DROP TRIGGER IF EXISTS update_notes_updated_at ON notes');
    await testPool.query(`
      CREATE TRIGGER update_notes_updated_at
        BEFORE UPDATE ON notes
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);

    console.log('Test database tables initialized');
  } catch (err) {
    console.error('Error initializing test database:', err);
    throw err;
  }
};


const closeDatabase = async () => {
  await testPool.end();
};

module.exports = {
  testPool,
  cleanDatabase,
  initTestDatabase,
  closeDatabase
};