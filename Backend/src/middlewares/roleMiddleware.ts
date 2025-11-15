import { NextFunction, Request, Response } from "express";

export interface AuthRequest extends Request {
  user: {
    role: string;
    user: string;
  };
}

const allowRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes((req as AuthRequest).user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied: insufficient permissions" });
    }
    next();
  };
};

export default allowRole;
