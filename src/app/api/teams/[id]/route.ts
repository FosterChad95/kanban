import { updateTeam, getTeamById, deleteTeam } from "@/queries/teamQueries";
import { 
  withAdminAuth, 
  withAdminAuthAndValidation, 
  withErrorHandling, 
  createSuccessResponse,
  createErrorResponse,
  validateParams 
} from "@/lib/api-utils";
import { IdParamSchema, UpdateTeamSchema } from "@/schemas/api";
import { triggerTeamUpdated, triggerTeamDeleted } from "@/lib/pusher-events";

/**
 * PUT /api/teams/:id
 * Update a team with new name, users, and boards.
 * Only admins can update teams.
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { data: validatedParams, error } = await validateParams(params, IdParamSchema);
    if (error) return error;

    return withAdminAuthAndValidation(req, UpdateTeamSchema, async (body, user) => {
      // Extract IDs from user and board objects
      const userIds = body.users.map((u) => u.id).filter(Boolean);
      const boardIds = body.boards.map((b) => b.id).filter(Boolean);

      // Update team using the query helper
      const updatedTeam = await updateTeam(validatedParams.id, {
        name: body.teamName,
        userIds,
        boardIds
      });

      // Trigger real-time event for team update
      await triggerTeamUpdated(updatedTeam, user.id);

      return createSuccessResponse(updatedTeam);
    });
  })();
}

/**
 * DELETE /api/teams/:id  
 * Delete a team by ID.
 * Only admins can delete teams.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { data: validatedParams, error } = await validateParams(params, IdParamSchema);
    if (error) return error;

    return withAdminAuth(async (user) => {
      // Check if team exists
      const existingTeam = await getTeamById(validatedParams.id);

      if (!existingTeam) {
        return createErrorResponse("Team not found", 404);
      }

      await deleteTeam(validatedParams.id);

      // Trigger real-time event for team deletion
      await triggerTeamDeleted(validatedParams.id, user.id);

      return createSuccessResponse({ message: "Team deleted successfully" });
    });
  })();
}
