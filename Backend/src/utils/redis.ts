import dotenv from "dotenv";
dotenv.config();
import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  console.log("Missing redis url");
  process.exit(1);
}

export const redisClient = createClient({
  url: redisUrl,
});

export const connectRedis: () => Promise<void> = async () => {
  try {
    await redisClient.connect();
    console.log("Connected to redis");
  } catch (error: any) {
    console.log("Error in redis connection", error.message);
    process.exit(1);
  }
};
