/**
 * Constants related to Kanban boards and columns
 */

export const DEFAULT_COLUMN_NAMES = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress", 
  DONE: "Done",
  BACKLOG: "Backlog",
  REVIEW: "Review",
} as const;

export const DEFAULT_BOARD_COLUMNS = [
  { name: DEFAULT_COLUMN_NAMES.TODO },
  { name: DEFAULT_COLUMN_NAMES.IN_PROGRESS },
  { name: DEFAULT_COLUMN_NAMES.DONE },
] as const;

export const BOARD_LIMITS = {
  MAX_COLUMNS: 10,
  MAX_BOARD_NAME_LENGTH: 100,
  MAX_COLUMN_NAME_LENGTH: 50,
  MAX_TASK_TITLE_LENGTH: 200,
  MAX_TASK_DESCRIPTION_LENGTH: 2000,
} as const;