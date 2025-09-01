import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { updateTeam } from "@/queries/teamQueries";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teamId = resolvedParams.id;
    if (!teamId) {
      return NextResponse.json({ error: "Missing team ID" }, { status: 400 });
    }

    const body = await req.json();
    const { teamName, users, boards } = body;

    // Validate required fields
    if (!teamName || typeof teamName !== 'string' || teamName.trim() === '') {
      return NextResponse.json({ error: "Team name is required" }, { status: 400 });
    }

    // Extract IDs from user and board objects
    const userIds = Array.isArray(users) ? users.map((u: any) => u.id).filter(Boolean) : [];
    const boardIds = Array.isArray(boards) ? boards.map((b: any) => b.id).filter(Boolean) : [];

    // Update team using the query helper
    const updatedTeam = await updateTeam(teamId, {
      name: teamName.trim(),
      userIds,
      boardIds
    });

    return NextResponse.json(updatedTeam, { status: 200 });
  } catch (err) {
    console.error("PUT /api/teams/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to update team" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teamId = resolvedParams.id;

    if (!teamId) {
      return NextResponse.json({ error: "Missing team ID" }, { status: 400 });
    }

    // Optionally, you could check if the team exists first

    await prisma.team.delete({
      where: { id: teamId },
    });

    return NextResponse.json({ message: "Team deleted" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/teams/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to delete team" },
      { status: 500 }
    );
  }
}
