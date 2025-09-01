// API-specific types that align with Prisma schema and modal expectations

import { Role } from "@prisma/client";

// User types aligned with Prisma User model
export interface ApiUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  avatar?: string;
}

// Team types aligned with Prisma Team model and join tables
export interface ApiTeam {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  users: {
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
  }[];
  boards: {
    board: {
      id: string;
      name: string;
    };
  }[];
}

export interface UpdateTeamRequest {
  teamName: string;
  users: Array<{
    id: string;
    name: string;
    avatar?: string;
    email?: string;
  }>;
  boards: Array<{
    id: string;
    name: string;
  }>;
}

// Board types aligned with Prisma Board model
export interface ApiBoard {
  id: string;
  name: string;
  columns: {
    id: string;
    name: string;
    tasks: {
      id: string;
      title: string;
      description: string | null;
      subtasks: {
        id: string;
        title: string;
        isCompleted: boolean;
      }[];
    }[];
  }[];
  teams: {
    id: string;
    name: string;
  }[];
  users: {
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
  }[];
}

export interface UpdateBoardRequest {
  name: string;
  columns: Array<{
    id?: string;
    name: string;
  }>;
  teamIds?: string[];
}

// Task types aligned with Prisma Task/Subtask models  
export interface ApiTask {
  id: string;
  title: string;
  description: string | null;
  columnId: string;
  boardId: string | null;
  subtasks: {
    id: string;
    title: string;
    isCompleted: boolean;
  }[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string | null;
  columnId?: string;
  boardId?: string | null;
  subtasks?: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
}

// Generic API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiErrorResponse {
  error: string;
  details?: any;
}