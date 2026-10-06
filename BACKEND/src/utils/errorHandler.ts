import type { ErrorHandler } from "hono";

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof AppError) {
    return c.json(
      {
        success: false,
        message: err.message,
      },
      err.statusCode as any
    );
  }

  // Log the real error server-side; never leak internals to the client.
  console.error("[unhandled error]", err);

  const isProduction = process.env.NODE_ENV === "production";
  const message =
    !isProduction && err instanceof Error && err.message
      ? err.message
      : "Internal Server Error";

  return c.json(
    {
      success: false,
      message,
    },
    500
  );
};

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true
  ) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, 400);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, 409);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Internal server error") {
    super(message, 500);
  }
}