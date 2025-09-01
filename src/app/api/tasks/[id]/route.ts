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

    return withAuthAndValidation(req, UpdateTaskSchema, async (body) => {
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
      
      const updated = await updateTask(validatedParams.id, data);
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

    return withAuth(async () => {
      const task = await getTaskById(validatedParams.id);
      if (!task) {
        return createErrorResponse("Task not found", 404);
      }

      await deleteTask(validatedParams.id);
      return createSuccessResponse({ success: true });
    });
  })();
}
