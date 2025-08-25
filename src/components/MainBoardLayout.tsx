"use client";
import React, { useState } from "react";
import Header from "./content/Header/Header";
import Sidebar from "./content/Sidebar/Sidebar";
import Board from "./content/Board/Board";
import type { ColumnType } from "./content/Board/Column";

type BoardData = {
  id: string;
  name: string;
  active: boolean;
  columns: ColumnType[];
};

interface MainBoardLayoutProps {
  boards: BoardData[];
  columns: ColumnType[];
}

const MainBoardLayout: React.FC<MainBoardLayoutProps> = ({
  boards,
  columns,
}) => {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // For Header, convert boards to expected prop shape
  const headerBoards = boards.map((b) => ({
    name: b.name,
    active: b.active,
    columns: b.columns.map((col) => ({
      id: col.name, // Use name as id for mock/demo
      name: col.name,
    })),
  }));

  // For Sidebar, pass id and name
  const sidebarBoards = boards.map((b) => ({
    id: b.id,
    name: b.name,
  }));

  return (
    <div className="flex min-h-screen bg-light-gray">
      {/* Sidebar */}
      {sidebarVisible && (
        <Sidebar
          boards={sidebarBoards}
          onBoardClick={() => {}}
          onCreateBoard={() => {}}
        />
      )}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <Header boards={headerBoards} />
        {/* Board */}
        <main className="flex-1 flex flex-col">
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
