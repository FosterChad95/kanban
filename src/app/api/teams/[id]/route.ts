import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teamId = params.id;
    if (!teamId) {
      return NextResponse.json({ error: "Missing team ID" }, { status: 400 });
    }

    const { name, userIds, boardIds } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Missing team name" }, { status: 400 });
    }

    // Update team name, users, and boards (handle UserTeam and TeamBoard join tables directly)
    const updatedTeam = await prisma.$transaction(async (tx) => {
      // Update team name
      await tx.team.update({
        where: { id: teamId },
        data: { name },
      });

      // Remove all existing UserTeam relations for this team
      await tx.userTeam.deleteMany({
        where: { teamId },
      });

      // Add new UserTeam relations for each userId
      if (Array.isArray(userIds) && userIds.length > 0) {
        await tx.userTeam.createMany({
          data: userIds.map((userId: string) => ({
            userId,
            teamId,
          })),
        });
      }

      // Remove all existing TeamBoard relations for this team
      await tx.teamBoard.deleteMany({
        where: { teamId },
      });

      // Add new TeamBoard relations for each boardId
      if (Array.isArray(boardIds) && boardIds.length > 0) {
        await tx.teamBoard.createMany({
          data: boardIds.map((boardId: string) => ({
            boardId,
            teamId,
          })),
        });
      }

      // Return the updated team with users and boards
      return tx.team.findUnique({
        where: { id: teamId },
        include: { users: true, boards: true },
      });
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
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teamId = params.id;

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
