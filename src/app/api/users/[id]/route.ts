import prisma from "@/lib/prisma";
import { 
  withAdminAuth, 
  withAdminAuthAndValidation, 
  withErrorHandling, 
  createSuccessResponse,
  createErrorResponse,
  validateParams 
} from "@/lib/api-utils";
import { IdParamSchema, UpdateUserSchema } from "@/schemas/api";

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
        const existingUser = await prisma.user.findFirst({
          where: {
            email,
            NOT: { id: validatedParams.id }
          }
        });

        if (existingUser) {
          return createErrorResponse("Email already in use by another user", 400);
        }
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id: validatedParams.id },
        data: {
          ...(name && { name }),
          ...(email && { email }),
          ...(avatar && { image: avatar })
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
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
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: validatedParams.id }
      });

      if (!existingUser) {
        return createErrorResponse("User not found", 404);
      }

      await prisma.user.delete({
        where: { id: validatedParams.id },
      });
      
      return createSuccessResponse({ message: "User deleted successfully" });
    });
  })();
}
