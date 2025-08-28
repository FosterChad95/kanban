import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import type { Task } from "@/util/types";

/**
 * Get all tasks, optionally filtered by columnId.
 * @param columnId Optional column ID to filter tasks.
 */
export async function getAllTasks(columnId?: string): Promise<Task[]> {
  return prisma.task.findMany({
    where: columnId ? { columnId } : undefined,
    include: { subtasks: true, column: true },
  });
}

/**
 * Get a single task by its ID.
 * @param id Task ID
 */
export async function getTaskById(id: string): Promise<Task | null> {
  return prisma.task.findUnique({
    where: { id },
    include: { subtasks: true, column: true },
  });
}

/**
 * Create a new task.
 * @param data Task creation data (Prisma.TaskCreateInput)
 */
export async function createTask(data: Prisma.TaskCreateInput): Promise<Task> {
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
export async function updateTask(
  id: string,
  data: Prisma.TaskUpdateInput
): Promise<Task> {
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
