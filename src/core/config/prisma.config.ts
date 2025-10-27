/** @format */

//import { PrismaClient } from "../../generated/prisma/client";
import { PrismaClient } from "@prisma/client";
import logger from "./logger.config";

const prisma = new PrismaClient({
  log: [
    { level: "query", emit: "event" },
    { level: "error", emit: "stdout" },
    { level: "warn", emit: "stdout" },
  ],
});

// Log queries in development
if (process.env.NODE_ENV === "development") {
  prisma.$on("query", (e: any) => {
    logger.debug("Prisma Query:", {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    });
  });
}

// Handle connection errors
interface PrismaConnectionSuccess {
    message: string;
}

interface PrismaConnectionError {
    error: unknown;
}

prisma
    .$connect()
    .then((): PrismaConnectionSuccess => {
        logger.info("✅ Prisma connected to PostgreSQL");
        return { message: "Prisma connected to PostgreSQL" };
    })
    .catch((err: unknown): PrismaConnectionError => {
        logger.error("❌ Prisma connection failed:", err);
        process.exit(1);
        return { error: err };
    });

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
  logger.info("Prisma disconnected");
});

export { prisma };
