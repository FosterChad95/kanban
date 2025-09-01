import bcrypt from "bcryptjs";
import { createUser } from "@/queries/userQueries";
import { 
  withValidation, 
  withErrorHandling, 
  createSuccessResponse,
  createErrorResponse 
} from "@/lib/api-utils";
import { SignupSchema } from "@/schemas/api";

/**
 * POST /api/auth/signup
 * Create a new user account with email and password.
 */
export async function POST(req: Request) {
  return withErrorHandling(async () => {
    return withValidation(req, SignupSchema, async (body) => {
      const { email, password, name } = body;

      try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await createUser({
          email,
          name,
          hashedPassword,
        });

        // Remove sensitive fields before returning
        const { hashedPassword: _, ...safeUser } = user;

        return createSuccessResponse({ user: safeUser }, 201);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unable to create user";
        
        if (
          message.includes("Unique constraint failed") ||
          message.includes("duplicate key")
        ) {
          return createErrorResponse("Email already in use", 409);
        }

        throw err; // Let withErrorHandling catch other errors
      }
    });
  })();
}
