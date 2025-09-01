import prisma from "@/lib/prisma";
import { 
  withAdminAuth, 
  withErrorHandling, 
  createSuccessResponse 
} from "@/lib/api-utils";

/**
 * GET /api/users
 * List all users (id, name, avatar, email).
 * Only admins can access this endpoint.
 */
export const GET = withErrorHandling(async () => {
  return withAdminAuth(async () => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        email: true,
      },
      orderBy: { name: "asc" },
    });

    // Transform to expected shape
    const userOptions = users.map(
      (user: {
        id: string;
        name: string | null;
        image?: string | null;
        email?: string | null;
      }) => ({
        id: user.id,
        name: user.name || "Unnamed User",
        avatar: user.image || undefined,
        email: user.email || undefined,
      })
    );

    return createSuccessResponse(userOptions);
  });
});
