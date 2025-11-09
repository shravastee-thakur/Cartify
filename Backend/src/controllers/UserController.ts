import { Request, Response, NextFunction } from "express";
import User from "../models/UserModel";
import sanitize from "mongo-sanitize";
import { registerSchema } from "../utils/zod";
import { redisClient } from "../utils/redis";
import transporter from "../utils/sendMail";
import crypto from "crypto";

export const Register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sanitizedbody = sanitize(req.body);

    const validation = registerSchema.safeParse(sanitizedbody);

    if (!validation.success) {
      const messages = validation.error.issues.map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    const { name, email, password } = validation.data;

    const rateLimitKey = `register-rate-limit:${req.ip}:${email}`;
    if (await redisClient.get(rateLimitKey)) {
      return res
        .status(429)
        .json({ message: "Too many requests, try again later" });
    }

    const userExist = await User.findOne({ email });
    if (userExist) {
      return res
        .status(402)
        .json({ success: false, message: "User already exists" });
    }

    const verifyToken = crypto.randomBytes(32).toString("hex");

    const verifyKey = `verify:${verifyToken}`;

    const dataToStore = JSON.stringify({
      name,
      email,
      password,
    });

    await redisClient.set(verifyKey, dataToStore, { EX: 300 });

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Verify your email for account creation",
      text: `Your account has been created with email: ${email}`,
    };

    await transporter.sendMail(mailOption);
    await redisClient.set(rateLimitKey, "true", {EX: 60})

    const user = await User.create({
      name,
      email,
      password,
    });

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      message: "User created successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const Login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email } = sanitize(req.body);
  } catch (error) {
    next(error);
  }
};
