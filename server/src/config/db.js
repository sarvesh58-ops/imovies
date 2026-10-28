import mongoose from 'mongoose';
import { ENV } from './env.js';

let mongodInstance = null;

export const connectDB = async () => {
  try {
    // Attempt connecting to configured URI with a 3-second timeout
    console.log(`[DB] Attempting connection to MongoDB at: ${ENV.MONGODB_URI}...`);
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });
    console.log(`[DB] Successfully connected to MongoDB: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.warn(`[DB] Could not connect to primary MongoDB at ${ENV.MONGODB_URI} (${err.message})`);
    
    // In development/evaluation mode, fallback seamlessly to mongodb-memory-server
    if (ENV.NODE_ENV !== 'production') {
      try {
        console.log('[DB] Launching embedded MongoDB In-Memory instance for zero-friction evaluation...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create();
        const memoryUri = mongodInstance.getUri();
        console.log(`[DB] Connecting to embedded MongoDB at: ${memoryUri}`);
        const conn = await mongoose.connect(memoryUri);
        console.log('[DB] Successfully connected to embedded MongoDB!');
        return conn;
      } catch (memErr) {
        console.error('[DB] Failed to launch embedded MongoDB:', memErr.message);
        throw memErr;
      }
    } else {
      throw err;
    }
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
    console.log('[DB] MongoDB disconnected successfully.');
  } catch (err) {
    console.error('[DB] Error during MongoDB disconnection:', err.message);
  }
};
