import { verifyToken } from "../utils/jwt.js";
import { AppError } from "../utils/errors.js";
import type { JwtPayload } from "../types/index.js";
import type { APIGatewayProxyEvent } from "aws-lambda";

export function authenticate(event: APIGatewayProxyEvent): JwtPayload {
  const authHeader =
    event.headers?.Authorization ||
    event.headers?.authorization ||
    "";

  if (!authHeader.startsWith("Bearer ")) {
    throw new AppError(401, "Token not provided");
  }

  const token = authHeader.split(" ")[1];

  try {
    return verifyToken(token);
  } catch {
    throw new AppError(401, "Invalid or expired token");
  }
}
