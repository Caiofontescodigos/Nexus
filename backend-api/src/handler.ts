import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { authenticate } from "./middlewares/auth.js";
import { authService } from "./services/authService.js";
import { taskService } from "./services/taskService.js";
import { userService } from "./services/userService.js";
import { formatError, AppError } from "./utils/errors.js";
import { registerSchema, loginSchema } from "./schemas/auth.js";
import { createTaskSchema, updateTaskSchema } from "./schemas/task.js";
import type { ZodSchema } from "zod";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Credentials": "true",
};

function response(statusCode: number, body?: unknown): APIGatewayProxyResult {
  return {
    statusCode,
    headers: corsHeaders,
    body: body !== undefined ? JSON.stringify(body) : "",
  };
}

function validate(schema: ZodSchema, data: unknown) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw result.error;
  }
  return result.data;
}

function getMethod(event: APIGatewayProxyEvent): string {
  return (event as any).requestContext?.http?.method || event.httpMethod || "GET";
}

function getPath(event: APIGatewayProxyEvent): string {
  return (event as any).rawPath || event.path || "/";
}

function getBody(event: APIGatewayProxyEvent): any {
  if (!event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch {
    return {};
  }
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (getMethod(event) === "OPTIONS") {
      return response(204);
    }

    const method = getMethod(event);
    const path = getPath(event);
    const body = getBody(event);

    if (path === "/auth/register" && method === "POST") {
      const data = validate(registerSchema, body);
      return response(201, await authService.register(data));
    }

    if (path === "/auth/login" && method === "POST") {
      const data = validate(loginSchema, body);
      return response(200, await authService.login(data));
    }

    if (path === "/auth/me" && method === "GET") {
      const user = authenticate(event);
      return response(200, await authService.getProfile(user.userId));
    }

    if (path === "/users/profile" && method === "PUT") {
      const user = authenticate(event);
      return response(200, await userService.updateProfile(user.userId, body));
    }

    if (path.startsWith("/tasks")) {
      const user = authenticate(event);

      if (path === "/tasks" && method === "GET") {
        return response(200, await taskService.list(user.userId));
      }

      if (path === "/tasks/stats" && method === "GET") {
        return response(200, await taskService.getStats(user.userId));
      }

      if (path === "/tasks" && method === "POST") {
        const data = validate(createTaskSchema, body);
        return response(201, await taskService.create(user.userId, data));
      }

      if (method === "GET") {
        const match = path.match(/^\/tasks\/([^/]+)$/);
        if (match) {
          return response(200, await taskService.getById(match[1], user.userId));
        }
      }

      if (method === "PUT") {
        const match = path.match(/^\/tasks\/([^/]+)$/);
        if (match) {
          const data = validate(updateTaskSchema, body);
          return response(200, await taskService.update(match[1], user.userId, data));
        }
      }

      if (method === "PATCH") {
        const match = path.match(/^\/tasks\/([^/]+)\/complete$/);
        if (match) {
          return response(200, await taskService.toggleComplete(match[1], user.userId));
        }
      }

      if (method === "DELETE") {
        const match = path.match(/^\/tasks\/([^/]+)$/);
        if (match) {
          await taskService.delete(match[1], user.userId);
          return response(204);
        }
      }
    }

    if (path === "/health" && method === "GET") {
      return response(200, { status: "ok", service: "nexus-api" });
    }

    return response(404, { error: "Route not found" });
  } catch (error) {
    const formatted = formatError(error as Error);
    return {
      ...formatted,
      headers: corsHeaders,
    };
  }
};
