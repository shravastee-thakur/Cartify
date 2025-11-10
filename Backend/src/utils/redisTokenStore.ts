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
  return await redisClient.get(refreshKey(userId));
};

// Delete stored refresh token

export const deleteRefreshToken = async (userId: string): Promise<void> => {
  await redisClient.del(refreshKey(userId));
};
