"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Board from "./Board";

type SubtaskType = { id: string; title: string; completed: boolean };
type TaskType = {
  id: string;
  title: string;
  description?: string | null;
  columnId?: string;
  subtasks: SubtaskType[];
};
type ColumnType = {
  id: string;
  name: string;
  color: string;
  tasks: TaskType[];
};

const colorPalette = ["teal", "purple", "green"] as const;
const getColor = (idx: number) => colorPalette[idx % colorPalette.length];

interface BoardWrapperProps {
  boardId: string;
  initialColumns: ColumnType[];
  boardName?: string;
}

/**
 * Client wrapper around Board to provide onEditBoard handler that persists
 * column changes to the API and updates local state (no full page refresh).
 */
export default function BoardWrapper({
  boardId,
  initialColumns,
  boardName,
}: BoardWrapperProps) {
  const [columns, setColumns] = useState<ColumnType[]>(
    initialColumns.map((c, i) => ({
      id: c.id,
      name: c.name,
      color: c.color ?? getColor(i),
      tasks: c.tasks ?? [],
    }))
  );
  const router = useRouter();

  const onEditBoard = async (form: {
    name: string;
    columns: { id?: string; name: string }[];
  }) => {
    if (!boardId) return;

    try {
      // Build payload similar to existing logic elsewhere: update/create/delete
      const prevColumns = columns;
      const formColumns = form.columns || [];
      const prevColumnIds = prevColumns.map((c) => c.id);
      const formColumnIds = formColumns
        .map((c) => c.id)
        .filter(Boolean) as string[];

      const columnsToUpdate = formColumns
        .filter((col) => col.id && prevColumnIds.includes(col.id as string))
        .map((col) => ({
          where: { id: col.id },
          data: { name: col.name },
        }));

      const columnsToCreate = formColumns
        .filter((col) => !col.id)
        .map((col) => ({
          name: col.name,
        }));

      const columnsToDelete = prevColumns
        .filter((col) => !formColumnIds.includes(col.id))
        .map((col) => ({ id: col.id }));

      const payload = {
        name: form.name,
        columns: {
          update: columnsToUpdate,
          create: columnsToCreate,
          delete: columnsToDelete,
        },
      };

      const res = await fetch(`/api/boards/${boardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        console.error("Failed to update board", errText);
        return;
      }

      const updated = await res.json();

      // Map updated columns into Board shape the Board component expects (strict types)
      const mapped: ColumnType[] =
        (updated.columns || []).map((col: any, idx: number) => ({
          id: col.id,
          name: col.name,
          color: getColor(idx),
          tasks:
            (col.tasks || []).map((task: any) => ({
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

      setColumns(mapped);
      router.refresh();
    } catch (err) {
      console.error("Failed to save board edits:", err);
    } finally {
    }
  };

  return (
    <Board columns={columns} onEditBoard={onEditBoard} boardName={boardName} />
  );
}
