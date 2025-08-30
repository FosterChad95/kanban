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
export async function getBoardsForUser(userId: string) {
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
  return prisma.board.update({
    where: { id },
    data,
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
 * Delete a board by ID.
 * @param id Board ID
 */
export async function deleteBoard(id: string) {
  return prisma.board.delete({
    where: { id },
  });
}
