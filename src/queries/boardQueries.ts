import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import { BoardUpdatePayload } from "../schemas/api";
import type { Board } from "../util/types";
import { BOARD_FULL_INCLUDES } from "../lib/prisma-includes";
import { transformBoards, transformBoard } from "../util/data-transformers";
import { USER_ROLES } from "../constants/auth";

/**
 * Get all boards.
 */
export async function getAllBoards(): Promise<Board[]> {
  const boards = await prisma.board.findMany({
    include: BOARD_FULL_INCLUDES,
    orderBy: { name: 'asc' },
  });

  return transformBoards(boards);
}

/**
 * Get all boards for a user: boards from user's teams and user's private boards.
 * @param user User object with id and role
 */
export async function getBoardsForUser(user: { id: string; role: string }): Promise<Board[]> {
  if (user.role === USER_ROLES.ADMIN) {
    // Admins see all boards
    return getAllBoards();
  }

  // Optimized single query using Prisma's advanced where conditions
  // This finds boards where the user either:
  // 1. Is directly associated via UserBoard
  // 2. Is a member of a team that has access to the board via TeamBoard
  const boards = await prisma.board.findMany({
    where: {
      OR: [
        // Boards where user is directly associated
        {
          users: {
            some: {
              userId: user.id,
            },
          },
        },
        // Boards accessible through team membership
        {
          teams: {
            some: {
              team: {
                users: {
                  some: {
                    userId: user.id,
                  },
                },
              },
            },
          },
        },
      ],
    },
    include: BOARD_FULL_INCLUDES,
    // Remove duplicates at database level and add consistent ordering
    distinct: ['id'],
    orderBy: { name: 'asc' },
  });

  return transformBoards(boards);
}

/**
 * Get a single board by ID.
 * @param id Board ID
 */
export async function getBoardById(id: string): Promise<Board | null> {
  const board = await prisma.board.findUnique({
    where: { id },
    include: BOARD_FULL_INCLUDES,
  });

  if (!board) return null;

  return transformBoard(board);
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
 * Update board basic information (name, etc.).
 * @param tx Prisma transaction client
 * @param id Board ID
 * @param name New board name
 */
async function updateBoardBasicInfo(
  tx: Prisma.TransactionClient,
  id: string, 
  name?: string
) {
  if (typeof name === "string") {
    await tx.board.update({
      where: { id },
      data: { name },
    });
  }
}

/**
 * Update board team associations.
 * @param tx Prisma transaction client
 * @param id Board ID
 * @param teamIds Array of team IDs to associate with the board
 */
async function updateBoardTeamAssociations(
  tx: Prisma.TransactionClient,
  id: string,
  teamIds?: string[]
) {
  if (!Array.isArray(teamIds)) return;

  // Remove all existing links for this board
  await tx.teamBoard.deleteMany({ where: { boardId: id } });
  
  // Recreate links individually to ensure relational creation works reliably
  for (const teamId of teamIds) {
    if (!teamId) continue;
    await tx.teamBoard.create({
      data: { teamId, boardId: id },
    });
  }
}

/**
 * Update board columns.
 * @param tx Prisma transaction client
 * @param id Board ID
 * @param columns Array of column data to sync
 */
async function updateBoardColumns(
  tx: Prisma.TransactionClient,
  id: string,
  columns?: Array<{ id?: string; name: string }>
) {
  if (!Array.isArray(columns)) return;

  // Fetch existing columns for this board
  const existing = await tx.column.findMany({
    where: { boardId: id },
    select: { id: true },
  });
  const existingIds = existing.map((c) => c.id);
  const incomingIds = columns
    .filter((c) => c?.id)
    .map((c) => c.id);

  // Delete columns that were removed in the UI
  const toDelete = existingIds.filter((eid) => !incomingIds.includes(eid));
  if (toDelete.length > 0) {
    await tx.column.deleteMany({ where: { id: { in: toDelete } } });
  }

  // Upsert incoming columns: update if id exists, otherwise create
  for (const col of columns) {
    if (col?.id) {
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

/**
 * Update an existing board.
 * @param id Board ID
 * @param data Board update data (BoardUpdatePayload)
 */
export async function updateBoard(id: string, data: BoardUpdatePayload) {
  return prisma.$transaction(async (tx) => {
    // Update board components using focused helper functions
    await updateBoardBasicInfo(tx, id, data.name);
    await updateBoardTeamAssociations(tx, id, data.teamIds);
    await updateBoardColumns(tx, id, data.columns);

    // Return the updated board with the same include structure as other queries
    const updated = await tx.board.findUnique({
      where: { id },
      include: BOARD_FULL_INCLUDES,
    });

    if (!updated) {
      throw new Error("Board not found");
    }

    return transformBoard(updated);
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

/**
 * Create a board and link it to a user.
 * @param boardData Board creation data
 * @param userId User ID to link the board to
 */
export async function createBoardForUser(
  boardData: {
    name: string;
    columns?: Array<{ name: string }>;
  },
  userId: string
) {
  return prisma.$transaction(async (tx) => {
    // Create the board
    const board = await tx.board.create({
      data: {
        name: boardData.name,
        ...(boardData.columns && boardData.columns.length > 0
          ? { columns: { create: boardData.columns } }
          : {}),
      },
      include: BOARD_FULL_INCLUDES,
    });

    // Link the board to the user
    await tx.userBoard.create({
      data: {
        userId,
        boardId: board.id,
      },
    });

    return transformBoard(board);
  });
}
