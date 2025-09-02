/**
 * Reusable Prisma include patterns to maintain consistency across queries
 * and reduce duplication of complex include structures.
 */

import { Prisma } from "@prisma/client";

// Task includes
export const TASK_INCLUDES = {
  subtasks: true,
} as const satisfies Prisma.TaskInclude;

export const TASK_WITH_COLUMN_INCLUDES = {
  subtasks: true,
  column: true,
} as const satisfies Prisma.TaskInclude;

// Column includes
export const COLUMN_WITH_TASKS_INCLUDES = {
  tasks: {
    include: TASK_INCLUDES,
  },
} as const satisfies Prisma.ColumnInclude;

// Board includes - various levels of detail
export const BOARD_BASIC_INCLUDES = {
  columns: true,
} as const satisfies Prisma.BoardInclude;

export const BOARD_WITH_TASKS_INCLUDES = {
  columns: {
    include: COLUMN_WITH_TASKS_INCLUDES,
  },
} as const satisfies Prisma.BoardInclude;

export const BOARD_TEAM_RELATIONS_INCLUDES = {
  teams: {
    include: {
      team: true,
    },
  },
  users: {
    include: {
      user: true,
    },
  },
} as const satisfies Prisma.BoardInclude;

export const BOARD_FULL_INCLUDES = {
  columns: {
    include: COLUMN_WITH_TASKS_INCLUDES,
  },
  teams: {
    include: {
      team: true,
    },
  },
  users: {
    include: {
      user: true,
    },
  },
  Task: {
    include: TASK_INCLUDES,
  },
} as const satisfies Prisma.BoardInclude;

// User includes
export const USER_WITH_AUTH_INCLUDES = {
  accounts: true,
  sessions: true,
} as const satisfies Prisma.UserInclude;

// Team includes  
export const TEAM_WITH_RELATIONS_INCLUDES = {
  users: {
    include: {
      user: {
        select: { id: true, name: true },
      },
    },
  },
  boards: {
    include: {
      board: {
        select: { id: true, name: true },
      },
    },
  },
} as const satisfies Prisma.TeamInclude;

// Type helpers for the includes
export type BoardWithFullIncludes = Prisma.BoardGetPayload<{
  include: typeof BOARD_FULL_INCLUDES;
}>;

export type BoardWithTasks = Prisma.BoardGetPayload<{
  include: typeof BOARD_WITH_TASKS_INCLUDES;
}>;

export type TaskWithSubtasks = Prisma.TaskGetPayload<{
  include: typeof TASK_INCLUDES;
}>;

export type TaskWithColumn = Prisma.TaskGetPayload<{
  include: typeof TASK_WITH_COLUMN_INCLUDES;
}>;

export type UserWithAuth = Prisma.UserGetPayload<{
  include: typeof USER_WITH_AUTH_INCLUDES;
}>;

export type TeamWithRelations = Prisma.TeamGetPayload<{
  include: typeof TEAM_WITH_RELATIONS_INCLUDES;
}>;