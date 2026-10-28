import app from './app.js';
import { ENV } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { Movie } from './models/Movie.js';
import { seedDatabase } from './scripts/seed.js';

let server;

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed initial demo dataset if database is newly initialized
    const movieCount = await Movie.countDocuments();
    if (movieCount === 0) {
      console.log('[Server] Database is empty. Auto-seeding initial cinema dataset...');
      await seedDatabase();
      console.log('[Server] Auto-seed complete!');
    }

    server = app.listen(ENV.PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 IMovies Server running on port ${ENV.PORT}`);
      console.log(`📡 Environment: ${ENV.NODE_ENV}`);
      console.log(`🌐 Base URL: http://localhost:${ENV.PORT}`);
      console.log(`🏥 Health Check: http://localhost:${ENV.PORT}/api/health`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('Fatal error during server startup:', error.message);
    process.exit(1);
  }
};

const handleGracefulShutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Commencing graceful shutdown...`);
  if (server) {
    server.close(async () => {
      console.log('[Server] HTTP server closed.');
      await disconnectDB();
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

startServer();
