import {
  getBoardById,
  updateBoard,
  deleteBoard,
  getBoardsForUser,
} from "../../../../queries/boardQueries";
import { 
  withAuth, 
  withAuthAndValidation, 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  validateParams 
} from "../../../../lib/api-utils";
import { IdParamSchema, UpdateBoardSchema } from "../../../../schemas/api";

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

    return withAuth(async (user) => {
      // Check if user has access to this board
      const accessibleBoards = await getBoardsForUser({
        id: user.id,
        role: user.role,
      });
      const accessibleBoardIds = accessibleBoards.map((b) => b.id);

      if (!accessibleBoardIds.includes(validatedParams.id)) {
        return createErrorResponse("Board not found or access denied", 403);
      }

      const board = await getBoardById(validatedParams.id);
      if (!board) {
        return createErrorResponse("Board not found", 404);
      }
      
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

    return withAuthAndValidation(req, UpdateBoardSchema, async (body, user) => {
      // Check if user has access to this board
      const accessibleBoards = await getBoardsForUser({
        id: user.id,
        role: user.role,
      });
      const accessibleBoardIds = accessibleBoards.map((b) => b.id);

      if (!accessibleBoardIds.includes(validatedParams.id)) {
        return createErrorResponse("Board not found or access denied", 403);
      }

      const updated = await updateBoard(validatedParams.id, body as any);
      return createSuccessResponse(updated);
    });
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

    return withAuth(async (user) => {
      // Check if user has access to this board
      const accessibleBoards = await getBoardsForUser({
        id: user.id,
        role: user.role,
      });
      const accessibleBoardIds = accessibleBoards.map((b) => b.id);

      if (!accessibleBoardIds.includes(validatedParams.id)) {
        return createErrorResponse("Board not found or access denied", 403);
      }

      const board = await getBoardById(validatedParams.id);
      if (!board) {
        return createErrorResponse("Board not found", 404);
      }

      if (board.teams && board.teams.length > 0) {
        return createErrorResponse("Cannot delete a board that belongs to a team", 403);
      }

      await deleteBoard(validatedParams.id);
      return createSuccessResponse({ success: true });
    });
  })();
}
