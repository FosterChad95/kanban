import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/teams
 * Returns all teams.
 * Only admins can access.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teams = await prisma.team.findMany({
      include: {
        users: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    // Map users to array of { id, name }
    const teamsWithUsers = teams.map((team) => ({
      id: team.id,
      name: team.name,
      users: team.users.map((ut) => ut.user),
    }));

    return NextResponse.json(teamsWithUsers, { status: 200 });
  } catch (err) {
    console.error("GET /api/teams error:", err);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/teams
 * Body: { name: string }
 * Creates a new team.
 * Only admins can create teams.
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Missing team name" }, { status: 400 });
    }

    const team = await prisma.team.create({
      data: { name },
    });

    return NextResponse.json(team, { status: 201 });
  } catch (err) {
    console.error("POST /api/teams error:", err);
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    );
  }
}
