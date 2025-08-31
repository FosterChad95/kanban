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
    const boards = await getBoardsForUser({ id: user.id, role: user.role });
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
 * Create a new board. Accepts simple payload: { name: string, columns?: { name: string }[] }.
 * Transforms to Prisma create shape internally.
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    // Normalize incoming payload { name: string; columns?: { name: string }[] }
    if (!body?.name || typeof body.name !== "string") {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    const columnNames = Array.isArray(body.columns)
      ? body.columns
          .map((c: any) => (c?.name ?? "").trim())
          .filter((n: string) => n.length > 0)
      : [];
    const created = await createBoard({
      name: body.name,
      ...(columnNames.length > 0
        ? { columns: { create: columnNames.map((name: string) => ({ name })) } }
        : {}),
    });

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
