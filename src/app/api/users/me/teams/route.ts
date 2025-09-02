import { getTeamsForUserSimple } from "@/queries/teamQueries";
import { withAuth, withErrorHandling, createSuccessResponse } from "@/lib/api-utils";

/**
 * GET /api/users/me/teams
 * Returns all teams the current user belongs to.
 */
export const GET = withErrorHandling(async () => {
  return withAuth(async (user) => {
    const teams = await getTeamsForUserSimple(user.id);
    return createSuccessResponse(teams);
  });
});
