/** @format */

import redisClient from "../config/redis.config";
import logger from "../config/logger.config";
import { ServiceUnavailableError } from "../utils/AppError";

export class RedisService {
  /**
   * Set a key-value pair with optional TTL (in seconds)
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);

      if (ttl) {
        await redisClient.setex(key, ttl, serializedValue);
      } else {
        await redisClient.set(key, serializedValue);
      }

      logger.debug(`Redis SET: ${key}`, { ttl });
    } catch (error) {
      logger.error("Redis SET error:", error);
      throw new ServiceUnavailableError("Cache service unavailable");
    }
  }

  /**
   * Get a value by key
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const value = await redisClient.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error("Redis GET error:", error);
      return null;
    }
  }

  /**
   * Delete a key
   */
  async delete(key: string): Promise<boolean> {
    try {
      const result = await redisClient.del(key);
      return result > 0;
    } catch (error) {
      logger.error("Redis DELETE error:", error);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      return false;
    }
  }

  /**
   * Set expiration on existing key
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      const result = await redisClient.expire(key, ttl);
      return result === 1;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton
export const redisService = new RedisService();
