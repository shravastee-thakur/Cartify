import { Request, Response, NextFunction } from "express";
import User from "../models/UserModel";
import sanitize from "mongo-sanitize";
import {
  loginSchema,
  otpVerificationSchema,
  registerSchema,
} from "../utils/zod";
import { redisClient } from "../utils/redis";
import transporter from "../utils/sendMail";
import crypto from "crypto";

// Constants
const VERIFICATION_TOKEN_EXPIRY = 300;
const OTP_RATE_LIMIT_DURATION = 300;
const OTP_EXPIRY = 300;


export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sanitizedBody = sanitize(req.body);

    // Input validation
    const validation = registerSchema.safeParse(sanitizedBody);
    if (!validation.success) {
      const messages = validation.error.issues.map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    const { name, email, password } = validation.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // Generate verification token
    const verifyToken = crypto.randomBytes(10).toString("hex");
    const verifyKey = `verify:${verifyToken}`;

    // Store user data in Redis for verification
    const userData = JSON.stringify({ name, email, password });
    await redisClient.set(verifyKey, userData, {
      EX: VERIFICATION_TOKEN_EXPIRY,
    });

    const verifyLink = `${process.env.FRONTEND_URL}/verify?token=${verifyToken}`;

    // Send verification email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Verify your email for account creation",
      html: `
    <h2>Email Verification</h2>
    <p>Hello ${name},</p>
    <p>Click the link below to verify your account:</p>
    <a href="${verifyLink}" style="padding:10px 15px;background:#4f46e5;color:#fff;border-radius:4px;text-decoration:none;">
      Verify Email
    </a>
    <p>This link will expire in 5 minutes.</p>
  `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message:
        "Verification email sent. Please check your email to complete registration.",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    const verifyKey = `verify:${token}`;
    const storedData = await redisClient.get(verifyKey);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    const userData = JSON.parse(storedData);
    const { name, email, password } = userData;

    // Create user after verification
    const user = await User.create({
      name,
      email,
      password,
      isVerified: true,
    });

    // Delete the verification token from Redis
    await redisClient.del(verifyKey);

    return res.status(201).json({
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

export const loginStepOne = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sanitizedBody = sanitize(req.body);
    const validation = loginSchema.safeParse(sanitizedBody);
    if (!validation.success) {
      const messages = validation.error.issues.map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    const { email, password } = validation.data;

    //  Rate limiting
    const loginRateLimitKey = `login-rate-limit:${req.ip}:${email}`;
    const loginAttempts = await redisClient.get(loginRateLimitKey);
    if (loginAttempts && parseInt(loginAttempts) >= 5) {
      return res.status(429).json({
        success: false,
        message: "Too many login attempts. Please try again in 15 minutes.",
      });
    }

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.login(email, password);

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // Store OTP in Redis
    const otpKey = `otp:${user._id}`;
    await redisClient.set(otpKey, otp, { EX: OTP_EXPIRY });

    // Send OTP email
    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Your 2FA Login OTP",
      html: `
          <p>Your OTP for login is: <strong>${otp}</strong></p>
          <p>This OTP will expire in 5 minutes.</p>
        `,
    };

    await transporter.sendMail(mailOption);

    // Update last login
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    await redisClient.del(loginRateLimitKey);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please verify to complete login.",
      userId: user._id,
    });
  } catch (error: any) {
    next(error);
  }
};

export const verifyLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sanitizeBody = sanitize(req.body);
    const validation = otpVerificationSchema.safeParse(sanitizeBody);

    if (!validation.success) {
      const messages = validation.error.issues.map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    const { userId, otp } = validation.data;

    if (!userId || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Missing userId or OTP" });
    }

    // Rate limiting for OTP attempts
    const otpRateLimitKey = `otp-rate-limit:${userId}`;
    const otpAttempts = await redisClient.get(otpRateLimitKey);
    if (otpAttempts && parseInt(otpAttempts) >= 3) {
      return res.status(429).json({
        success: false,
        message: "Too many OTP attempts. Please request a new OTP.",
      });
    }

    const otpKey = `otp:${userId}`;
    const storedOtp = await redisClient.get(otpKey);

    if (storedOtp !== otp) {
      const currentAttempts = await redisClient.incr(otpRateLimitKey);
      if (currentAttempts === 1) {
        await redisClient.expire(otpRateLimitKey, OTP_RATE_LIMIT_DURATION);
      }

      return res.status(401).json({ success: false, message: "Invalid OTP" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await redisClient.del(otpKey);
    await redisClient.del(otpRateLimitKey);

    await User.findByIdAndUpdate(userId, { lastLogin: new Date() });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
