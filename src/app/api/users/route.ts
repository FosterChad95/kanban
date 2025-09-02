import { 
  withAdminAuth, 
  withErrorHandling, 
  createSuccessResponse 
} from "@/lib/api-utils";
import { getUserOptions } from "@/queries/userQueries";

/**
 * GET /api/users
 * List all users (id, name, avatar, email).
 * Only admins can access this endpoint.
 */
export const GET = withErrorHandling(async () => {
  return withAdminAuth(async () => {
    const userOptions = await getUserOptions();
    return createSuccessResponse(userOptions);
  });
});
