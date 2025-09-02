import { 
  withAdminAuth, 
  withAdminAuthAndValidation, 
  withErrorHandling, 
  createSuccessResponse,
  createErrorResponse,
  validateParams 
} from "@/lib/api-utils";
import { IdParamSchema, UpdateUserSchema } from "@/schemas/api";
import { getUserById, deleteUser, isEmailTaken, updateUserProfile } from "@/queries/userQueries";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants/api";

/**
 * PUT /api/users/:id
 * Update user by ID. Only admins can update users.
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { data: validatedParams, error } = await validateParams(params, IdParamSchema);
    if (error) return error;

    return withAdminAuthAndValidation(req, UpdateUserSchema, async (body) => {
      const { name, email, avatar } = body;

      // Check if email is already taken by another user
      if (email) {
        const emailTaken = await isEmailTaken(email, validatedParams.id);
        if (emailTaken) {
          return createErrorResponse(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, 400);
        }
      }

      // Update user using query layer
      const updatedUser = await updateUserProfile(validatedParams.id, {
        name,
        email,
        avatar,
      });

      return createSuccessResponse(updatedUser);
    });
  })();
}

/**
 * DELETE /api/users/:id
 * Delete user by ID. Only admins can delete users.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { data: validatedParams, error } = await validateParams(params, IdParamSchema);
    if (error) return error;

    return withAdminAuth(async () => {
      // Check if user exists using query layer
      const existingUser = await getUserById(validatedParams.id);

      if (!existingUser) {
        return createErrorResponse(ERROR_MESSAGES.USER_NOT_FOUND, 404);
      }

      // Delete user using query layer
      await deleteUser(validatedParams.id);
      
      return createSuccessResponse({ message: SUCCESS_MESSAGES.USER_DELETED });
    });
  })();
}
