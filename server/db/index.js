// server/db/index.js
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.on('connect', () => {
  console.log('🔗 Database client connected');
});

pool.on('error', (err) => {
  console.error('❌ Database pool error', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  end: () => pool.end(),
};