// server/db/seed.js
require('dotenv').config();
const db = require('./index');

const seedCategories = async () => {
  const categories = ['Coolers', 'Study Tables', 'Lab Coats', 'ED Kit', 'Chairs', 'Other'];
  const insertQuery = 'INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING';

  try {
    for (const category of categories) {
      await db.query(insertQuery, [category]);
    }
    console.log('✅ Categories seeded successfully!');
  } catch (err) {
    console.error('❌ Error seeding categories:', err.stack);
  } finally {
    await db.end();
    console.log('🔗 Database pool closed.');
  }
};

seedCategories();