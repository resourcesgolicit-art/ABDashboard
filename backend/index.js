const express = require('express');
const cors = require('cors');
const connectMongo = require('./DB');
require('dotenv').config();

// Models
const Users = require('./Model/user');
const Courses = require('./Model/course');

// Routes
const profileRoutes = require('./routes/profile');
const courseRoutes = require('./routes/courses');
const googleAuthRoutes = require('./routes/auth/googleAuth');
const authRoutes = require('./routes/auth'); // YOUR LOGIN / REGISTER ROUTES

const app = express();

/* -----------------------------------------------------
   1️⃣  CORS CONFIGURATION (Render Backend <-> Netlify Frontend)
----------------------------------------------------- */
app.use(express.json());

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  'https://abdashboard.netlify.app', // ← YOUR NETLIFY FRONTEND
  'https://abdash.netlify.app/',
  'https://abdash.netlify.app/auth',
  'https://abdashboard.onrender.com', // ← BACKEND URL
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (!allowedOrigins.includes(origin)) {
        return callback(
          new Error('CORS: Not allowed by policy → ' + origin),
          false
        );
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.options('/', cors());

/* -----------------------------------------------------
   2️⃣  MIDDLEWARE
----------------------------------------------------- */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* -----------------------------------------------------
   3️⃣  HEALTH CHECK ROUTES
----------------------------------------------------- */

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Backend is running successfully',
    timestamp: new Date().toISOString(),
  });
});

app.get('/test', (req, res) => {
  res.json({ message: 'Server OK', port: process.env.PORT });
});

/* -----------------------------------------------------
   4️⃣  API ROUTES
----------------------------------------------------- */

// Login / Register routes
app.use('/api/auth', authRoutes);

// Google OAuth
app.use('/auth/google', googleAuthRoutes);

// Profile CRUD
app.use('/user', profileRoutes);

// Courses
app.use('/courses', courseRoutes);

/* -----------------------------------------------------
   5️⃣  DEFAULT ROOT (OPTIONAL)
----------------------------------------------------- */

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Backend Root Running',
    routes: ['/api/auth', '/auth/google', '/user', '/courses'],
  });
});

/* -----------------------------------------------------
   6️⃣  START SERVER
----------------------------------------------------- */

async function startServer() {
  try {
    await connectMongo();
    console.log('✅ MongoDB Connected');

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Backend URL: https://abdashboard.onrender.com`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
