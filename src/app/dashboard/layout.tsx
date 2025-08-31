import React from "react";
import MainBoardLayout from "../../components/MainBoardLayout";
import { getBoardsForUser } from "../../queries/boardQueries";
import { getCurrentUser } from "../../lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signin");
  }

  // If admin, redirect to admin page
  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  const dbBoards = await getBoardsForUser({ id: user.id, role: user.role });

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
        boardId: col.boardId,
        subtasks: task.subtasks.map((sub) => ({
          id: sub.id,
          title: sub.title,
          isCompleted: sub.isCompleted,
          taskId: sub.taskId,
        })),
      })),
    })),
  }));

  // If no boards, redirect to create board page
  if (boards.length === 0) {
    redirect("/dashboard/create-board");
  }

  return <MainBoardLayout boards={boards}>{children}</MainBoardLayout>;
}
