const express = require(‘express’);
const cors = require(‘cors’);
const helmet = require(‘helmet’);
const rateLimit = require(‘express-rate-limit’);
const { Pool } = require(‘pg’);
const bcrypt = require(‘bcrypt’);
const jwt = require(‘jsonwebtoken’);
const path = require(‘path’);
require(‘dotenv’).config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
connectionString: process.env.DATABASE_URL,
ssl: process.env.NODE_ENV === ‘production’ ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(helmet({
contentSecurityPolicy: {
directives: {
defaultSrc: [”‘self’”],
styleSrc: [”‘self’”, “‘unsafe-inline’”],
scriptSrc: [”‘self’”, “‘unsafe-inline’”],
imgSrc: [”‘self’”, “data:”, “https:”],
},
}
}));

app.use(cors());
app.use(express.json({ limit: ‘10mb’ }));
app.use(express.static(‘public’));

// Rate limiting
const limiter = rateLimit({
windowMs: 15 * 60 * 1000, // 15 minutes
max: 100, // limit each IP to 100 requests per windowMs
message: { error: ‘Too many requests, please try again later.’ }
});
app.use(’/api/’, limiter);

// JWT Authentication middleware
const authenticateToken = (req, res, next) => {
const authHeader = req.headers[‘authorization’];
const token = authHeader && authHeader.split(’ ’)[1];

if (!token) {
return res.status(401).json({ error: ‘Access token required’ });
}

jwt.verify(token, process.env.JWT_SECRET || ‘your-secret-key’, (err, user) => {
if (err) {
return res.status(403).json({ error: ‘Invalid token’ });
}
req.user = user;
next();
});
};

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
const adminPassword = req.headers[‘admin-password’];
if (adminPassword !== process.env.ADMIN_PASSWORD) {
return res.status(401).json({ error: ‘Invalid admin password’ });
}
next();
};

// Database initialization
async function initializeDatabase() {
try {
console.log(‘Initializing database…’);

```
await pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    license_key VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS license_keys (
    id SERIAL PRIMARY KEY,
    key_value VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    used_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    spouse VARCHAR(255),
    children TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name)
  )
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS contact_tags (
    contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (contact_id, tag_id)
  )
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS contact_connections (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
    connected_contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
    connection_type VARCHAR(100) DEFAULT 'introduced_by',
    connection_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(contact_id, connected_contact_id, connection_type)
  )
`);

// Create default admin license key
await pool.query(`
  INSERT INTO license_keys (key_value, status) 
  VALUES ('DEMO-KEY-123', 'active') 
  ON CONFLICT (key_value) DO NOTHING
`);

console.log('Database initialized successfully');
```

} catch (error) {
console.error(‘Database initialization error:’, error);
throw error;
}
}

// Health check endpoint
app.get(’/health’, (req, res) => {
res.status(200).json({ status: ‘OK’, timestamp: new Date().toISOString() });
});

// API Routes

// Auth routes
app.post(’/api/register’, async (req, res) => {
try {
const { email, password, licenseKey } = req.body;

```
if (!email || !password || !licenseKey) {
  return res.status(400).json({ error: 'All fields are required' });
}

// Check if license key is valid
const keyResult = await pool.query(
  'SELECT * FROM license_keys WHERE key_value = $1 AND status = $2',
  [licenseKey, 'active']
);

if (keyResult.rows.length === 0) {
  return res.status(400).json({ error: 'Invalid license key' });
}

// Check if user already exists
const userExists = await pool.query(
  'SELECT id FROM users WHERE email = $1',
  [email]
);

if (userExists.rows.length > 0) {
  return res.status(400).json({ error: 'User already exists' });
}

// Hash password
const saltRounds = 12;
const passwordHash = await bcrypt.hash(password, saltRounds);

// Create user
const result = await pool.query(
  'INSERT INTO users (email, password_hash, license_key) VALUES ($1, $2, $3) RETURNING id',
  [email, passwordHash, licenseKey]
);

// Mark license key as used
await pool.query(
  'UPDATE license_keys SET status = $1, used_by = $2 WHERE key_value = $3',
  ['used', email, licenseKey]
);

res.status(201).json({ message: 'User created successfully' });
```

} catch (error) {
console.error(‘Registration error:’, error);
res.status(500).json({ error: ‘Internal server error’ });
}
});

app.post(’/api/login’, async (req, res) => {
try {
const { email, password } = req.body;

```
if (!email || !password) {
  return res.status(400).json({ error: 'Email and password are required' });
}

const result = await pool.query(
  'SELECT id, email, password_hash FROM users WHERE email = $1',
  [email]
);

if (result.rows.length === 0) {
  return res.status(401).json({ error: 'Invalid credentials' });
}

const user = result.rows[0];
const passwordMatch = await bcrypt.compare(password, user.password_hash);

if (!passwordMatch) {
  return res.status(401).json({ error: 'Invalid credentials' });
}

const token = jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET || 'your-secret-key',
  { expiresIn: '24h' }
);

res.json({ token, user: { id: user.id, email: user.email } });
```

} catch (error) {
console.error(‘Login error:’, error);
res.status(500).json({ error: ‘Internal server error’ });
}
});

// Admin routes
app.post(’/api/admin/license-keys’, authenticateAdmin, async (req, res) => {
try {
const { quantity = 1 } = req.body;
const keys = [];

```
for (let i = 0; i < Math.min(quantity, 100); i++) {
  const key = generateLicenseKey();
  await pool.query(
    'INSERT INTO license_keys (key_value) VALUES ($1)',
    [key]
  );
  keys.push(key);
}

res.json({ keys, message: `Generated ${keys.length} license keys` });
```

} catch (error) {
console.error(‘License key generation error:’, error);
res.status(500).json({ error: ‘Internal server error’ });
}
});

app.get(’/api/admin/license-keys’, authenticateAdmin, async (req, res) => {
try {
const result = await pool.query(
‘SELECT key_value, status, used_by, created_at FROM license_keys ORDER BY created_at DESC LIMIT 100’
);
res.json(result.rows);
} catch (error) {
console.error(‘License keys fetch error:’, error);
res.status(500).json({ error: ‘Internal server error’ });
}
});

// Contact routes
app.get(’/api/contacts’, authenticateToken, async (req, res) => {
try {
const result = await pool.query(`SELECT  c.*, COALESCE( JSON_AGG( CASE WHEN t.name IS NOT NULL THEN t.name END ) FILTER (WHERE t.name IS NOT NULL), '[]' ) as tags, COALESCE( JSON_AGG( DISTINCT CASE WHEN cc.connected_contact_id IS NOT NULL THEN  JSON_BUILD_OBJECT( 'id', connected_contact.id, 'name', connected_contact.name, 'connection_type', cc.connection_type, 'connection_notes', cc.connection_notes ) END ) FILTER (WHERE cc.connected_contact_id IS NOT NULL), '[]' ) as connections FROM contacts c LEFT JOIN contact_tags ct ON c.id = ct.contact_id LEFT JOIN tags t ON ct.tag_id = t.id LEFT JOIN contact_connections cc ON c.id = cc.contact_id LEFT JOIN contacts connected_contact ON cc.connected_contact_id = connected_contact.id AND connected_contact.user_id = $1 WHERE c.user_id = $1 GROUP BY c.id ORDER BY c.created_at DESC`, [req.user.userId]);

```
res.json(result.rows);
```

} catch (error) {
console.error(‘Contacts fetch error:’, error);
res.status(500).json({ error: ‘Internal server error’ });
}
});

app.post(’/api/contacts’, authenticateToken, async (req, res) => {
const client = await pool.connect();
try {
await client.query(‘BEGIN’);

```
const { name, location, spouse, children, notes, tags, connections } = req.body;

if (!name || !location) {
  return res.status(400).json({ error: 'Name and location are required' });
}

// Insert contact
const contactResult = await client.query(
  'INSERT INTO contacts (user_id, name, location, spouse, children, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
  [req.user.userId, name, location, spouse || null, children || null, notes || null]
);

const contact = contactResult.rows[0];

// Handle tags
if (tags && tags.length > 0) {
  for (const tagName of tags) {
    await client.query(
      'INSERT INTO tags (user_id, name) VALUES ($1, $2) ON CONFLICT (user_id, name) DO NOTHING',
      [req.user.userId, tagName]
    );

    const tagResult = await client.query(
      'SELECT id FROM tags WHERE user_id = $1 AND name = $2',
      [req.user.userId, tagName]
    );

    await client.query(
      'INSERT INTO contact_tags (contact_id, tag_id) VALUES ($1, $2)',
      [contact.id, tagResult.rows[0].id]
    );
  }
}

// Handle connections
if (connections && connections.length > 0) {
  for (const connection of connections) {
    await client.query(
      'INSERT INTO contact_connections (contact_id, connected_contact_id, connection_type, connection_notes) VALUES ($1, $2, $3, $4)',
      [contact.id, connection.contactId, connection.type, connection.notes || null]
    );
  }
}

await client.query('COMMIT');
res.status(201).json({ ...contact, tags: tags || [], connections: connections || [] });
```

} catch (error) {
await client.query(‘ROLLBACK’);
console.error(‘Contact creation error:’, error);
res.status(500).json({ error: ‘Internal server error’ });
} finally {
client.release();
}
});

app.put(’/api/contacts/:id’, authenticateToken, async (req, res) => {
const client = await pool.connect();
try {
await client.query(‘BEGIN’);

```
const { name, location, spouse, children, notes, tags, connections } = req.body;
const contactId = req.params.id;

if (!name || !location) {
  return res.status(400).json({ error: 'Name and location are required' });
}

// Update contact
await client.query(
  'UPDATE contacts SET name = $1, location = $2, spouse = $3, children = $4, notes = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 AND user_id = $7',
  [name, location, spouse || null, children || null, notes || null, contactId, req.user.userId]
);

// Remove existing tags and connections
await client.query('DELETE FROM contact_tags WHERE contact_id = $1', [contactId]);
await client.query('DELETE FROM contact_connections WHERE contact_id = $1', [contactId]);

// Add new tags
if (tags && tags.length > 0) {
  for (const tagName of tags) {
    await client.query(
      'INSERT INTO tags (user_id, name) VALUES ($1, $2) ON CONFLICT (user_id, name) DO NOTHING',
      [req.user.userId, tagName]
    );

    const tagResult = await client.query(
      'SELECT id FROM tags WHERE user_id = $1 AND name = $2',
      [req.user.userId, tagName]
    );

    await client.query(
      'INSERT INTO contact_tags (contact_id, tag_id) VALUES ($1, $2)',
      [contactId, tagResult.rows[0].id]
    );
  }
}

// Add new connections
if (connections && connections.length > 0) {
  for (const connection of connections) {
    await client.query(
      'INSERT INTO contact_connections (contact_id, connected_contact_id, connection_type, connection_notes) VALUES ($1, $2, $3, $4)',
      [contactId, connection.contactId, connection.type, connection.notes || null]
    );
  }
}

await client.query('COMMIT');
res.json({ message: 'Contact updated successfully' });
```

} catch (error) {
await client.query(‘ROLLBACK’);
console.error(‘Contact update error:’, error);
res.status(500).json({ error: ‘Internal server error’ });
} finally {
client.release();
}
});

app.delete(’/api/contacts/:id’, authenticateToken, async (req, res) => {
try {
const result = await pool.query(
‘DELETE FROM contacts WHERE id = $1 AND user_id = $2 RETURNING id’,
[req.params.id, req.user.userId]
);

```
if (result.rows.length === 0) {
  return res.status(404).json({ error: 'Contact not found' });
}

res.json({ message: 'Contact deleted successfully' });
```

} catch (error) {
console.error(‘Contact deletion error:’, error);
res.status(500).json({ error: ‘Internal server error’ });
}
});

// Tag routes
app.get(’/api/tags’, authenticateToken, async (req, res) => {
try {
const result = await pool.query(
‘SELECT * FROM tags WHERE user_id = $1 ORDER BY name’,
[req.user.userId]
);
res.json(result.rows);
} catch (error) {
console.error(‘Tags fetch error:’, error);
res.status(500).json({ error: ‘Internal server error’ });
}
});

app.post(’/api/tags’, authenticateToken, async (req, res) => {
try {
const { name } = req.body;

```
if (!name || name.trim().length === 0) {
  return res.status(400).json({ error: 'Tag name is required' });
}

const result = await pool.query(
  'INSERT INTO tags (user_id, name) VALUES ($1, $2) RETURNING *',
  [req.user.userId, name.trim()]
);
res.status(201).json(result.rows[0]);
```

} catch (error) {
if (error.code === ‘23505’) { // Unique constraint violation
res.status(400).json({ error: ‘Tag already exists’ });
} else {
console.error(‘Tag creation error:’, error);
res.status(500).json({ error: ‘Internal server error’ });
}
}
});

app.delete(’/api/tags/:id’, authenticateToken, async (req, res) => {
try {
const result = await pool.query(
‘DELETE FROM tags WHERE id = $1 AND user_id = $2 RETURNING id’,
[req.params.id, req.user.userId]
);

```
if (result.rows.length === 0) {
  return res.status(404).json({ error: 'Tag not found' });
}

res.json({ message: 'Tag deleted successfully' });
```

} catch (error) {
console.error(‘Tag deletion error:’, error);
res.status(500).json({ error: ‘Internal server error’ });
}
});

// Utility functions
function generateLicenseKey() {
const chars = ‘ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789’;
let result = ‘’;
for (let i = 0; i < 16; i++) {
if (i > 0 && i % 4 === 0) result += ‘-’;
result += chars.charAt(Math.floor(Math.random() * chars.length));
}
return result;
}

// Serve the main app
app.get(’/’, (req, res) => {
res.sendFile(path.join(__dirname, ‘public’, ‘index.html’));
});

// 404 handler
app.use(’*’, (req, res) => {
res.status(404).json({ error: ‘Endpoint not found’ });
});

// Error handling middleware
app.use((err, req, res, next) => {
console.error(‘Unhandled error:’, err);
res.status(500).json({ error: ‘Something went wrong!’ });
});

// Graceful shutdown
process.on(‘SIGTERM’, () => {
console.log(‘SIGTERM received, shutting down gracefully’);
pool.end(() => {
process.exit(0);
});
});

// Start server
async function startServer() {
try {
await initializeDatabase();
app.listen(PORT, ‘0.0.0.0’, () => {
console.log(`🚀 Acquaintances app running on port ${PORT}`);
console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
});
} catch (error) {
console.error(‘Failed to start server:’, error);
process.exit(1);
}
}

startServer();
