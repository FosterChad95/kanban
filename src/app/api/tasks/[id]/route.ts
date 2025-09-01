import { NextResponse } from "next/server";
import {
  getTaskById,
  updateTask,
  deleteTask,
} from "../../../../queries/taskQueries";
import type { Task, TaskUpdatePayload } from "@/util/types";

/**
 * GET /api/tasks/:id
 * Returns a single task by id.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const resolvedParams = await params;
    const task: Task | null = await getTaskById(resolvedParams.id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json(task);
  } catch (err) {
    const resolvedParams = await params;
    console.error(`GET /api/tasks/${resolvedParams.id} error:`, err);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tasks/:id
 * Update a task by id. Expects JSON body compatible with TaskUpdatePayload.
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const resolvedParams = await params;
    const body: TaskUpdatePayload = await req.json();
    // Extract subtasks and map to updateMany structure
    const { subtasks, ...rest } = body;
    const data: any = { ...rest };
    if (Array.isArray(subtasks)) {
      data.subtasks = {
        updateMany: subtasks.map((s) => ({
          where: { id: s.id },
          data: {
            title: s.title,
            isCompleted: s.completed,
          },
        })),
      };
    }
    const updated: Task = await updateTask(resolvedParams.id, data);
    return NextResponse.json(updated);
  } catch (err) {
    const resolvedParams = await params;
    console.error(`PUT /api/tasks/${resolvedParams.id} error:`, err);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tasks/:id
 * Delete a task by id.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const resolvedParams = await params;
    await deleteTask(resolvedParams.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const resolvedParams = await params;
    console.error(`DELETE /api/tasks/${resolvedParams.id} error:`, err);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
