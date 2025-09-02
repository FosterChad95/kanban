import { NextResponse } from "next/server";
import { getCurrentUser } from "./auth";
import { z } from "zod";
import { getBoardsForUser, getBoardById } from "../queries/boardQueries";
import { HTTP_STATUS, ERROR_MESSAGES } from "../constants/api";
import { USER_ROLES } from "../constants/auth";
import { sanitizeObject } from "./sanitization";

// Standard API response types
export interface ApiSuccessResponse<T = any> {
  data?: T;
  message?: string;
}

export interface ApiErrorResponse {
  error: string;
  details?: unknown;
  code?: string;
  timestamp?: string;
}

// Standard error responses
export const createErrorResponse = (
  error: string,
  status: number,
  details?: unknown,
  code?: string
): NextResponse<ApiErrorResponse> => {
  const errorResponse: ApiErrorResponse = {
    error,
    timestamp: new Date().toISOString(),
    ...(details !== undefined && { details }),
    ...(code !== undefined && { code }),
  };
  return NextResponse.json(errorResponse, { status });
};

// Convenience functions for common errors
export const createUnauthorizedResponse = (message: string = ERROR_MESSAGES.UNAUTHORIZED) =>
  createErrorResponse(message, HTTP_STATUS.UNAUTHORIZED, undefined, "UNAUTHORIZED");

export const createForbiddenResponse = (message: string = ERROR_MESSAGES.FORBIDDEN) =>
  createErrorResponse(message, HTTP_STATUS.FORBIDDEN, undefined, "FORBIDDEN");

export const createNotFoundResponse = (message: string = ERROR_MESSAGES.NOT_FOUND) =>
  createErrorResponse(message, HTTP_STATUS.NOT_FOUND, undefined, "NOT_FOUND");

export const createValidationErrorResponse = (details?: unknown) =>
  createErrorResponse(
    ERROR_MESSAGES.VALIDATION_FAILED,
    HTTP_STATUS.BAD_REQUEST,
    details,
    "VALIDATION_ERROR"
  );

export const createInternalErrorResponse = (message: string = ERROR_MESSAGES.INTERNAL_SERVER_ERROR) =>
  createErrorResponse(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, undefined, "INTERNAL_ERROR");

export const createSuccessResponse = <T>(
  data?: T,
  status: number = HTTP_STATUS.OK,
  message?: string
): NextResponse<T | ApiSuccessResponse<T>> => {
  if (message) {
    const response: ApiSuccessResponse<T> = { message };
    if (data !== undefined) {
      response.data = data;
    }
    return NextResponse.json(response, { status });
  }

  if (data !== undefined) {
    return NextResponse.json(data, { status });
  }

  return NextResponse.json({} as T, { status });
};

// Auth middleware
export async function withAuth(
  handler: (
    user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>
  ) => Promise<NextResponse>
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return createUnauthorizedResponse();
    }
    return await handler(user);
  } catch (error) {
    console.error("Auth middleware error:", error);
    return createInternalErrorResponse();
  }
}

// Admin auth middleware
export async function withAdminAuth(
  handler: (
    user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>
  ) => Promise<NextResponse>
) {
  return withAuth(async (user) => {
    if (user.role !== USER_ROLES.ADMIN) {
      return createForbiddenResponse();
    }
    return await handler(user);
  });
}

// Request body validation middleware
export async function withValidation<T>(
  req: Request,
  schema: z.ZodSchema<T>,
  handler: (
    body: T,
    user?: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>
  ) => Promise<NextResponse>
) {
  try {
    const body = await req.json();
    
    // Sanitize the raw body first
    const sanitizedBody = sanitizeObject(body);
    
    // Then validate with schema
    const validationResult = schema.safeParse(sanitizedBody);

    if (!validationResult.success) {
      return createValidationErrorResponse(validationResult.error.issues);
    }

    return await handler(validationResult.data);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return createErrorResponse(ERROR_MESSAGES.INVALID_JSON, HTTP_STATUS.BAD_REQUEST);
    }
    console.error("Validation middleware error:", error);
    return createInternalErrorResponse();
  }
}

// Combined auth + validation middleware
export async function withAuthAndValidation<T>(
  req: Request,
  schema: z.ZodSchema<T>,
  handler: (
    body: T,
    user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>
  ) => Promise<NextResponse>
) {
  return withAuth(async (user) => {
    return withValidation(req, schema, (body) => handler(body, user));
  });
}

// Combined admin auth + validation middleware
export async function withAdminAuthAndValidation<T>(
  req: Request,
  schema: z.ZodSchema<T>,
  handler: (
    body: T,
    user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>
  ) => Promise<NextResponse>
) {
  return withAdminAuth(async (user) => {
    return withValidation(req, schema, (body) => handler(body, user));
  });
}

// Async error handler wrapper
export function withErrorHandling(handler: () => Promise<NextResponse>) {
  return async (): Promise<NextResponse> => {
    try {
      return await handler();
    } catch (error) {
      console.error("API Error:", error);
      return createInternalErrorResponse(
        error instanceof Error ? error.message : undefined
      );
    }
  };
}

// Params validation for dynamic routes
export async function validateParams<T>(
  params: Promise<Record<string, string>>,
  schema: z.ZodSchema<T>
): Promise<{ data: T; error?: never } | { data?: never; error: NextResponse }> {
  try {
    const resolvedParams = await params;
    const validationResult = schema.safeParse(resolvedParams);

    if (!validationResult.success) {
      return {
        error: createErrorResponse(
          ERROR_MESSAGES.INVALID_PARAMETERS,
          HTTP_STATUS.BAD_REQUEST,
          validationResult.error.issues,
          "INVALID_PARAMS"
        ),
      };
    }

    return { data: validationResult.data };
  } catch {
    return { error: createErrorResponse(ERROR_MESSAGES.FAILED_TO_RESOLVE_PARAMS, HTTP_STATUS.INTERNAL_SERVER_ERROR) };
  }
}

/**
 * Sanitize and validate request body
 */
export async function validateAndSanitizeBody<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<{ data: T; error?: never } | { data?: never; error: NextResponse }> {
  try {
    const rawBody = await req.json();
    
    // Sanitize the raw body first
    const sanitizedBody = sanitizeObject(rawBody);
    
    // Then validate with schema
    const validationResult = schema.safeParse(sanitizedBody);

    if (!validationResult.success) {
      return {
        error: createErrorResponse(
          ERROR_MESSAGES.VALIDATION_FAILED,
          HTTP_STATUS.BAD_REQUEST,
          validationResult.error.issues,
          "INVALID_BODY"
        ),
      };
    }

    return { data: validationResult.data };
  } catch (error) {
    return {
      error: createErrorResponse(
        error instanceof SyntaxError
          ? "Invalid JSON in request body"
          : ERROR_MESSAGES.VALIDATION_FAILED,
        HTTP_STATUS.BAD_REQUEST
      ),
    };
  }
}

// Board authorization middleware
export async function withBoardAuthorization(
  boardId: string,
  handler: (
    board: NonNullable<Awaited<ReturnType<typeof getBoardById>>>,
    user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>
  ) => Promise<NextResponse>
) {
  return withAuth(async (user) => {
    // Check if user has access to this board
    const accessibleBoards = await getBoardsForUser({
      id: user.id,
      role: user.role,
    });
    const accessibleBoardIds = accessibleBoards.map((b) => b.id);

    if (!accessibleBoardIds.includes(boardId)) {
      return createErrorResponse(ERROR_MESSAGES.FORBIDDEN_BOARD_ACCESS, HTTP_STATUS.FORBIDDEN);
    }

    const board = await getBoardById(boardId);
    if (!board) {
      return createNotFoundResponse(ERROR_MESSAGES.BOARD_NOT_FOUND);
    }

    return await handler(board, user);
  });
}

// Board authorization with validation middleware
export async function withBoardAuthorizationAndValidation<T>(
  req: Request,
  boardId: string,
  schema: z.ZodSchema<T>,
  handler: (
    body: T,
    board: NonNullable<Awaited<ReturnType<typeof getBoardById>>>,
    user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>
  ) => Promise<NextResponse>
) {
  return withBoardAuthorization(boardId, async (board, user) => {
    return withValidation(req, schema, (body) => handler(body, board, user));
  });
}
