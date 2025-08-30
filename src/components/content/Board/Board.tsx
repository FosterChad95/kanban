"use client";

import React from "react";
import Column from "./Column";
import Button from "../../ui/Button/Button";
import { useModal } from "../../../providers/ModalProvider";
import EditBoardModal from "../../ui/Modal/EditBoardModal";

import randomColor from "randomcolor";
import type { Task as TaskType } from "@/util/types";
import type { BoardInput } from "../../../schemas/forms";

type ColumnType = {
  id: string;
  name: string;
  color: string;
  tasks: TaskType[];
};

type BoardProps = {
  columns: ColumnType[];
  boardName?: string;
  onEditBoard?: (form: {
    name: string;
    columns: { id?: string; name: string }[];
  }) => void;
};

const Board: React.FC<BoardProps> = ({ columns, boardName, onEditBoard }) => {
  const { openModal, closeModal } = useModal();

  const handleOpenEditBoard = () => {
    const boardData: BoardInput = {
      name: boardName ?? "Board",
      columns: columns.map((c) => ({
        id: c.id,
        name: c.name,
      })),
    };
    openModal(
      <EditBoardModal
        board={boardData}
        onEdit={(form) => {
          if (onEditBoard) {
            onEditBoard({ ...form, columns: form.columns ?? [] });
          }
          closeModal();
        }}
      />
    );
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-light-gray dark:bg-very-dark-gray p-6">
      {columns.length === 0 ? (
        <div className="flex flex-1 h-full flex-col items-center justify-center rounded-lg">
          <p className="mb-6 text-medium-gray dark:text-light-gray font-bold text-lg">
            This board is empty. Create a new column to get started.
          </p>
          <Button variant="primary-l" onClick={handleOpenEditBoard}>
            + Add New Column
          </Button>
        </div>
      ) : (
        <div className="flex gap-6 h-full overflow-x-auto">
          {columns.map((column: ColumnType, idx: number) => {
            // Assign a random color if not present
            const color =
              column.color && /^#([0-9A-F]{3}){1,2}$/i.test(column.color)
                ? column.color
                : randomColor({ luminosity: "light", seed: column.id || idx });
            return (
              <Column
                key={column.id}
                column={{ ...column, color }}
                allColumns={columns.map((c, i) => ({
                  ...c,
                  color:
                    c.color && /^#([0-9A-F]{3}){1,2}$/i.test(c.color)
                      ? c.color
                      : randomColor({ luminosity: "light", seed: c.id || i }),
                }))}
              />
            );
          })}
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
