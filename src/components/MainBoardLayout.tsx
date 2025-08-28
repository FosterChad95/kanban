"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./content/Header/Header";
import Sidebar from "./content/Sidebar/Sidebar";
import Board from "./content/Board/Board";
import type { Board as BoardType, Column, Task, Subtask } from "@prisma/client";
import EyeSlashIcon from "./ui/Icon/EyeSlashIcon";

interface MainBoardLayoutProps {
  boards: Array<
    BoardType & {
      columns: Array<
        Column & {
          tasks: Array<
            Task & {
              subtasks: Subtask[];
            }
          >;
        }
      >;
    }
  >;
}

const MainBoardLayout: React.FC<MainBoardLayoutProps> = ({
  boards: initialBoards,
}) => {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [boards, setBoards] = useState(initialBoards);

  // Prepare props for Header
  const headerBoards = boards.map((b, idx) => ({
    id: b.id,
    name: b.name,
    active: idx === 0,
    columns: b.columns.map((col: Column) => ({
      id: col.id,
      name: col.name,
    })),
  }));

  // Prepare props for Sidebar
  const sidebarBoards = boards.map((b) => ({
    id: b.id,
    name: b.name,
  }));

  // Color palette for columns
  const colorPalette = ["teal", "purple", "green"] as const;
  const getColor = (idx: number) => colorPalette[idx % colorPalette.length];

  // Flatten columns for Board (using first board)
  const currentBoard = boards[0];
  const columns =
    currentBoard?.columns.map(
      (
        col: Column & { tasks: Array<Task & { subtasks: Subtask[] }> },
        idx: number
      ) => ({
        id: col.id,
        name: col.name,
        color: getColor(idx),
        tasks: col.tasks.map((task: Task & { subtasks: Subtask[] }) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          columnId: task.columnId,
          subtasks: task.subtasks.map((sub: Subtask) => ({
            id: sub.id,
            title: sub.title,
            completed: sub.isCompleted,
          })),
        })),
      })
    ) ?? [];

  return (
    <div className="flex min-h-screen bg-light-gray">
      {/* Sidebar on the left spanning full height */}
      <AnimatePresence initial={false}>
        {sidebarVisible && (
          <motion.div
            key="sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
            style={{ overflow: "hidden" }}
          >
            <Sidebar
              boards={sidebarBoards}
              onBoardClick={() => {}}
              visible={sidebarVisible}
              onHideSidebar={() => setSidebarVisible(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right side: Header at top, Board below */}
      <motion.div
        className="flex flex-col flex-1 overflow-hidden"
        layout
        transition={{ type: "spring", stiffness: 200, damping: 30 }}
      >
        <Header boards={headerBoards} />
        <main className="flex-1 flex flex-col overflow-auto">
          <Board
            columns={columns}
            onEditBoard={async (form) => {
              if (!boards.length) return;
              const boardId = boards[0].id;
              const prevColumns = boards[0].columns;

              // Determine columns to update, create, and delete
              const formColumns = form.columns;
              const prevColumnIds = prevColumns.map((col) => col.id);
              const formColumnIds = formColumns.map((col) => col.id);

              // Columns to update (existing in both)
              const columnsToUpdate = formColumns
                .filter((col) => prevColumnIds.includes(col.id))
                .map((col) => ({
                  where: { id: col.id },
                  data: { name: col.name },
                }));

              // Columns to create (new in form, not in prev)
              const columnsToCreate = formColumns
                .filter((col) => !prevColumnIds.includes(col.id))
                .map((col) => ({
                  name: col.name,
                  boardId: boardId,
                }));

              // Columns to delete (in prev, not in form)
              const columnsToDelete = prevColumns
                .filter((col) => !formColumnIds.includes(col.id))
                .map((col) => ({ id: col.id }));

              // Build Prisma update shape
              const payload = {
                name: form.name,
                columns: {
                  update: columnsToUpdate,
                  create: columnsToCreate,
                  delete: columnsToDelete,
                },
              };

              try {
                const res = await fetch(`/api/boards/${boardId}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error("Failed to update board");
                const updated = await res.json();
                setBoards((prevBoards) => {
                  const updatedBoards = [...prevBoards];
                  updatedBoards[0] = updated;
                  return updatedBoards;
                });
              } catch (err) {
                // Optionally handle error (e.g., show notification)
                console.error(err);
              }
            }}
          />
        </main>
      </motion.div>

      {/* Floating show/hide sidebar button */}
      <AnimatePresence>
        {!sidebarVisible && (
          <motion.button
            key="show-sidebar-btn"
            aria-label="Show Sidebar"
            onClick={() => setSidebarVisible(true)}
            className="fixed left-0 bottom-0 z-30 -translate-y-1/2 bg-main-purple hover:bg-main-purple-light transition-colors p-2 rounded-r-lg shadow-lg flex items-center justify-center"
            style={{ width: 40, height: 40 }}
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
          >
            <span className="text-white">{<EyeSlashIcon />}</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainBoardLayout;
