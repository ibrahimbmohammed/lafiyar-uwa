/** @format */

import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

export const prisma = new PrismaClient();

export const config = {
  app: {
    name: process.env.APP_NAME || "Lafiyar-Uwa",
    env: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "3000", 10),
  },
  database: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    name: process.env.DB_NAME || "lafiyar_uwa_dev",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
  },
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD || "",
  },
  africastalking: {
    username: process.env.AT_USERNAME || "sandbox",
    apiKey: process.env.AT_API_KEY || "",
    shortCode: process.env.AT_SHORT_CODE || "*347*1#",
    phoneNumber: process.env.AT_PHONE_NUMBER || "",
  },
  session: {
    timeout: parseInt(process.env.SESSION_TIMEOUT || "60", 10),
  },
  logging: {
    level: process.env.LOG_LEVEL || "info",
  },
  security: {
    apiKey: process.env.API_KEY || "change_me_in_production",
  },
};
