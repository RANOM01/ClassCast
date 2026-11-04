import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB, getDBStatus } from './src/config/db.js';

// Route imports
import authRoutes from './src/routes/auth.routes.js';
import coursesRoutes from './src/routes/courses.routes.js';
import curriculumRoutes from './src/routes/curriculum.routes.js';
import enrollmentsRoutes from './src/routes/enrollments.routes.js';
import assignmentsRoutes from './src/routes/assignments.routes.js';
import quizzesRoutes from './src/routes/quizzes.routes.js';
import gradebookRoutes from './src/routes/gradebook.routes.js';
import announcementsRoutes from './src/routes/announcements.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/classcast';

// Initialize DB connection
connectDB().catch((err) => {
  console.warn('[ClassCast] Initial connection attempt notice:', err.message);
});

// CORS config
app.use(cors({
  origin: true,
  credentials: true,
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session setup with connect-mongo
let sessionStore;
try {
  sessionStore = MongoStore.create({
    mongoUrl: MONGODB_URI,
    collectionName: 'sessions',
    ttl: 14 * 24 * 60 * 60, // 14 days
    autoRemove: 'native',
  });
  sessionStore.on('error', (err) => {
    console.warn('[ClassCast] Session store notice (will reconnect when MongoDB is available):', err.message);
  });
} catch (err) {
  console.warn('[ClassCast] Notice: MongoStore initialization issue, falling back to memory session store for dev:', err.message);
}

app.use(session({
  name: 'classcast.sid',
  secret: process.env.SESSION_SECRET || 'classcast-cyber-serif-secure-key-2026',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
  },
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/curriculum', curriculumRoutes);
app.use('/api/enrollments', enrollmentsRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/quizzes', quizzesRoutes);
app.use('/api/gradebook', gradebookRoutes);
app.use('/api/announcements', announcementsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = getDBStatus();
  res.json({
    app: 'ClassCast',
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

// Serve static frontend build and support client-side routing on nested routes
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('[ClassCast] Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[ClassCast] Server running on http://localhost:${PORT}`);
});
