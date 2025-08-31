import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/users/me/teams
 * Returns all teams the current user belongs to.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find all teams for the user
    const userTeams = await prisma.userTeam.findMany({
      where: { userId: user.id },
      include: {
        team: {
          select: { id: true, name: true },
        },
      },
    });

    // Map to array of { id, name }
    const teams = userTeams.map((ut) => ut.team);

    return NextResponse.json(teams, { status: 200 });
  } catch (err) {
    console.error("GET /api/users/me/teams error:", err);
    return NextResponse.json(
      { error: "Failed to fetch user teams" },
      { status: 500 }
    );
  }
}
