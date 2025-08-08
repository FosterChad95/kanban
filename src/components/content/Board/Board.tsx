import React from "react";
import Column, { ColumnType } from "./Column";

type BoardProps = {
  columns: ColumnType[];
};

const Board: React.FC<BoardProps> = ({ columns }) => {
  return (
    <div className="flex flex-col flex-1 min-h-screen ">
      {columns.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center bg-light-gray rounded-lg shadow">
          <p className="mb-6 text-gray-500">
            This board is empty. Create a new column to get started.
          </p>
          <button className="bg-[#635fc7] text-white rounded-full px-6 py-2 font-semibold hover:bg-[#a8a4ff] transition">
            + Add New Column
          </button>
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto">
          {columns.map((column) => (
            <Column key={column.name} column={column} />
          ))}
          <button className="min-w-[280px] w-72 flex-shrink-0 flex items-center justify-center bg-gradient-to-b from-[#e9effa] to-[#f4f7fd] rounded-lg border-2 border-dashed border-[#635fc7] text-[#635fc7] font-semibold hover:bg-[#d6e0ff] transition">
            + New Column
          </button>
        </div>
      )}
    </div>
  );
};

export default Board;
