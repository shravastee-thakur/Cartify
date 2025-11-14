import mongoose from "mongoose";
import logger from "./logger";

export const connectDb: () => Promise<void> = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL as string);
    logger.info("Database connected");
  } catch (error: any) {
    logger.error("MongoDB connection error: " + error.message);
    process.exit(1);
  }
};
