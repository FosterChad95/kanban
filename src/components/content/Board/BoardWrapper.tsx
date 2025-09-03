"use client";
import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Board from "./Board";
import type { Task as TaskType } from "@/util/types";
import { useBoardPusher } from "@/hooks/usePusherListeners";

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
      tasks: (c.tasks || []).map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description ?? null,
        columnId: (task.columnId ?? c.id ?? "") as string,
        boardId: task.boardId ?? null,
        subtasks: (task.subtasks || []).map((s: any) => ({
          id: s.id,
          title: s.title,
          isCompleted: s.isCompleted ?? s.completed ?? false,
        })),
      })),
    }))
  );
  const router = useRouter();

  // Real-time event handlers
  const handleBoardUpdated = useCallback((event: any) => {
    // Only update if it's the same board and not from current user
    if (event.board.id === boardId) {
      const mapped: ColumnType[] = (event.board.columns || []).map((col: any, idx: number) => ({
        id: col.id,
        name: col.name,
        color: getColor(idx),
        tasks: ((col.tasks || []).map((task: any) => ({
          id: task.id,
          title: task.title,
          description: task.description ?? null,
          columnId: (task.columnId ?? col.id ?? "") as string,
          boardId: task.boardId ?? null,
          subtasks: (task.subtasks || []).map((s: any) => ({
            id: s.id,
            title: s.title,
            isCompleted: s.isCompleted ?? s.completed ?? false,
          })),
        })) as TaskType[]) ?? [],
      })) ?? [];
      
      setColumns(mapped);
    }
  }, [boardId]);

  const handleTaskCreated = useCallback((event: any) => {
    if (event.task.boardId === boardId) {
      setColumns(prevColumns => {
        const updatedColumns = [...prevColumns];
        const columnIndex = updatedColumns.findIndex(col => col.id === event.task.columnId);
        
        if (columnIndex !== -1) {
          const newTask: TaskType = {
            id: event.task.id,
            title: event.task.title,
            description: event.task.description ?? null,
            columnId: event.task.columnId,
            boardId: event.task.boardId ?? null,
            subtasks: (event.task.subtasks || []).map((s: any) => ({
              id: s.id,
              title: s.title,
              isCompleted: s.isCompleted ?? s.completed ?? false,
            })),
          };
          
          updatedColumns[columnIndex] = {
            ...updatedColumns[columnIndex],
            tasks: [...updatedColumns[columnIndex].tasks, newTask],
          };
        }
        
        return updatedColumns;
      });
    }
  }, [boardId]);

  const handleTaskUpdated = useCallback((event: any) => {
    if (event.task.boardId === boardId) {
      setColumns(prevColumns => {
        const updatedColumns = [...prevColumns];
        
        // Find and update the task across all columns
        for (const column of updatedColumns) {
          const taskIndex = column.tasks.findIndex(task => task.id === event.task.id);
          if (taskIndex !== -1) {
            const updatedTask: TaskType = {
              id: event.task.id,
              title: event.task.title,
              description: event.task.description ?? null,
              columnId: event.task.columnId,
              boardId: event.task.boardId ?? null,
              subtasks: (event.task.subtasks || []).map((s: any) => ({
                id: s.id,
                title: s.title,
                isCompleted: s.isCompleted ?? s.completed ?? false,
              })),
            };
            
            // If task moved to a different column, remove from current and add to new
            if (event.task.columnId !== column.id) {
              column.tasks.splice(taskIndex, 1);
              const targetColumn = updatedColumns.find(col => col.id === event.task.columnId);
              if (targetColumn) {
                targetColumn.tasks.push(updatedTask);
              }
            } else {
              // Update in place
              column.tasks[taskIndex] = updatedTask;
            }
            break;
          }
        }
        
        return updatedColumns;
      });
    }
  }, [boardId]);

  const handleTaskDeleted = useCallback((event: any) => {
    if (event.boardId === boardId) {
      setColumns(prevColumns => {
        const updatedColumns = [...prevColumns];
        
        // Find and remove the task
        for (const column of updatedColumns) {
          const taskIndex = column.tasks.findIndex(task => task.id === event.taskId);
          if (taskIndex !== -1) {
            column.tasks.splice(taskIndex, 1);
            break;
          }
        }
        
        return updatedColumns;
      });
    }
  }, [boardId]);

  const handleBoardDeleted = useCallback((event: any) => {
    if (event.boardId === boardId) {
      // Redirect to dashboard when board is deleted
      router.push('/dashboard');
    }
  }, [boardId, router]);

  // Set up real-time listeners
  useBoardPusher(boardId, {
    onBoardUpdated: handleBoardUpdated,
    onBoardDeleted: handleBoardDeleted,
    onTaskCreated: handleTaskCreated,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
  });

  const onTaskMove = async (taskId: string, targetColumnId: string) => {
    try {
      // Update the task's column via API
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnId: targetColumnId }),
      });

      if (!response.ok) {
        console.error("Failed to move task");
        return;
      }

      // Local state update will be handled by the real-time listener
      // so we don't need to manually update columns here
    } catch (error) {
      console.error("Failed to move task:", error);
    }
  };

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

      // const columnsToUpdate = formColumns
      //   .filter((col) => col.id && prevColumnIds.includes(col.id as string))
      //   .map((col) => ({
      //     where: { id: col.id },
      //     data: { name: col.name },
      //   }));

      // const columnsToCreate = formColumns
      //   .filter((col) => !col.id)
      //   .map((col) => ({
      //     name: col.name,
      //   }));

      // const columnsToDelete = prevColumns
      //   .filter((col) => !formColumnIds.includes(col.id))
      //   .map((col) => ({ id: col.id }));

      const payload = {
        name: form.name,
        columns: form.columns,
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
            ((col.tasks || []).map((task: any) => ({
              id: task.id,
              title: task.title,
              description: task.description ?? null,
              columnId: (task.columnId ?? col.id ?? "") as string,
              boardId: task.boardId ?? null,
              subtasks: (task.subtasks || []).map((s: any) => ({
                id: s.id,
                title: s.title,
                isCompleted: s.isCompleted ?? s.completed ?? false,
              })),
            })) as TaskType[]) ?? [],
        })) ?? [];

      setColumns(mapped);
      router.refresh();
    } catch (err) {
      console.error("Failed to save board edits:", err);
    } finally {
    }
  };

  return (
    <Board columns={columns} onEditBoard={onEditBoard} boardName={boardName} onTaskMove={onTaskMove} />
  );
}
