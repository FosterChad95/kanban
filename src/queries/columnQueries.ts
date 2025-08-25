import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";

/**
 * Get all columns, optionally filtered by boardId.
 * @param boardId Optional board ID to filter columns.
 */
export async function getAllColumns(boardId?: string) {
  return prisma.column.findMany({
    where: boardId ? { boardId } : undefined,
    include: { board: true, tasks: true },
  });
}

/**
 * Get a single column by ID.
 * @param id Column ID
 */
export async function getColumnById(id: string) {
  return prisma.column.findUnique({
    where: { id },
    include: { board: true, tasks: true },
  });
}

/**
 * Create a new column.
 * @param data Column creation data (Prisma.ColumnCreateInput)
 */
export async function createColumn(data: Prisma.ColumnCreateInput) {
  return prisma.column.create({
    data,
    include: { board: true, tasks: true },
  });
}

/**
 * Update an existing column.
 * @param id Column ID
 * @param data Column update data (Prisma.ColumnUpdateInput)
 */
export async function updateColumn(id: string, data: Prisma.ColumnUpdateInput) {
  return prisma.column.update({
    where: { id },
    data,
    include: { board: true, tasks: true },
  });
}

/**
 * Delete a column by ID.
 * @param id Column ID
 */
export async function deleteColumn(id: string) {
  return prisma.column.delete({
    where: { id },
  });
}
