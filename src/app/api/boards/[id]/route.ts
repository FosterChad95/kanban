import { NextResponse } from "next/server";
import {
  getBoardById,
  updateBoard,
  deleteBoard,
  getBoardsForUser,
} from "../../../../queries/boardQueries";
import { getCurrentUser } from "../../../../lib/auth";

/**
 * GET /api/boards/:id
 * Returns a single board by id, only if the user has access.
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all board IDs the user can access
    const accessibleBoards = await getBoardsForUser({
      id: user.id,
      role: user.role,
    });
    const accessibleBoardIds = accessibleBoards.map((b) => b.id);

    if (!accessibleBoardIds.includes(params.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const board = await getBoardById(params.id);
    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }
    return NextResponse.json(board);
  } catch (err) {
    console.error(`GET /api/boards/${params.id} error:`, err);
    return NextResponse.json(
      { error: "Failed to fetch board" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/boards/:id
 * Update a board by id. Expects JSON body compatible with your update helper.
 */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const updated = await updateBoard(params.id, body);
    return NextResponse.json(updated);
  } catch (err) {
    console.error(`PUT /api/boards/${params.id} error:`, err);
    return NextResponse.json(
      { error: "Failed to update board" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/boards/:id
 * Delete a board by id.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const board = await getBoardById(resolvedParams.id);
    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }
    if (board.teams && board.teams.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete a board that belongs to a team" },
        { status: 403 }
      );
    }
    await deleteBoard(resolvedParams.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`DELETE /api/boards/${resolvedParams.id} error:`, err);
    return NextResponse.json(
      { error: "Failed to delete board" },
      { status: 500 }
    );
  }
}
