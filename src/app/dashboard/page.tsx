import { getBoardsForUser } from "../../queries/boardQueries";
import { getCurrentUser } from "../../lib/auth";
import { redirect } from "next/navigation";

/**
 * Dashboard index: fetch user's boards and redirect to the first board.
 * The actual board UI is rendered in app/dashboard/[boardId]/page.tsx wrapped
 * by app/dashboard/layout.tsx (MainBoardLayout).
 */
export default async function DashboardIndexPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signin");
  }

  // If admin, redirect to admin page
  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  const dbBoards = await getBoardsForUser({
    id: user.id,
    role: user.role,
  });

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

  // Redirect to the first available board
  redirect(`/dashboard/${boards[0].id}`);
}
