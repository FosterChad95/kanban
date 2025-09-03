import {
  getTaskById,
  updateTask,
  deleteTask,
} from "../../../../queries/taskQueries";
import { 
  withAuth, 
  withAuthAndValidation, 
  withErrorHandling, 
  createSuccessResponse,
  createErrorResponse,
  validateParams 
} from "../../../../lib/api-utils";
import { IdParamSchema, UpdateTaskSchema } from "../../../../schemas/api";
import { triggerTaskUpdated, triggerTaskDeleted } from "../../../../lib/pusher-events";

/**
 * GET /api/tasks/:id
 * Returns a single task by id.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { data: validatedParams, error } = await validateParams(params, IdParamSchema);
    if (error) return error;

    return withAuth(async () => {
      const task = await getTaskById(validatedParams.id);
      if (!task) {
        return createErrorResponse("Task not found", 404);
      }
      return createSuccessResponse(task);
    });
  })();
}

/**
 * PUT /api/tasks/:id
 * Update a task by id with validation.
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { data: validatedParams, error } = await validateParams(params, IdParamSchema);
    if (error) return error;

    return withAuthAndValidation(req, UpdateTaskSchema, async (body, user) => {
      // Extract subtasks and map to updateMany structure
      const { subtasks, columnId, ...rest } = body;
      const data: any = { ...rest };
      
      // If column is changing, get the new column's boardId
      if (columnId) {
        const prisma = (await import("../../../../lib/prisma")).default;
        const column = await prisma.column.findUnique({
          where: { id: columnId },
          select: { boardId: true }
        });
        
        if (!column) {
          return createErrorResponse("Column not found", 404);
        }
        
        data.column = { connect: { id: columnId } };
        data.board = { connect: { id: column.boardId } };
      }
      
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
      
      const updated = await updateTask(validatedParams.id, data);
      
      // Trigger real-time event for task update
      await triggerTaskUpdated(updated, user.id);
      
      return createSuccessResponse(updated);
    });
  })();
}

/**
 * DELETE /api/tasks/:id
 * Delete a task by id.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { data: validatedParams, error } = await validateParams(params, IdParamSchema);
    if (error) return error;

    return withAuth(async (user) => {
      const task = await getTaskById(validatedParams.id);
      if (!task) {
        return createErrorResponse("Task not found", 404);
      }

      await deleteTask(validatedParams.id);
      
      // Trigger real-time event for task deletion
      await triggerTaskDeleted(validatedParams.id, task.boardId || '', user.id);
      
      return createSuccessResponse({ success: true });
    });
  })();
}
