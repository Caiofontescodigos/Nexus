import "dotenv/config";

export const env = {
  port: parseInt(process.env.PORT || "3001", 10),
  databaseUrl: process.env.DATABASE_URL || "postgresql://nexus:nexus123@localhost:5432/nexusdb?schema=public",
  jwtSecret: process.env.JWT_SECRET || "nexus-jwt-secret-key-sd-ufersa-2026",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
};
