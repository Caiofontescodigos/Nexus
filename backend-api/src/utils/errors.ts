import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function formatError(err: Error): { statusCode: number; body: string } {
  if (err instanceof AppError) {
    return {
      statusCode: err.statusCode,
      body: JSON.stringify({ error: err.message }),
    };
  }

  if (err instanceof ZodError) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Validation error",
        details: err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      }),
    };
  }

  console.error("Unhandled error:", err);
  return {
    statusCode: 500,
    body: JSON.stringify({ error: "Internal server error" }),
  };
}
