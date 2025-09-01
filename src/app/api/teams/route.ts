import prisma from "@/lib/prisma";
import {
  withAdminAuth,
  withAdminAuthAndValidation,
  withErrorHandling,
  createSuccessResponse,
} from "@/lib/api-utils";
import { CreateTeamSchema } from "@/schemas/api";

/**
 * GET /api/teams
 * Returns all teams with users and boards.
 * Only admins can access.
 */
export const GET = withErrorHandling(async () => {
  return withAdminAuth(async () => {
    const teams = await prisma.team.findMany({
      include: {
        users: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
        boards: {
          include: {
            board: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    // Transform to expected shape
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
      const team = await prisma.team.create({
        data: { name: body.name },
      });

      return createSuccessResponse(team, 201);
    });
  })();
}
