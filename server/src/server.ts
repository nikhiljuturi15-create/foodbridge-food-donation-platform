import { app } from './app';
import { ENV } from './config/env';
import { prisma } from './utils/prisma';

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Connected to database successfully.');

    app.listen(ENV.PORT, () => {
      console.log(`🚀 FoodBridge Backend API running on http://localhost:${ENV.PORT}`);
      console.log(`📋 Health check: http://localhost:${ENV.PORT}/api/v1/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
