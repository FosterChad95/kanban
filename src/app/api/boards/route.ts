import { NextResponse } from "next/server";
import { createBoard, getBoardsForUser } from "../../../queries/boardQueries";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/boards
 * Returns all boards (including columns & tasks as implemented by query helper).
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const boards = await getBoardsForUser(user.id);
    return NextResponse.json(boards);
  } catch (err) {
    console.error("GET /api/boards error:", err);
    return NextResponse.json(
      { error: "Failed to fetch boards" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/boards
 * Create a new board. Expects JSON body matching Prisma.BoardCreateInput shape used by your helper.
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const created = await createBoard(body);

    // Link the new board to the user in UserBoard
    // Import prisma directly here to avoid circular import
    const { default: prisma } = await import("../../../lib/prisma");
    await prisma.userBoard.create({
      data: {
        userId: user.id,
        boardId: created.id,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/boards error:", err);
    return NextResponse.json(
      { error: "Failed to create board" },
      { status: 500 }
    );
  }
}
