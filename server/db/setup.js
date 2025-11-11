// server/db/setup.js
require('dotenv').config();
const db = require('./index');

const createTables = async () => {
  const usersTable = `
    CREATE TABLE IF NOT EXISTS users (
      user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      full_name VARCHAR(255) NOT NULL, -- Name from Google
      display_name VARCHAR(255) NOT NULL, -- Custom name for display
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
  
  const productsTable = `
    CREATE TABLE IF NOT EXISTS products (
      product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      estimated_price NUMERIC(10, 2) NOT NULL,
      image_url VARCHAR(255),
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      seller_id UUID NOT NULL REFERENCES users(user_id),
      category_id INTEGER NOT NULL REFERENCES categories(category_id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      
      -- --- ADD THESE TWO NEW COLUMNS ---
      final_price NUMERIC(10, 2) NULL,
      intended_buyer_id UUID NULL REFERENCES users(user_id)
      -- ---------------------------------
    );
  `;

  try {
    await db.query(usersTable);
    await db.query(categoriesTable);
    await db.query(productsTable);
    console.log('✅ Tables created successfully!');
  } catch (err) {
    console.error('❌ Error creating tables:', err.stack);
  } finally {
    await db.end();
    console.log('🔗 Database pool closed.');
  }
};

createTables();