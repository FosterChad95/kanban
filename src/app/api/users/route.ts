import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/users - List all users (id, name, avatar)
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        image: true, // avatar
      },
      orderBy: { name: "asc" },
    });

    // Map to UserOption shape expected by AddTeamModal
    const userOptions = users.map(
      (user: { id: string; name: string | null; image?: string | null }) => ({
        id: user.id,
        name: user.name || "Unnamed User",
        avatar: user.image || undefined,
      })
    );

    return NextResponse.json(userOptions);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
