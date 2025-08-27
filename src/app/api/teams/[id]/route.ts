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

    const { name, userIds } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Missing team name" }, { status: 400 });
    }

    // Update team name and users
    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: {
        name,
        users: userIds
          ? {
              set: userIds.map((id: string) => ({ id })),
            }
          : undefined,
      },
      include: { users: true },
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
