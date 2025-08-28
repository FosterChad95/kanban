import type { ViewTaskFormValues, BoardFormValues } from "@/schemas/forms";
import type { Task, TaskUpdatePayload, Board } from "@/util/types";

/**
 * Map ViewTaskFormValues (form data) to TaskUpdatePayload (API payload)
 */
export function mapViewTaskFormToTaskUpdatePayload(
  form: ViewTaskFormValues
): TaskUpdatePayload {
  return {
    title: form.title,
    description: form.description || null,
    columnId: form.columnId,
    subtasks: form.subtasks.map((s) => ({
      id: s.id || "",
      title: s.title,
      completed: s.completed,
    })),
  };
}

/**
 * Map Task (domain type) to ViewTaskFormValues (form data)
 */
export function mapTaskToViewTaskForm(task: Task): ViewTaskFormValues {
  return {
    title: task.title,
    description: task.description || "",
    columnId: task.columnId,
    subtasks: task.subtasks.map((s) => ({
      id: s.id,
      title: s.title,
      completed: s.isCompleted,
    })),
  };
}

/**
 * Map BoardFormValues (form data) to Board (domain type)
 */
export function mapBoardFormToBoard(form: BoardFormValues): Board {
  return {
    name: form.name,
    columns: form.columns.map((col) => ({
      id: col.id || "",
      name: col.name,
    })),
  };
}

/**
 * Map Board (domain type) to BoardFormValues (form data)
 */
export function mapBoardToBoardForm(board: Board): BoardFormValues {
  return {
    name: board.name,
    columns: board.columns.map((col) => ({
      id: col.id || "",
      name: col.name,
    })),
  };
}
