import { addUserToTeam } from "@/queries/teamQueries";
import { 
  withAdminAuthAndValidation, 
  withErrorHandling, 
  createSuccessResponse,
  createErrorResponse 
} from "@/lib/api-utils";
import { z } from "zod";
import { triggerTeamUserAdded } from "@/lib/pusher-events";

const AddUserToTeamSchema = z.object({
  teamId: z.string().min(1),
  userId: z.string().min(1),
});

/**
 * POST /api/teams/add-user
 * Body: { teamId: string, userId: string }
 * Only admins can add users to teams.
 */
export async function POST(req: Request) {
  return withErrorHandling(async () => {
    return withAdminAuthAndValidation(req, AddUserToTeamSchema, async (body, user) => {
      try {
        const userTeam = await addUserToTeam(body.userId, body.teamId);
        
        // Trigger real-time event for user added to team
        await triggerTeamUserAdded(body.teamId, body.userId, user.id);
        
        return createSuccessResponse(userTeam, 201);
      } catch (error) {
        if (error instanceof Error && error.message === "User already in team") {
          return createErrorResponse("User already in team", 400);
        }
        throw error;
      }
    });
  })();
}
