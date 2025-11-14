import dotenv from "dotenv";
dotenv.config();
import { createClient } from "redis";
import logger from "./logger";

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  logger.info("Missing redis url");
  process.exit(1);
}

export const redisClient = createClient({
  url: redisUrl,
});

export const connectRedis: () => Promise<void> = async () => {
  try {
    await redisClient.connect();
    logger.info("Connected to redis");
  } catch (error: any) {
    logger.error("Error in redis connection", error.message);
    process.exit(1);
  }
};
