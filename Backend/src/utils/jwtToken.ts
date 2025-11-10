import jwt from "jsonwebtoken";
import crypto from "crypto";

interface JwtUserPayload {
  id: string;
  role: string;
}

export const generateAccessToken = (user: JwtUserPayload) => {
  const secretAccess = process.env.ACCESS_SECRET as string;
  return jwt.sign({ id: user.id, role: user.role }, secretAccess, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (size = 64) => {
  return crypto.randomBytes(size).toString("hex");
};

export const verifyAccessToken = (token: string): JwtUserPayload => {
  const secretAccess = process.env.ACCESS_SECRET as string;
  try {
    return jwt.verify(token, secretAccess) as JwtUserPayload;
  } catch (error) {
    throw new Error("Invalid or expired access token");
  }
};

export const hashToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
