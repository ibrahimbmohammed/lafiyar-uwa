/** @format */

import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../utils/AppError";
import { config } from "../config";

/**
 * Simple API Key authentication for Africa's Talking webhooks
 */
export const authenticateWebhook = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apiKey = req.headers["x-api-key"] as string;

  if (!apiKey || apiKey !== config.security.apiKey) {
    return next(new UnauthorizedError("Invalid or missing API key"));
  }

  next();
};
