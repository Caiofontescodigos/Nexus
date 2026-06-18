export const env = {
  jwtSecret: process.env.JWT_SECRET || "nexus-jwt-secret-key-sd-ufersa-2026",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  usersTable: process.env.USERS_TABLE || "NexusUsers",
  tasksTable: process.env.TASKS_TABLE || "NexusTasks",
  region: process.env.AWS_REGION || "us-east-1",
};
