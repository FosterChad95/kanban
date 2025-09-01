import { NextResponse } from "next/server";
import { getCurrentUser } from "./auth";
import { z } from "zod";

// Standard API response types
export interface ApiSuccessResponse<T = any> {
  data?: T;
  message?: string;
}

export interface ApiErrorResponse {
  error: string;
  details?: any;
}

// Standard error responses
export const createErrorResponse = (
  error: string,
  status: number,
  details?: any
): NextResponse<ApiErrorResponse> => {
  return NextResponse.json({ error, ...(details && { details }) }, { status });
};

export const createSuccessResponse = <T>(
  data?: T,
  status: number = 200,
  message?: string
): NextResponse<ApiSuccessResponse<T>> => {
  return NextResponse.json(
    { ...(data && { data }), ...(message && { message }) },
    { status }
  );
};

// Auth middleware
export async function withAuth(
  handler: (user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>) => Promise<NextResponse>
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return createErrorResponse("Unauthorized", 401);
    }
    return await handler(user);
  } catch (error) {
    console.error("Auth middleware error:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

// Admin auth middleware
export async function withAdminAuth(
  handler: (user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>) => Promise<NextResponse>
) {
  return withAuth(async (user) => {
    if (user.role !== "ADMIN") {
      return createErrorResponse("Forbidden - Admin access required", 403);
    }
    return await handler(user);
  });
}

// Request body validation middleware
export async function withValidation<T>(
  req: Request,
  schema: z.ZodSchema<T>,
  handler: (body: T, user?: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>) => Promise<NextResponse>
) {
  try {
    const body = await req.json();
    const validationResult = schema.safeParse(body);
    
    if (!validationResult.success) {
      return createErrorResponse(
        "Validation failed",
        400,
        validationResult.error.issues
      );
    }

    return await handler(validationResult.data);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return createErrorResponse("Invalid JSON", 400);
    }
    console.error("Validation middleware error:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

// Combined auth + validation middleware
export async function withAuthAndValidation<T>(
  req: Request,
  schema: z.ZodSchema<T>,
  handler: (body: T, user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>) => Promise<NextResponse>
) {
  return withAuth(async (user) => {
    return withValidation(req, schema, (body) => handler(body, user));
  });
}

// Combined admin auth + validation middleware
export async function withAdminAuthAndValidation<T>(
  req: Request,
  schema: z.ZodSchema<T>,
  handler: (body: T, user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>) => Promise<NextResponse>
) {
  return withAdminAuth(async (user) => {
    return withValidation(req, schema, (body) => handler(body, user));
  });
}

// Async error handler wrapper
export function withErrorHandling(
  handler: () => Promise<NextResponse>
) {
  return async (): Promise<NextResponse> => {
    try {
      return await handler();
    } catch (error) {
      console.error("API Error:", error);
      return createErrorResponse(
        error instanceof Error ? error.message : "Internal server error",
        500
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
      return { error: createErrorResponse("Invalid parameters", 400, validationResult.error.issues) };
    }
    
    return { data: validationResult.data };
  } catch (error) {
    return { error: createErrorResponse("Failed to resolve parameters", 500) };
  }
}