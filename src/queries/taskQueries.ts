import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import type { Task } from "@/util/types";
import { TASK_WITH_COLUMN_INCLUDES } from "../lib/prisma-includes";

/**
 * Get all tasks, optionally filtered by columnId.
 * @param columnId Optional column ID to filter tasks.
 */
export async function getAllTasks(columnId?: string): Promise<Task[]> {
  const tasks = await prisma.task.findMany({
    where: columnId ? { columnId } : undefined,
    include: TASK_WITH_COLUMN_INCLUDES,
    orderBy: { id: 'desc' },
  });
  
  return tasks.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description,
    columnId: task.columnId,
    boardId: task.boardId,
    subtasks: task.subtasks.map(subtask => ({
      id: subtask.id,
      title: subtask.title,
      isCompleted: subtask.isCompleted
    }))
  }));
}

/**
 * Get a single task by its ID.
 * @param id Task ID
 */
export async function getTaskById(id: string): Promise<Task | null> {
  const task = await prisma.task.findUnique({
    where: { id },
    include: TASK_WITH_COLUMN_INCLUDES,
  });
  
  if (!task) return null;
  
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    columnId: task.columnId,
    boardId: task.boardId,
    subtasks: task.subtasks.map(subtask => ({
      id: subtask.id,
      title: subtask.title,
      isCompleted: subtask.isCompleted
    }))
  };
}

/**
 * Create a new task.
 * @param data Task creation data (Prisma.TaskCreateInput)
 */
export async function createTask(data: Prisma.TaskCreateInput): Promise<Task> {
  const task = await prisma.task.create({
    data,
    include: TASK_WITH_COLUMN_INCLUDES,
  });
  
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    columnId: task.columnId,
    boardId: task.boardId,
    subtasks: task.subtasks.map(subtask => ({
      id: subtask.id,
      title: subtask.title,
      isCompleted: subtask.isCompleted
    }))
  };
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
  const task = await prisma.task.update({
    where: { id },
    data,
    include: TASK_WITH_COLUMN_INCLUDES,
  });
  
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    columnId: task.columnId,
    boardId: task.boardId,
    subtasks: task.subtasks.map(subtask => ({
      id: subtask.id,
      title: subtask.title,
      isCompleted: subtask.isCompleted
    }))
  };
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
