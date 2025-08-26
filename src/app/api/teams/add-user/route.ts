import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * POST /api/teams/add-user
 * Body: { teamId: string, userId: string }
 * Only admins can add users to teams.
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId, userId } = await req.json();

    if (!teamId || !userId) {
      return NextResponse.json(
        { error: "Missing teamId or userId" },
        { status: 400 }
      );
    }

    // Check if the user is already in the team
    const existing = await prisma.userTeam.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User already in team" },
        { status: 400 }
      );
    }

    // Add user to team
    const userTeam = await prisma.userTeam.create({
      data: {
        userId,
        teamId,
      },
    });

    return NextResponse.json(userTeam, { status: 201 });
  } catch (err) {
    console.error("POST /api/teams/add-user error:", err);
    return NextResponse.json(
      { error: "Failed to add user to team" },
      { status: 500 }
    );
  }
}
