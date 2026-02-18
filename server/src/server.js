const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const mealRoutes = require('./routes/meals');
const { initDB } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:3000',
      'https://ranvijay.capricorn.online',
      'http://localhost:3000',
    ];
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Allow all origins for now to avoid CORS issues
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Create an API router that holds all API routes
const apiRouter = express.Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use('/meals', mealRoutes);
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount API router at both paths to handle requests with or without /prashant prefix
// The deployed site at ranvijay.capricorn.online/prashant/ may forward
// requests with /prashant/ prefix intact from the reverse proxy.
app.use('/prashant/api', apiRouter);
app.use('/api', apiRouter);

// Start server
const startServer = async () => {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();
