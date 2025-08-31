import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";

/**
 * Get all boards.
 */
export async function getAllBoards() {
  return prisma.board.findMany({
    include: {
      columns: {
        include: {
          tasks: {
            include: {
              subtasks: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Get all boards for a user: boards from user's teams and user's private boards.
 * @param userId User ID
 */
export async function getBoardsForUser(user: { id: string; role: string }) {
  if (user.role === "ADMIN") {
    // Admins see all boards
    return getAllBoards();
  }
  const userId = user.id;
  // Get all team IDs for the user
  const userTeams = await prisma.userTeam.findMany({
    where: { userId },
    select: { teamId: true },
  });
  const teamIds = userTeams.map((ut) => ut.teamId);

  // Get all board IDs for those teams
  const teamBoards = await prisma.teamBoard.findMany({
    where: { teamId: { in: teamIds.length > 0 ? teamIds : [""] } },
    select: { boardId: true },
  });
  const teamBoardIds = teamBoards.map((tb) => tb.boardId);

  // Get all board IDs for private boards (user is a direct member)
  const userBoards = await prisma.userBoard.findMany({
    where: { userId },
    select: { boardId: true },
  });
  const userBoardIds = userBoards.map((ub) => ub.boardId);

  // Merge and deduplicate board IDs
  const allBoardIds = Array.from(new Set([...teamBoardIds, ...userBoardIds]));

  // Fetch all boards with those IDs
  const boards = await prisma.board.findMany({
    where: { id: { in: allBoardIds.length > 0 ? allBoardIds : [""] } },
    include: {
      columns: {
        include: {
          tasks: {
            include: {
              subtasks: true,
            },
          },
        },
      },
    },
  });

  return boards;
}

/**
 * Get a single board by ID.
 * @param id Board ID
 */
export async function getBoardById(id: string) {
  return prisma.board.findUnique({
    where: { id },
    include: {
      columns: {
        include: {
          tasks: {
            include: {
              subtasks: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Create a new board.
 * @param data Board creation data (Prisma.BoardCreateInput)
 */
export async function createBoard(data: Prisma.BoardCreateInput) {
  return prisma.board.create({
    data,
    include: { columns: true },
  });
}

/**
 * Update an existing board.
 * @param id Board ID
 * @param data Board update data (Prisma.BoardUpdateInput)
 */
export async function updateBoard(id: string, data: Prisma.BoardUpdateInput) {
  // The incoming `data` from the API is a simple shape like:
  // { name?: string, columns?: { id?: string, name: string }[], teamIds?: string[] }
  // Prisma expects nested update objects for relations. Convert the simple shape
  // into explicit create/update/delete operations inside a transaction.
  const payload = data as any;

  return prisma.$transaction(async (tx) => {
    // Update board name if provided
    if (typeof payload.name === "string") {
      await tx.board.update({
        where: { id },
        data: { name: payload.name },
      });
    }

    // Sync teams (TeamBoard join table) if teamIds provided
    if (Array.isArray(payload.teamIds)) {
      // Remove all existing links for this board, then recreate from incoming list
      await tx.teamBoard.deleteMany({ where: { boardId: id } });
      if (payload.teamIds.length > 0) {
        // createMany with skipDuplicates to be safe
        await tx.teamBoard.createMany({
          data: payload.teamIds.map((teamId: string) => ({
            teamId,
            boardId: id,
          })),
          skipDuplicates: true,
        });
      }
    }

    // Sync columns if provided
    if (Array.isArray(payload.columns)) {
      // Fetch existing columns for this board
      const existing = await tx.column.findMany({
        where: { boardId: id },
        select: { id: true },
      });
      const existingIds = existing.map((c) => c.id);
      const incomingIds = payload.columns
        .filter((c: any) => c?.id)
        .map((c: any) => c.id);

      // Delete columns that were removed in the UI
      const toDelete = existingIds.filter((eid) => !incomingIds.includes(eid));
      if (toDelete.length > 0) {
        await tx.column.deleteMany({ where: { id: { in: toDelete } } });
      }

      // Upsert incoming columns: update if id exists, otherwise create
      for (const col of payload.columns) {
        if (col?.id) {
          // If name is blank, skip update (or you may choose to delete)
          await tx.column.update({
            where: { id: col.id },
            data: { name: col.name },
          });
        } else {
          await tx.column.create({
            data: { name: col.name, boardId: id },
          });
        }
      }
    }

    // Return the updated board with the same include structure as other queries
    const updated = await tx.board.findUnique({
      where: { id },
      include: {
        columns: {
          include: {
            tasks: {
              include: {
                subtasks: true,
              },
            },
          },
        },
        teams: {
          include: {
            team: true,
          },
        },
        users: {
          include: {
            user: true,
          },
        },
        Task: {
          include: {
            subtasks: true,
          },
        },
      },
    });

    if (!updated) {
      throw new Error("Board not found");
    }

    // Map teams to the shape consumers expect (team objects under `teams`)
    // If other parts of the app expect `teams` as { id, name } arrays, transform accordingly.
    const mapped = {
      ...updated,
      teams: Array.isArray(updated.teams)
        ? updated.teams.map((tb) => ({
            id: tb.team.id,
            name: tb.team.name,
          }))
        : [],
    };

    return mapped;
  });
}

/**
 * Delete a board by ID.
 * @param id Board ID
 */
export async function deleteBoard(id: string) {
  return prisma.board.delete({
    where: { id },
  });
}
