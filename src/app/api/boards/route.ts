import { createBoardForUser, getBoardsForUser } from "../../../queries/boardQueries";
import { withAuth, withAuthAndValidation, withErrorHandling, createSuccessResponse } from "../../../lib/api-utils";
import { CreateBoardSchema } from "../../../schemas/api";

/**
 * GET /api/boards
 * Returns all boards for the authenticated user.
 */
export const GET = withErrorHandling(async () => {
  return withAuth(async (user) => {
    const boards = await getBoardsForUser({ id: user.id, role: user.role });
    return createSuccessResponse(boards);
  });
});

/**
 * POST /api/boards
 * Create a new board with optional columns.
 */
export async function POST(req: Request) {
  return withErrorHandling(async () => {
    return withAuthAndValidation(req, CreateBoardSchema, async (body, user) => {
      const columnNames = body.columns
        .map((c) => c.name.trim())
        .filter((n) => n.length > 0);

      const created = await createBoardForUser(
        {
          name: body.name,
          ...(columnNames.length > 0 && { columns: columnNames.map((name) => ({ name })) }),
        },
        user.id
      );

      return createSuccessResponse(created, 201);
    });
  })();
}
