/**
 * Data transformation utilities for normalizing database entities
 * into consistent client-facing formats.
 */

import type { BoardWithFullIncludes } from "../lib/prisma-includes";
import type { Board } from "./types";

/**
 * Normalizes team data from Prisma's relational format to simple objects.
 * Transforms { teams: [{ team: { id, name } }] } to { teams: [{ id, name }] }
 */
export function normalizeTeams<T extends { teams?: Array<{ team: { id: string; name: string } }> }>(
  entity: T
): Omit<T, "teams"> & { teams: Array<{ id: string; name: string }> } {
  return {
    ...entity,
    teams: Array.isArray(entity.teams)
      ? entity.teams.map((tb) => ({ id: tb.team.id, name: tb.team.name }))
      : [],
  };
}

/**
 * Normalizes user data from Prisma's relational format to simple objects.
 * Transforms { users: [{ user: { id, name } }] } to { users: [{ id, name }] }
 */
export function normalizeUsers<T extends { users?: Array<{ user: { id: string; name: string | null } }> }>(
  entity: T
): Omit<T, "users"> & { users: Array<{ id: string; name: string }> } {
  return {
    ...entity,
    users: Array.isArray(entity.users)
      ? entity.users.map((ub) => ({ id: ub.user.id, name: ub.user.name || 'Unknown' }))
      : [],
  };
}

/**
 * Normalizes both teams and users for entities that have both relationships.
 * Commonly used for board entities.
 */
export function normalizeTeamsAndUsers<
  T extends {
    teams?: Array<{ team: { id: string; name: string } }>;
    users?: Array<{ user: { id: string; name: string | null } }>;
  }
>(
  entity: T
): Omit<T, "teams" | "users"> & {
  teams: Array<{ id: string; name: string }>;
  users: Array<{ id: string; name: string }>;
} {
  return {
    ...entity,
    teams: Array.isArray(entity.teams)
      ? entity.teams.map((tb) => ({ id: tb.team.id, name: tb.team.name }))
      : [],
    users: Array.isArray(entity.users)
      ? entity.users.map((ub) => ({ id: ub.user.id, name: ub.user.name || 'Unknown' }))
      : [],
  };
}

/**
 * Specialized transformer for board entities that adds the hasTeam flag
 * and performs team/user normalization.
 */
export function transformBoard(board: BoardWithFullIncludes): Board {
  const normalized = normalizeTeamsAndUsers(board);
  return {
    id: board.id,
    name: board.name,
    columns: (board.columns || []).map(col => ({
      id: col.id,
      name: col.name,
      boardId: col.boardId,
      tasks: (col.tasks || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        columnId: task.columnId,
        boardId: task.boardId,
        subtasks: (task.subtasks || []).map(subtask => ({
          id: subtask.id,
          title: subtask.title,
          isCompleted: subtask.isCompleted
        }))
      }))
    })),
    teams: normalized.teams,
    users: normalized.users,
    hasTeam: Array.isArray(normalized.teams) && normalized.teams.length > 0,
  };
}

/**
 * Transforms an array of boards, normalizing each one.
 */
export function transformBoards(boards: BoardWithFullIncludes[]) {
  return boards.map(transformBoard);
}