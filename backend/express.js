require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MySQL
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'stock',
});

// Middleware for error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.setHeader('Content-Type','application/json');
  res.status(500).json({ message: 'Internal server error' });
});

// Route to get all products
app.get('/api/product', async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM product');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching products:', err);
    next(err);
  }
});

// Route to create a new product
app.post('/api/product', async (req, res, next) => {
  const { name, category, price, quantity } = req.body;

  if (!name || !category || price === undefined || quantity === undefined) {
    return res.status(400).json({ message: 'All fields (name, category, price, quantity) are required' });
  }

  try {
    const query = `INSERT INTO product(name, category, price, quantity) VALUES (?, ?, ?, ?)`;
    await db.query(query, [name, category, price, quantity]);
    res.status(201).json({ message: 'Product added successfully' });
  } catch (err) {
    console.error('Error adding product:', err);
    next(err);
  }
});



app.put('/api/products/:name/quantity', async (req, res, next) => {
  const { name } = req.params;
  const { changeType, quantityChange } = req.body;

  const changeAmount = parseInt(quantityChange, 10);
  if (isNaN(changeAmount) || changeAmount <= 0) {
    return res.status(400).json({ message: 'Invalid quantity change amount' });
  }

  try {
    // Find the product
    const [rows] = await db.query('SELECT * FROM product WHERE name = ?', [name]);
    const product = rows[0];
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Update quantity based on changeType
    let newQuantity = product.quantity;
    if (changeType === 'add') {
      newQuantity += changeAmount;
    } else if (changeType === 'deduct') {
      newQuantity = Math.max(0, newQuantity - changeAmount);
    } else {
      return res.status(400).json({ message: 'Invalid change type' });
    }

    await db.query('UPDATE product SET quantity = ? WHERE name = ?', [newQuantity, name]);
    res.json({ message: 'Product quantity updated successfully', name, newQuantity });
  } catch (err) {
    console.error('Error updating product quantity:', err);
    next(err);
  }
});


// Route to delete a product by name
app.delete('/api/product/:name', async (req, res, next) => {
  const { name } = req.params;

  try {
    const query = `DELETE FROM product WHERE name = ?`;
    const [result] = await db.query(query, [name]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    next(err);
  }
});

app.post('/api/logout', async (req, res) => {
  try {
    const { sessionToken } = req.body;

    // Find and update user session in the database
    const user = await User.findOneAndUpdate(
      { sessionToken: sessionToken },
      { sessionToken: null }, // Clear session token
      { new: true }
    );

    if (user) {
      res.status(200).json({ message: 'Logout successful' });
    } else {
      res.status(400).json({ message: 'No active session found' });
    }
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



// POST login route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    console.log(`Attempting login for username: ${username}`);
    
    // Fetch user from the database
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length === 0) {
      console.error(`Login failed: User ${username} not found.`);
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const user = rows[0];
    console.log(`User found: ${user.username}`);

    // Check password (plain text comparison)
    if (user.password !== password) {
      console.error(`Login failed: Invalid password for user ${username}.`);
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    // Login successful
    res.status(200).json({ message: 'Login successful', user: { username: user.username } });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


// POST sign-up route (storing plain text passwords)
app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    const [result] = await db.query(query, [username, password]); // Store password as plain text

    if (result.affectedRows > 0) {
      return res.status(201).json({ message: 'Sign-up successful' });
    } else {
      return res.status(500).json({ message: 'Error during sign-up' });
    }
  } catch (err) {
    console.error('Error during sign-up:', err);
    res.status(500).json({ message: 'Database error.' });
  }
});

// Fetch all users
app.get('/api/users', async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, username FROM users');
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Error fetching users' });
  }
});


app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;
  
  console.log(`Received PUT request for user ID: ${id}`);
  console.log(`Username: ${username}, Password: ${password}`);

  if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
      const query = 'UPDATE users SET username = ?, password = ? WHERE id = ?';
      const [result] = await db.query(query, [username, password, id]);
      res.json({ message: 'User updated successfully' });
  } catch (err) {
      console.error('Error updating user:', err);
      res.status(500).json({ message: 'Error updating user' });
  }
});

// Add a new user
app.post('/api/users', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  try {
    const [result] = await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
    res.status(201).json({ message: 'User added successfully', userId: result.insertId });
  } catch (err) {
    console.error('Error adding user:', err);
    res.status(500).json({ message: 'Error adding user' });
  }
});
// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
