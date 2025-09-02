export type Option = {
  label: string;
  value: string | number;
};

// Shared domain types for backend and frontend

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  columnId: string;
  boardId?: string | null;
  subtasks: Subtask[];
}

// Payload type for updating a subtask in the API
export interface SubtaskUpdatePayload {
  id: string;
  title: string;
  completed: boolean;
}

// Payload type for updating a task in the API
export interface TaskUpdatePayload {
  title?: string;
  description?: string | null;
  columnId?: string;
  boardId?: string | null;
  subtasks?: SubtaskUpdatePayload[];
}

export interface Column {
  id: string;
  name: string;
  boardId?: string;
  tasks?: Task[];
}

export interface Board {
  id: string;
  name: string;
  columns: Column[];
  teams?: Array<{ id: string; name: string }>;
  users?: Array<{ id: string; name: string }>;
  hasTeam?: boolean;
}
