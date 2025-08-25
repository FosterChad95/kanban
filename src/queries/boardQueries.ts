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
 * Get a single board by ID.
 * @param id Board ID
 */
export async function getBoardById(id: string) {
  return prisma.board.findUnique({
    where: { id },
    include: { columns: true },
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
    include: { columns: true },
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
