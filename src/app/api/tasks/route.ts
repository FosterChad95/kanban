import { NextResponse } from "next/server";
import { getAllTasks, createTask } from "../../../queries/taskQueries";

/**
 * GET /api/tasks
 * Returns all tasks (optionally could accept query params for columnId in future).
 */
export async function GET() {
  try {
    const tasks = await getAllTasks();
    return NextResponse.json(tasks);
  } catch (err) {
    console.error("GET /api/tasks error:", err);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks
 * Create a new task. Expects JSON body compatible with your createTask helper.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await createTask(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/tasks error:", err);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
