"use client";

import React from "react";
import Column, { ColumnType } from "./Column";
import Button from "../../ui/Button/Button";
import { useModal } from "../../../providers/ModalProvider";
import EditBoardModal from "../../ui/Modal/EditBoardModal";

type BoardProps = {
  columns: ColumnType[];
};

const Board: React.FC<BoardProps> = ({ columns }) => {
  const { openModal, closeModal } = useModal();

  const handleOpenEditBoard = () => {
    const boardData = {
      name: "Board",
      columns: columns.map((c) => ({ id: c.id, name: c.name })),
    };
    openModal(
      <EditBoardModal
        board={boardData}
        onEdit={() => {
          closeModal();
        }}
      />
    );
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-light-gray p-6">
      {columns.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-lg">
          <p className="mb-6 text-medium-gray font-bold text-lg">
            This board is empty. Create a new column to get started.
          </p>
          <Button variant="primary-l" onClick={handleOpenEditBoard}>
            + Add New Column
          </Button>
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto">
          {columns.map((column) => (
            <Column key={column.id} column={column} allColumns={columns} />
          ))}
          <Button
            variant="secondary"
            className="min-w-[280px] w-72 flex-shrink-0"
            onClick={handleOpenEditBoard}
          >
            + New Column
          </Button>
        </div>
      )}
    </div>
  );
};

export default Board;
