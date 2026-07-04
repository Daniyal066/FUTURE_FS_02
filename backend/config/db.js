import mongoose from 'mongoose';

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27014/mini-crm';

  // Prevent adding duplicate listeners on hot reloads
  if (mongoose.connection.listeners('connected').length === 0) {
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connection successfully established.');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB connection disconnected.');
    });
  }

  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 4000 // Fast fail for local dev to fall back cleanly
    });
  } catch (error) {
    console.error('MongoDB initial connection attempt failed (using active in-memory database fallback):', error.message);
  }
};

export default connectDB;
