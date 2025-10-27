/** @format */

import { Request, Response } from "express";
import {prisma} from "../../core/config/prisma.config";
import redisClient from "../../core/config/redis.config";

export const healthController = async (req: Request, res: Response) => {
  const health = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    checks: {
      database: {
        status: "unchecked",
        responseTime: 0,
        error: null as string | null,
      },
      redis: {
        status: "unchecked",
        responseTime: 0,
        error: null as string | null,
      },
    },
  };

  // Database check
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbEnd = Date.now();

    health.checks.database = {
      status: "healthy",
      responseTime: dbEnd - dbStart,
      error: null,
    };
  } catch (error: any) {
    health.checks.database = {
      status: "unhealthy",
      responseTime: 0,
      error: error.message,
    };
  }

  // Redis check
  try {
    const redisStart = Date.now();
    await redisClient.ping();
    const redisEnd = Date.now();

    health.checks.redis = {
      status: "healthy",
      responseTime: redisEnd - redisStart,
      error: null,
    };
  } catch (error: any) {
    health.checks.redis = {
      status: "unhealthy",
      responseTime: 0,
      error: error.message,
    };
  }

  // Determine overall status
  const isHealthy =
    health.checks.database.status === "healthy" &&
    health.checks.redis.status === "healthy";

  const statusCode = isHealthy ? 200 : 503;
  health.message = isHealthy ? "OK" : "Service Unavailable";

  res.status(statusCode).json(health);
};
