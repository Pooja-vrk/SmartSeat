const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const busRoutes = require('./routes/buses');
const scheduleRoutes = require('./routes/schedules');
const bookingRoutes = require('./routes/bookings');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');

const app = express();

// Version probe — lets us confirm the deployed commit
app.get('/api/version', (req, res) => {
  res.json({ version: 'v2-null-safe-admin', commit: '21996f2' });
});

// ============================================================
// DATABASE
// ============================================================

connectDB();

// ============================================================
// SECURITY
// ============================================================

app.use(helmet());

// ============================================================
// CORS
// ============================================================

const allowedOrigins = [
  // Local development
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',

  // Production Vercel frontend
  'https://smart-seat-liard.vercel.app',

  // Render environment variable
  process.env.CLIENT_URL,

  // Socket.IO environment variable
  process.env.SOCKET_CORS_ORIGIN
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests without an Origin header
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn(`CORS blocked origin: ${origin}`);

    return callback(
      new Error(`Not allowed by CORS: ${origin}`)
    );
  },

  credentials: true,

  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS'
  ],

  allowedHeaders: [
    'Content-Type',
    'Authorization'
  ],

  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Explicit browser preflight handling
app.options('*', cors(corsOptions));

// ============================================================
// BODY PARSER
// ============================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// RATE LIMITING
// ============================================================

if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs:
      parseInt(process.env.RATE_LIMIT_WINDOW_MS) ||
      15 * 60 * 1000,

    max:
      parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) ||
      100,

    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    },

    standardHeaders: true,
    legacyHeaders: false
  });

  //app.use('/api/', limiter);
}

// ============================================================
// AUTH RATE LIMITING
// ============================================================

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,

  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  }
});

// Disabled during integration testing
// app.use('/api/auth/login', authLimiter);
// app.use('/api/auth/register', authLimiter);

// ============================================================
// LOGGING
// ============================================================

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ============================================================
// HEALTH CHECK
// ============================================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SmartSeat API is running',
    timestamp: new Date().toISOString()
  });
});

// ============================================================
// API ROUTES
// ============================================================

app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

// ============================================================
// 404 HANDLER
// ============================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// ============================================================
// ERROR HANDLER
// ============================================================

app.use(errorHandler);

// ============================================================
// EXPORT
// ============================================================

module.exports = app;