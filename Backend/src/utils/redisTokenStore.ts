import { redisClient } from "./redis";
import { hashToken } from "./jwtToken";

const REFRESH_EXPIRES_SECONDS = 604800;

const refreshKey = (userId: string) => `refresh:${userId}`;

export const storeRefreshToken = async (
  userId: string,
  refreshTokenPlain: string
): Promise<void> => {
  const hashed = hashToken(refreshTokenPlain);
  await redisClient.set(refreshKey(userId), hashed, {
    EX: REFRESH_EXPIRES_SECONDS,
  });
};

// Get hashed refresh token from Redis

export const getStoredHashedRefreshToken = async (
  userId: string
): Promise<string | null> => {
  const data = await redisClient.get(refreshKey(userId));
  if (!data) return null;
  return JSON.parse(data).hashed;
};

// Delete stored refresh token

export const deleteRefreshToken = async (hashedToken: string) => {
  await redisClient.del(`refresh:${hashedToken}`);
};
