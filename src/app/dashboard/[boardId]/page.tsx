import React from "react";
import Board from "../../../components/content/Board/Board";
import { getBoardById } from "../../../queries/boardQueries";
import { redirect } from "next/navigation";

/**
 * Dynamic board page. The dashboard layout (app/dashboard/layout.tsx)
 * wraps this page with MainBoardLayout so header + sidebar remain consistent.
 */
export default async function BoardPage({
  params,
}: {
  params: { boardId: string };
}) {
  const { boardId } = params;

  const board = await getBoardById(boardId);

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
        (col as any).tasks?.map((task: any) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          columnId: task.columnId,
          subtasks: (task.subtasks || []).map((s: any) => ({
            id: s.id,
            title: s.title,
            completed: s.isCompleted,
          })),
        })) ?? [],
    })) ?? [];

  // Board is rendered as a client component (Board). We don't pass an onEditBoard
  // here because header's edit flow already performs updates and calls router.refresh().
  return <Board columns={columns} />;
}
