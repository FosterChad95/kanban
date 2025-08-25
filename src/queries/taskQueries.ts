import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";

/**
 * Get all tasks, optionally filtered by columnId.
 * @param columnId Optional column ID to filter tasks.
 */
export async function getAllTasks(columnId?: string) {
  return prisma.task.findMany({
    where: columnId ? { columnId } : undefined,
    include: { subtasks: true, column: true },
  });
}

/**
 * Get a single task by its ID.
 * @param id Task ID
 */
export async function getTaskById(id: string) {
  return prisma.task.findUnique({
    where: { id },
    include: { subtasks: true, column: true },
  });
}

/**
 * Create a new task.
 * @param data Task creation data (Prisma.TaskCreateInput)
 */
export async function createTask(data: Prisma.TaskCreateInput) {
  return prisma.task.create({
    data,
    include: { subtasks: true, column: true },
  });
}

/**
 * Update an existing task.
 * @param id Task ID
 * @param data Task update data (Prisma.TaskUpdateInput)
 */
export async function updateTask(id: string, data: Prisma.TaskUpdateInput) {
  return prisma.task.update({
    where: { id },
    data,
    include: { subtasks: true, column: true },
  });
}

/**
 * Delete a task by its ID.
 * @param id Task ID
 */
export async function deleteTask(id: string) {
  return prisma.task.delete({
    where: { id },
  });
}
