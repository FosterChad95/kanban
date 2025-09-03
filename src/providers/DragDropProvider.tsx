"use client";

import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

interface DragDropProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that enables React DnD functionality for the entire application.
 * Uses HTML5Backend for native HTML5 drag and drop behavior.
 */
export const DragDropProvider: React.FC<DragDropProviderProps> = ({ children }) => {
  return (
    <DndProvider backend={HTML5Backend}>
      {children}
    </DndProvider>
  );
};

export default DragDropProvider;