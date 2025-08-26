import React from "react";
import MainBoardLayout from "../../components/MainBoardLayout";
import { getAllBoards } from "../../queries/boardQueries";

/**
 * Dashboard page (protected by middleware.ts at /dashboard)
 * This server component fetches boards and renders the MainBoardLayout.
 * Authentication/redirects are handled by the NextAuth middleware (middleware.ts),
 * so this page does not perform any session-based redirects itself.
 */
export default async function DashboardPage() {
  const dbBoards = await getAllBoards();

  const boards = dbBoards.map((board) => ({
    id: board.id,
    name: board.name,
    columns: board.columns.map((col) => ({
      id: col.id,
      name: col.name,
      boardId: col.boardId,
      tasks: col.tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        columnId: task.columnId,
        subtasks: task.subtasks.map((sub) => ({
          id: sub.id,
          title: sub.title,
          isCompleted: sub.isCompleted,
          taskId: sub.taskId,
        })),
      })),
    })),
  }));

  return <MainBoardLayout boards={boards} />;
}
