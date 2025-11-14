import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { errorHandler } from "./middlewares/errorMiddleware";
import { connectDb } from "./utils/db";
import { connectRedis } from "./utils/redis";
import cookieParser from "cookie-parser";
import UserRouter from "./routes/UserRoute";
import logger from "./utils/logger";

const app: Express = express();

dotenv.config();

const PORT = process.env.PORT || 5000;

// Database
connectDb();
connectRedis();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Routes
app.use("/api/v1/user", UserRouter);
// http://localhost:3000/api/v1/user/register

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server started on http://localhost:${PORT}`);
});
