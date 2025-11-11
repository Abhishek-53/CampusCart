// server/index.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
require('./passport-setup');
const db = require('./db');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 5000;

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(session({
  secret: process.env.COOKIE_KEY,
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

// --- Auth Routes ---
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login-failed' }),
  (req, res) => {
    res.redirect('http://localhost:3000/dashboard'); 
  }
);

app.get('/auth/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// --- User API ---
app.get('/api/user', (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'User not authenticated' });
  }
});

// --- NEW ROUTE: UPDATE USER NAME ---
app.put('/api/user/name', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  const { newName } = req.body;
  const userId = req.user.user_id;

  try {
    const result = await db.query(
      'UPDATE users SET display_name = $1 WHERE user_id = $2 RETURNING *',
      [newName, userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ error: 'Failed to update name' });
  }
});

// --- NEW ROUTE: GET LOGGED-IN USER'S PRODUCTS ---
app.get('/api/user/products', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  const userId = req.user.user_id;

  try {
    const result = await db.query(
      'SELECT * FROM products WHERE seller_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ error: 'Failed to fetch user products' });
  }
});
// ---------------------------------

// --- Product API ---
app.post('/api/products', upload.single('image'), async (req, res) => {
  // ... (your existing POST products logic is fine)
  if (!req.user) return res.status(401).json({ error: 'You must be logged in.' });
  const { name, description, price, category } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  const sellerId = req.user.user_id;
  try {
    const newProduct = await db.query(
      `INSERT INTO products (name, description, estimated_price, category_id, seller_id, image_url)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, description, price, category, sellerId, imageUrl]
    );
    res.status(201).json(newProduct.rows[0]);
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ error: 'Failed to list new product.' });
  }
});


app.put('/api/products/:id/finalize', async (req, res) => {
  // Check if user is logged in
  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  
  const { id } = req.params;
  const { finalPrice, buyerEmail } = req.body;
  const sellerId = req.user.user_id;

  try {
    // 1. Find the buyer by their email
    const buyerResult = await db.query('SELECT user_id FROM users WHERE email = $1', [buyerEmail]);
    if (buyerResult.rows.length === 0) {
      return res.status(404).json({ error: 'No user found with that email.' });
    }
    const intendedBuyerId = buyerResult.rows[0].user_id;

    // 2. Update the product, but only if the person making the request is the seller
    const updateResult = await db.query(
      `UPDATE products 
       SET final_price = $1, intended_buyer_id = $2 
       WHERE product_id = $3 AND seller_id = $4 
       RETURNING *`,
      [finalPrice, intendedBuyerId, id, sellerId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(403).json({ error: 'You are not authorized to update this product.' });
    }

    res.json(updateResult.rows[0]);
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ error: 'Server error finalizing deal.' });
  }
});

app.get('/api/categories', async (req, res) => {
  // ... (your existing categories logic is fine)
  try {
    const result = await db.query('SELECT * FROM categories');
    res.json(result.rows);
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- UPDATED: GET ALL PRODUCTS ---
// (Changed u.full_name to u.display_name)
app.get('/api/products', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
         p.product_id, p.name, p.description, p.estimated_price, p.status, p.image_url,
         c.name AS category_name,
         u.display_name AS seller_name
       FROM products p
       JOIN categories c ON p.category_id = c.category_id
       JOIN users u ON p.seller_id = u.user_id
       WHERE p.status = 'approved'`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- UPDATED: GET SINGLE PRODUCT ---
// (Changed u.full_name to u.display_name)
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT
         p.product_id, p.name, p.description, p.estimated_price, p.status, p.image_url,
         c.name AS category_name,
         u.display_name AS seller_name,
         u.email AS seller_email,
         
         -- --- ADD THESE TWO LINES ---
         p.final_price,
         p.intended_buyer_id
         -- -------------------------

       FROM products p
       JOIN categories c ON p.category_id = c.category_id
       JOIN users u ON p.seller_id = u.user_id
       WHERE p.product_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Admin Routes ---
// ... (your existing admin routes are fine)
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') next();
  else res.status(403).json({ error: 'Forbidden: Admins only' });
};
app.get('/api/admin/pending-products', isAdmin, async (req, res) => {
  const result = await db.query("SELECT * FROM products WHERE status = 'pending'");
  res.json(result.rows);
});
app.put('/api/admin/products/:id/approve', isAdmin, async (req, res) => {
  const { id } = req.params;
  const result = await db.query("UPDATE products SET status = 'approved' WHERE product_id = $1 RETURNING *", [id]);
  res.json(result.rows[0]);
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});