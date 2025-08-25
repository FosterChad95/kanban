"use client";
import React, { useState } from "react";
import Header from "./content/Header/Header";
import Sidebar from "./content/Sidebar/Sidebar";
import Board from "./content/Board/Board";
import type { Board as BoardType, Column, Task, Subtask } from "@prisma/client";

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

const MainBoardLayout: React.FC<MainBoardLayoutProps> = ({ boards }) => {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // For Header, convert boards to expected prop shape
  const headerBoards = boards.map((b) => ({
    name: b.name,
    // Prisma does not provide "active" field, so default to false or handle elsewhere
    active: false,
    columns: b.columns.map((col: Column) => ({
      id: col.id,
      name: col.name,
    })),
  }));

  // For Sidebar, pass id and name
  const sidebarBoards = boards.map((b) => ({
    id: b.id,
    name: b.name,
  }));

  // Assign colors to columns (cycling through available colors)
  const colorPalette = ["teal", "purple", "green"] as const;
  const getColor = (idx: number) => colorPalette[idx % colorPalette.length];

  // Flatten all columns for the current board (assuming first board for demo)
  const currentBoard = boards[0];
  const columns =
    currentBoard?.columns.map(
      (
        col: Column & { tasks: Array<Task & { subtasks: Subtask[] }> },
        idx: number
      ) => ({
        name: col.name,
        color: getColor(idx),
        tasks: col.tasks.map((task: Task & { subtasks: Subtask[] }) => ({
          title: task.title,
          subtasks: task.subtasks.map((sub: Subtask) => ({
            title: sub.title,
            completed: sub.isCompleted,
          })),
        })),
      })
    ) ?? [];

  return (
    <div className="flex flex-col min-h-screen bg-light-gray">
      {/* Header */}
      <Header boards={headerBoards} />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar below Header */}
        {sidebarVisible && (
          <Sidebar
            boards={sidebarBoards}
            onBoardClick={() => {}}
            onCreateBoard={() => {}}
            // Optionally, pass a className to control height/scroll
            // className="h-full max-h-full overflow-y-auto"
          />
        )}
        {/* Board */}
        <main className="flex-1 flex flex-col overflow-auto">
          <Board columns={columns} />
        </main>
      </div>
      {/* Floating show/hide sidebar button (optional, for demo) */}
      {!sidebarVisible && (
        <button
          aria-label="Show Sidebar"
          onClick={() => setSidebarVisible(true)}
          className="fixed left-0 bottom-0 z-30 -translate-y-1/2 bg-main-purple hover:bg-main-purple-light transition-colors p-2 rounded-r-lg shadow-lg flex items-center justify-center"
          style={{ width: 40, height: 40 }}
        >
          {/* EyeSlashIcon or similar */}
          <span className="text-white">{"<"}</span>
        </button>
      )}
    </div>
  );
};

export default MainBoardLayout;
