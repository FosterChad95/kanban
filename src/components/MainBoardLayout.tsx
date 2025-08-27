"use client";
import React, { useState } from "react";
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

const MainBoardLayout: React.FC<MainBoardLayoutProps> = ({ boards }) => {
  const [sidebarVisible, setSidebarVisible] = useState(true);

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
      <Sidebar
        boards={sidebarBoards}
        onBoardClick={() => {}}
        visible={sidebarVisible}
        onHideSidebar={() => setSidebarVisible(false)}
      />

      {/* Right side: Header at top, Board below */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header boards={headerBoards} />
        <main className="flex-1 flex flex-col overflow-auto">
          <Board columns={columns} />
        </main>
      </div>

      {/* Floating show/hide sidebar button */}
      {!sidebarVisible && (
        <button
          aria-label="Show Sidebar"
          onClick={() => setSidebarVisible(true)}
          className="fixed left-0 bottom-0 z-30 -translate-y-1/2 bg-main-purple hover:bg-main-purple-light transition-colors p-2 rounded-r-lg shadow-lg flex items-center justify-center"
          style={{ width: 40, height: 40 }}
        >
          <span className="text-white">{<EyeSlashIcon />}</span>
        </button>
      )}
    </div>
  );
};

export default MainBoardLayout;
