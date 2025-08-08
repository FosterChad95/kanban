import React from "react";
import Column, { ColumnType } from "./Column";

const demoColumns: ColumnType[] = [
  {
    name: "TODO",
    color: "border-blue-500",
    tasks: [
      {
        title: "Build UI for onboarding flow",
        subtasks: [
          { title: "Subtask 1", completed: false },
          { title: "Subtask 2", completed: false },
        ],
      },
      {
        title: "Build UI for search",
        subtasks: [
          { title: "Subtask 1", completed: false },
          { title: "Subtask 2", completed: false },
        ],
      },
      {
        title: "Build settings UI",
        subtasks: [
          { title: "Subtask 1", completed: false },
          { title: "Subtask 2", completed: false },
        ],
      },
      {
        title: "QA and test all major user journeys",
        subtasks: [
          { title: "Subtask 1", completed: false },
          { title: "Subtask 2", completed: false },
        ],
      },
    ],
  },
  {
    name: "DOING",
    color: "border-purple-500",
    tasks: [
      {
        title: "Design settings and search pages",
        subtasks: [
          { title: "Subtask 1", completed: false },
          { title: "Subtask 2", completed: false },
        ],
      },
      {
        title: "Add account management endpoints",
        subtasks: [
          { title: "Subtask 1", completed: false },
          { title: "Subtask 2", completed: false },
        ],
      },
      {
        title: "Design onboarding flow",
        subtasks: [
          { title: "Subtask 1", completed: false },
          { title: "Subtask 2", completed: false },
        ],
      },
      {
        title: "Add search endpoints",
        subtasks: [
          { title: "Subtask 1", completed: false },
          { title: "Subtask 2", completed: false },
        ],
      },
    ],
  },
  {
    name: "DONE",
    color: "border-green-500",
    tasks: [
      {
        title: "Conduct 5 wireframe tests",
        subtasks: [{ title: "Subtask 1", completed: true }],
      },
      {
        title: "Create wireframe prototype",
        subtasks: [{ title: "Subtask 1", completed: true }],
      },
      {
        title: "Review results of usability tests and iterate",
        subtasks: [{ title: "Subtask 1", completed: true }],
      },
      {
        title:
          "Create paper prototypes and conduct 10 usability tests with potential customers",
        subtasks: [{ title: "Subtask 1", completed: true }],
      },
      {
        title: "Market discovery",
        subtasks: [{ title: "Subtask 1", completed: true }],
      },
      {
        title: "Competitor analysis",
        subtasks: [{ title: "Subtask 1", completed: true }],
      },
      {
        title: "Research the market",
        subtasks: [
          { title: "Subtask 1", completed: true },
          { title: "Subtask 2", completed: true },
        ],
      },
    ],
  },
];

type BoardProps = {
  columns?: ColumnType[];
};

const Board: React.FC<BoardProps> = ({ columns = demoColumns }) => {
  return (
    <div className="flex flex-col flex-1 bg-[#f4f7fd] min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold text-gray-900">Platform Launch</h1>
        <button className="bg-[#635fc7] text-white rounded-full px-6 py-2 font-semibold hover:bg-[#a8a4ff] transition">
          + Add New Task
        </button>
      </div>
      {columns.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center bg-white rounded-lg shadow">
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
