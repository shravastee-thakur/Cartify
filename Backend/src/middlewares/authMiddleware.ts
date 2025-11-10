import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwtToken";
import User from "../models/UserModel";

export interface AuthRequest extends Request {
  user: {
    id: string;
    role: string;
  };
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth?.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: No token provided" });
    }

    const token = auth.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token missing",
      });
    }

    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User no longer exists",
      });
    }

    (req as AuthRequest).user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error: any) {
    return res
      .status(401)
      .json({ success: false, message: error.message || "Unauthorized" });
  }
};
