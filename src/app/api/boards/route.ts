import { createBoard, getBoardsForUser } from "../../../queries/boardQueries";
import { withAuth, withAuthAndValidation, withErrorHandling, createSuccessResponse } from "../../../lib/api-utils";
import { CreateBoardSchema } from "../../../schemas/api";
import prisma from "../../../lib/prisma";

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

      const created = await createBoard({
        name: body.name,
        ...(columnNames.length > 0
          ? { columns: { create: columnNames.map((name) => ({ name })) } }
          : {}),
      });

      // Link the new board to the user
      await prisma.userBoard.create({
        data: {
          userId: user.id,
          boardId: created.id,
        },
      });

      return createSuccessResponse(created, 201);
    });
  })();
}
