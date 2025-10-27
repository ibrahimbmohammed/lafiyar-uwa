/** @format */

import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import { errorHandler } from "./core/middleware/errorHandler.middleware";
import { apiLimiter } from "./core/middleware/rateLimit.middleware";
import logger from "./core/config/logger.config";

// Import routes (we'll create these next)
import healthRoutes from "./modules/health/health.routes";
import ussdRoutes from "./modules/ussd/routes/ussd.routes";

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(compression());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use("/api", apiLimiter);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    body: req.body,
    query: req.query,
  });
  next();
});

// Health check route
app.use("/health", healthRoutes);

app.use("/api/ussd", ussdRoutes);

// API routes will be mounted here

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
