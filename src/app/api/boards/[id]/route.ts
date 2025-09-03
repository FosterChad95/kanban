import {
  updateBoard,
  deleteBoard,
} from "../../../../queries/boardQueries";
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  validateParams,
  withBoardAuthorization,
  withBoardAuthorizationAndValidation
} from "../../../../lib/api-utils";
import { ERROR_MESSAGES } from "../../../../constants/api";
import { IdParamSchema, UpdateBoardSchema } from "../../../../schemas/api";
import { triggerBoardUpdated, triggerBoardDeleted } from "../../../../lib/pusher-events";
import prisma from "../../../../lib/prisma";

/**
 * GET /api/boards/:id
 * Returns a single board by id, only if the user has access.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { data: validatedParams, error } = await validateParams(params, IdParamSchema);
    if (error) return error;

    return withBoardAuthorization(validatedParams.id, async (board) => {
      return createSuccessResponse(board);
    });
  })();
}

/**
 * PUT /api/boards/:id
 * Update a board by id with validation and authorization.
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { data: validatedParams, error } = await validateParams(params, IdParamSchema);
    if (error) return error;

    return withBoardAuthorizationAndValidation(
      req,
      validatedParams.id,
      UpdateBoardSchema,
      async (body, board, user) => {
        const updated = await updateBoard(validatedParams.id, body);
        
        // Trigger real-time event for board update
        await triggerBoardUpdated(updated.id, updated, user.id);
        
        return createSuccessResponse(updated);
      }
    );
  })();
}

/**
 * DELETE /api/boards/:id
 * Delete a board by id with proper authorization checks.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { data: validatedParams, error } = await validateParams(params, IdParamSchema);
    if (error) return error;

    return withBoardAuthorization(validatedParams.id, async (board, user) => {
      if (board.teams && board.teams.length > 0) {
        return createErrorResponse(ERROR_MESSAGES.CANNOT_DELETE_TEAM_BOARD, 403);
      }

      // Get users with board access BEFORE deleting the board
      const getUsersWithBoardAccess = async (boardId: string): Promise<string[]> => {
        const boardAccess = await prisma.board.findUnique({
          where: { id: boardId },
          include: {
            users: { include: { user: true } },
            teams: { 
              include: { 
                team: { 
                  include: { 
                    users: { include: { user: true } } 
                  } 
                } 
              } 
            },
          },
        });

        if (!boardAccess) return [];

        const userIds = new Set<string>();
        
        // Add direct board users
        boardAccess.users.forEach((ub: any) => userIds.add(ub.user.id));
        
        // Add team users
        boardAccess.teams.forEach((tb: any) => {
          tb.team.users.forEach((tu: any) => userIds.add(tu.user.id));
        });

        return Array.from(userIds);
      };

      const affectedUserIds = await getUsersWithBoardAccess(validatedParams.id);

      await deleteBoard(validatedParams.id);
      
      // Trigger real-time event for board deletion with pre-fetched user list
      await triggerBoardDeleted(validatedParams.id, user.id, affectedUserIds);
      
      return createSuccessResponse({ success: true });
    });
  })();
}
