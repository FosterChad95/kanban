import React from "react";
import Task, { TaskType } from "./Task";

type ColumnType = {
  name: string;
  color: string;
  tasks: TaskType[];
};

type ColumnProps = {
  column: ColumnType;
};

const Column: React.FC<ColumnProps> = ({ column }) => {
  return (
    <div className="min-w-[280px] w-72 flex-shrink-0">
      <div className="flex items-center gap-2 mb-6">
        <span
          className={`h-3 w-3 rounded-full ${column.color} border-2`}
        ></span>
        <span className="uppercase text-xs tracking-widest text-gray-500 font-semibold">
          {column.name} ({column.tasks.length})
        </span>
      </div>
      <div className="flex flex-col gap-5">
        {column.tasks.map((task) => (
          <Task key={task.title} task={task} />
        ))}
      </div>
    </div>
  );
};

export type { ColumnType };
export default Column;
