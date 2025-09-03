"use client";
import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Header from "./content/Header/Header";
import Sidebar from "./content/Sidebar/Sidebar";
import type { Board, Column } from "@/util/types";
import EyeSlashIcon from "./ui/Icon/EyeSlashIcon";
import { usePusherListeners } from "@/hooks/usePusherListeners";

interface MainBoardLayoutProps {
  boards: Board[];
  children: React.ReactNode;
}

const MainBoardLayout: React.FC<MainBoardLayoutProps> = ({
  boards: initialBoards,
  children,
}) => {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [boards, setBoards] = useState(initialBoards);
  const router = useRouter();

  // Handle real-time board events
  const handleBoardCreated = useCallback((event: any) => {
    try {
      const newBoard = event.board;
      console.log('Board created event received:', newBoard);
      
      if (!newBoard || !newBoard.id) {
        console.error('Invalid board data in creation event:', newBoard);
        return;
      }
      
      // Add new board to the list if it doesn't already exist
      setBoards(prevBoards => {
        const exists = prevBoards.some(board => board.id === newBoard.id);
        if (!exists) {
          console.log('Adding new board to layout:', newBoard.id);
          return [...prevBoards, newBoard];
        }
        console.log('Board already exists, skipping add:', newBoard.id);
        return prevBoards;
      });

      // Navigate to the new board with a small delay to ensure state update
      setTimeout(() => {
        console.log('Navigating to new board:', newBoard.id);
        router.push(`/dashboard/${newBoard.id}`);
      }, 100);
    } catch (error) {
      console.error('Error handling board creation event:', error);
    }
  }, [router]);

  const handleBoardUpdated = useCallback((event: any) => {
    const updatedBoard = event.board;
    console.log('Board updated event received:', updatedBoard);
    
    setBoards(prevBoards => 
      prevBoards.map(board => 
        board.id === updatedBoard.id ? { ...board, ...updatedBoard } : board
      )
    );
  }, []);

  const handleBoardDeleted = useCallback((event: any) => {
    const deletedBoardId = event.boardId;
    console.log('Board deleted event received:', deletedBoardId);
    
    setBoards(prevBoards => 
      prevBoards.filter(board => board.id !== deletedBoardId)
    );

    // If we're currently viewing the deleted board, redirect to dashboard
    if (typeof window !== 'undefined' && window.location.pathname.includes(deletedBoardId)) {
      router.push('/dashboard');
    }
  }, [router]);

  // Set up Pusher listeners for board events
  usePusherListeners({
    callbacks: {
      onBoardCreated: handleBoardCreated,
      onBoardUpdated: handleBoardUpdated,
      onBoardDeleted: handleBoardDeleted,
    },
    enabled: true,
  });

  // Prepare props for Header
  const headerBoards = boards.map((b) => ({
    id: b.id,
    name: b.name,
    active: false, // Header will determine active board using route params (client-side)
    columns: b.columns.map((col: Column) => ({
      id: col.id,
      name: col.name,
    })),
    hasTeam: b.hasTeam,
    teams: b.teams,
    users: b.users,
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
