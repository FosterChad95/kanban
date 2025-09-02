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
      async (body) => {
        const updated = await updateBoard(validatedParams.id, body);
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

    return withBoardAuthorization(validatedParams.id, async (board) => {
      if (board.teams && board.teams.length > 0) {
        return createErrorResponse(ERROR_MESSAGES.CANNOT_DELETE_TEAM_BOARD, 403);
      }

      await deleteBoard(validatedParams.id);
      return createSuccessResponse({ success: true });
    });
  })();
}
