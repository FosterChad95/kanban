import {
  withAdminAuth,
  withAdminAuthAndValidation,
  withErrorHandling,
  createSuccessResponse,
} from "@/lib/api-utils";
import { CreateTeamSchema } from "@/schemas/api";
import { getAllTeams, createTeam } from "@/queries/teamQueries";

/**
 * GET /api/teams
 * Returns all teams with users and boards.
 * Only admins can access.
 */
export const GET = withErrorHandling(async () => {
  return withAdminAuth(async () => {
    const teams = await getAllTeams();

    // Transform to expected shape using our reusable transformer
    const transformedTeams = teams.map((team) => ({
      id: team.id,
      name: team.name,
      users: team.users.map((ut) => ut.user),
      boards: team.boards.map((tb) => tb.board),
    }));

    return createSuccessResponse(transformedTeams);
  });
});

/**
 * POST /api/teams
 * Creates a new team.
 * Only admins can create teams.
 */
export async function POST(req: Request) {
  return withErrorHandling(async () => {
    return withAdminAuthAndValidation(req, CreateTeamSchema, async (body) => {
      const team = await createTeam({
        name: body.name,
      });

      return createSuccessResponse(team, 201);
    });
  })();
}
