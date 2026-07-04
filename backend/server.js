import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import leadRoutes from './routes/leadRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Establish database link
connectDB();

// Global Security Middleware
app.use(helmet());

// Rate Limiter to prevent brute-force API spam
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP address. Please try again after 15 minutes.'
  }
});
app.use('/api', apiLimiter);

// Middleware config
app.use(cors({
  origin: '*', // Replace with specific whitelist arrays in production envs
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes mapping
app.use('/api/leads', leadRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'AetherCRM Backend Engine is healthy.',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'running-in-memory-fallback'
  });
});

// Centralized Error-Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Exception:', err.stack || err.message);

  // Mongoose Schema Validation error handling
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(422).json({ error: messages.join(', ') });
  }

  // Mongoose unique index duplicate keys error handling
  if (err.code === 11000) {
    return res.status(400).json({ error: 'Record already exists. Email address must be unique.' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'An internal server error occurred.'
  });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful Connection Terminations
const handleShutdown = (signal) => {
  console.log(`\nReceived ${signal}. Closing active HTTP connections...`);
  server.close(async () => {
    console.log('HTTP connection server closed.');
    try {
      await mongoose.connection.close(false);
      console.log('MongoDB connection closed successfully.');
      process.exit(0);
    } catch (err) {
      console.error('Error during database connection termination:', err.message);
      process.exit(1);
    }
  });

  // Force close after 10s if process hangs
  setTimeout(() => {
    console.error('Graceful shutdown timed out. Forcing process kill.');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
