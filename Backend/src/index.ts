import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { errorHandler } from "./middlewares/errorMiddleware";
import { connectDb } from "./utils/db";
import { connectRedis } from "./utils/redis";
import cookieParser from "cookie-parser";
import UserRouter from "./routes/UserRoute";

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
app.use(errorHandler);

// Routes
app.use("/api/v1/user", UserRouter);
// http://localhost:3000/api/v1/user/register

app.listen(PORT, () => {
  console.log(`Listening to port: http://localhost:${PORT}`);
});
