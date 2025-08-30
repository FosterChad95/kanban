"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./content/Header/Header";
import Sidebar from "./content/Sidebar/Sidebar";
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
  children: React.ReactNode;
}

const MainBoardLayout: React.FC<MainBoardLayoutProps> = ({
  boards: initialBoards,
  children,
}) => {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [boards] = useState(initialBoards);

  // Prepare props for Header
  const headerBoards = boards.map((b) => ({
    id: b.id,
    name: b.name,
    active: false, // Header will determine active board using route params (client-side)
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

  return (
    <div className="flex min-h-screen bg-light-gray dark:bg-very-dark-gray">
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
              visible={sidebarVisible}
              onHideSidebar={() => setSidebarVisible(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right side: Header at top, page children below */}
      <motion.div
        className="flex flex-col flex-1 overflow-hidden"
        layout
        transition={{ type: "spring", stiffness: 200, damping: 30 }}
      >
        <Header boards={headerBoards} />
        <main className="flex-1 flex flex-col overflow-auto">{children}</main>
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
