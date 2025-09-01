import { getAllTasks, createTask } from "../../../queries/taskQueries";
import { 
  withAuth, 
  withAuthAndValidation, 
  withErrorHandling, 
  createSuccessResponse 
} from "../../../lib/api-utils";
import { CreateTaskSchema } from "../../../schemas/api";

/**
 * GET /api/tasks
 * Returns all tasks. Should be filtered by user access in the future.
 */
export const GET = withErrorHandling(async () => {
  return withAuth(async () => {
    const tasks = await getAllTasks();
    return createSuccessResponse(tasks);
  });
});

/**
 * POST /api/tasks
 * Create a new task with optional subtasks.
 */
export async function POST(req: Request) {
  return withErrorHandling(async () => {
    return withAuthAndValidation(req, CreateTaskSchema, async (body) => {
      // Transform data to match Prisma expectations
      const data = {
        title: body.title,
        description: body.description,
        column: { connect: { id: body.columnId } },
        subtasks:
          body.subtasks && body.subtasks.length > 0
            ? { create: body.subtasks }
            : undefined,
      };
      
      const created = await createTask(data);
      return createSuccessResponse(created, 201);
    });
  })();
}
