import { getAllTasks, createTask } from "../../../queries/taskQueries";
import { 
  withAuth, 
  withAuthAndValidation, 
  withErrorHandling, 
  createSuccessResponse,
  createErrorResponse
} from "../../../lib/api-utils";
import { CreateTaskSchema } from "../../../schemas/api";
import { triggerTaskCreated } from "../../../lib/pusher-events";

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
    return withAuthAndValidation(req, CreateTaskSchema, async (body, user) => {
      // First, get the column to find the boardId
      const prisma = (await import("../../../lib/prisma")).default;
      const column = await prisma.column.findUnique({
        where: { id: body.columnId },
        select: { boardId: true }
      });
      
      if (!column) {
        return createErrorResponse("Column not found", 404);
      }
      
      // Transform data to match Prisma expectations
      const data = {
        title: body.title,
        description: body.description,
        column: { connect: { id: body.columnId } },
        board: { connect: { id: column.boardId } },
        subtasks:
          body.subtasks && body.subtasks.length > 0
            ? { create: body.subtasks }
            : undefined,
      };
      
      const created = await createTask(data);
      
      // Trigger real-time event for task creation
      await triggerTaskCreated(created, user.id);
      
      return createSuccessResponse(created, 201);
    });
  })();
}
