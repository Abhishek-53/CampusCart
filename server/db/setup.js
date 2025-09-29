// server/db/setup.js
require('dotenv').config();
const db = require('./index');

const createTables = async () => {
  const usersTable = `
    CREATE TABLE IF NOT EXISTS users (
      user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      google_id VARCHAR(255) UNIQUE NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'Buyer',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  const categoriesTable = `
    CREATE TABLE IF NOT EXISTS categories (
      category_id SERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL
    );
  `;

  try {
    await db.query(usersTable);
    await db.query(categoriesTable);
    console.log('✅ Tables created successfully!');
  } catch (err) {
    console.error('❌ Error creating tables:', err.stack);
  } finally {
    await db.end();
    console.log('🔗 Database pool closed.');
  }
};

createTables();
