/** @format */

import app from "./app";
import { config } from "./core/config";
import logger from "./core/config/logger.config";
import redisClient from "./core/config/redis.config";
import {prisma} from "./core/config/prisma.config";

const PORT = config.app.port;

// Test Prisma connection
async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info("✅ Database connection successful");
  } catch (error) {
    logger.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

// Test Redis connection
async function checkRedisConnection() {
  try {
    await redisClient.ping();
    logger.info("✅ Redis connection successful");
  } catch (error) {
    logger.error("❌ Redis connection failed:", error);
    process.exit(1);
  }
}

// Start server
async function startServer() {
  await checkDatabaseConnection();
  await checkRedisConnection();

  app.listen(PORT, () => {
    logger.info(`🚀 ${config.app.name} server running on port ${PORT}`);
    logger.info(`📝 Environment: ${config.app.env}`);
    logger.info(`📡 USSD Endpoint: http://localhost:${PORT}/api/ussd`);
  });
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM signal received: closing HTTP server");
  await prisma.$disconnect();
  await redisClient.quit();
  process.exit(0);
});

startServer();
