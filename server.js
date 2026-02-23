require('dotenv').config();
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');
const { initDatabase } = require('./src/config/database');
const { seedIfEmpty } = require('./src/utils/seed');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure data and uploads directories exist
const fs = require('fs');
fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
fs.mkdirSync(path.join(__dirname, 'uploads', 'hero'), { recursive: true });
fs.mkdirSync(path.join(__dirname, 'uploads', 'portfolio'), { recursive: true });
fs.mkdirSync(path.join(__dirname, 'uploads', 'gallery'), { recursive: true });
fs.mkdirSync(path.join(__dirname, 'uploads', 'about'), { recursive: true });
fs.mkdirSync(path.join(__dirname, 'uploads', 'thumbnails'), { recursive: true });

// Initialize database and seed
initDatabase();
seedIfEmpty();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Session
app.use(session({
  store: new SQLiteStore({ db: 'sessions.sqlite', dir: path.join(__dirname, 'data') }),
  secret: process.env.SESSION_SECRET || 'change-this-secret-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Static files
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const publicRoutes = require('./src/routes/public');
const adminRoutes = require('./src/routes/admin');
const apiRoutes = require('./src/routes/api');

app.use('/', publicRoutes);
app.use('/backend', adminRoutes);
app.use('/backend/api', apiRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Er ging iets mis.');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`CreaCas website running on port ${PORT}`);
});
