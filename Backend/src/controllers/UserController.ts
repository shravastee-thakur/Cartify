import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import User from "../models/UserModel";
import sanitize from "mongo-sanitize";
import {
  loginSchema,
  otpVerificationSchema,
  registerSchema,
  updateUserSchema,
} from "../utils/zod";
import { redisClient } from "../utils/redis";
import transporter from "../utils/sendMail";
import crypto from "crypto";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from "../utils/jwtToken";
import {
  deleteRefreshToken,
  getStoredHashedRefreshToken,
  storeRefreshToken,
} from "../utils/redisTokenStore";

// Constants
const VERIFICATION_TOKEN_EXPIRY = 300;
const OTP_RATE_LIMIT_DURATION = 300;
const OTP_EXPIRY = 300;
const RESET_TOKEN_EXPIRY = 300;
const REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME || "refreshToken";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as "lax" | "strict" | "none",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

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

    return res.status(201).json({
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
        id: user.id,
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
    const otpKey = `otp:${user.id}`;
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
    await User.findByIdAndUpdate(user.id, { lastLogin: new Date() });

    await redisClient.del(loginRateLimitKey);

    return res.status(201).json({
      success: true,
      message: "OTP sent to your email. Please verify to complete login.",
      userId: user.id,
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

    const accessToken = generateAccessToken({
      id: user.id.toString(),
      role: user.role,
    });

    const refreshToken = generateRefreshToken();
    await storeRefreshToken(user.id.toString(), refreshToken);

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions);

    await redisClient.del(otpKey);
    await redisClient.del(otpRateLimitKey);

    await User.findByIdAndUpdate(userId, { lastLogin: new Date() });

    return res.status(201).json({
      success: true,
      message: "OTP verified successfully",
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is missing from token",
      });
    }

    const user = await User.findById(userId).select(
      "-password -refreshToken -otp -twoFactorSecret"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        city: user.city,
        pinCode: user.pinCode,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!rawToken) {
      return res
        .status(401)
        .json({ success: false, message: "No refresh token received" });
    }

    const userId = req.body.userId || req.query.userId || undefined;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "userId required to refresh" });
    }

    const storedHashed = await getStoredHashedRefreshToken(userId);
    const presentedHashed = hashToken(rawToken);

    if (!storedHashed) {
      res.clearCookie(REFRESH_COOKIE_NAME);
      return res.status(403).json({
        success: false,
        message: "Refresh token revoked. Please login again.",
      });
    }

    if (storedHashed !== presentedHashed) {
      await deleteRefreshToken(userId);
      res.clearCookie(REFRESH_COOKIE_NAME);
      return res.status(403).json({
        success: false,
        message: "Possible token reuse detected. Please login again.",
      });
    }

    const newRefreshToken = generateRefreshToken();
    await storeRefreshToken(userId, newRefreshToken);

    res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, cookieOptions);

    const user = await User.findById(userId);
    if (!user) {
      await deleteRefreshToken(userId);
      res.clearCookie(REFRESH_COOKIE_NAME);
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const newAccessToken = generateAccessToken({
      id: user.id.toString(),
      role: user.role,
    });
    return res.status(201).json({
      success: true,
      accessToken: newAccessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user.id;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Old password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    return res
      .status(201)
      .json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};

export const forgetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(10).toString("hex");
    const hashResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const resetKey = `resetToken:${user.id}`;
    await redisClient.set(resetKey, hashResetToken, {
      EX: RESET_TOKEN_EXPIRY,
    });

    user.resetPasswordExpiresAt = new Date(
      Date.now() + RESET_TOKEN_EXPIRY * 1000
    );
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/new-password?token=${resetToken}&id=${user.id}`;

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Reset Your Password",
      html: `
        <p>You requested to reset your password.</p>
        <p>Click the link below to reset it:</p>
        <a href="${resetLink}" style="display:inline-block;padding:10px 14px;background:#4f46e5;color:#fff;border-radius:6px;text-decoration:none;">Reset Password</a>
        <p>This link will expire in 5 minutes.</p>
      `,
    };
    await transporter.sendMail(mailOption);

    return res.status(201).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, token, newPassword } = req.body;
    if (!userId || !token || !newPassword) {
      return res.status(400).json({
        message: "userId, token and newPassword are required.",
      });
    }

    const hashToken = crypto.createHash("sha256").update(token).digest("hex");

    const resetKey = `resetToken:${userId}`;
    const storedHash = await redisClient.get(resetKey);
    if (!storedHash || storedHash !== hashToken) {
      return res.status(400).json({
        message: "Reset token is invalid or expired.",
      });
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.password = newPassword;
    await user.save();

    await redisClient.del(resetKey);
    return res.status(201).json({
      success: true,
      message: "Password has been successfully reset.",
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const sanitizeBody = sanitize(req.body);
    delete sanitizeBody.userId;
    delete sanitizeBody.email;
    delete sanitizeBody.password;
    delete sanitizeBody.role;

    const validation = updateUserSchema.safeParse(sanitizeBody);
    if (!validation.success) {
      const messages = validation.error.issues.map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    const updates = validation.data;

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password -refreshToken -otp -twoFactorSecret");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        city: user.city,
        pinCode: user.pinCode,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];

    if (token) {
      const userId = req.body.userId || req.query.userId;
      if (userId) {
        await deleteRefreshToken(userId);
      }
    }
    const userId = req.body.userId || req.query.userId;
    if (userId) {
      await deleteRefreshToken(userId);
    }

    res.clearCookie(REFRESH_COOKIE_NAME);
    return res
      .status(201)
      .json({ success: true, message: "User logged out successfully" });
  } catch (error) {
    next(error);
  }
};
