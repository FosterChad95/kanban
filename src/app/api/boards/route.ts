import { NextResponse } from "next/server";
import { createBoard, getAllBoards } from "../../../queries/boardQueries";

/**
 * GET /api/boards
 * Returns all boards (including columns & tasks as implemented by query helper).
 */
export async function GET() {
  try {
    const boards = await getAllBoards();
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
    const body = await req.json();
    const created = await createBoard(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/boards error:", err);
    return NextResponse.json(
      { error: "Failed to create board" },
      { status: 500 }
    );
  }
}
