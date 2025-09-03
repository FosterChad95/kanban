import React from "react";
import BoardWrapper from "../../../components/content/Board/BoardWrapper";
import { getBoardByIdWithAccess } from "../../../queries/boardQueries";
import { getCurrentUser } from "../../../lib/auth";
import { redirect } from "next/navigation";

/**
 * Dynamic board page. The dashboard layout (app/dashboard/layout.tsx)
 * wraps this page with MainBoardLayout so header + sidebar remain consistent.
 */
export default async function BoardPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const resolvedParams = await params;
  const { boardId } = resolvedParams;

  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/signin");
  }

  const board = await getBoardByIdWithAccess(boardId, { id: user.id, role: user.role });

  if (!board) {
    // If board not found, go back to dashboard root (which will redirect appropriately)
    redirect("/dashboard");
  }

  // Color palette for columns (keeps parity with MainBoardLayout)
  const colorPalette = ["teal", "purple", "green"] as const;
  const getColor = (idx: number) => colorPalette[idx % colorPalette.length];

  const columns =
    board?.columns.map((col, idx) => ({
      id: col.id,
      name: col.name,
      color: getColor(idx),
      tasks:
        col.tasks?.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          columnId: task.columnId,
          subtasks: (task.subtasks || []).map((s: any) => ({
            id: s.id,
            title: s.title,
            isCompleted: s.isCompleted,
          })),
        })) ?? [],
    })) ?? [];

  // Board is rendered as a client component. Use BoardWrapper (client) so it can
  // persist column edits for the currently selected board without a full refresh.
  return (
    <BoardWrapper
      boardId={boardId}
      initialColumns={columns}
      boardName={board.name}
    />
  );
}
