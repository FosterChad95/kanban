import React from "react";
import Task from "./Task";
import type { Task as TaskType } from "@/util/types";
import { cn } from "@/lib/utils";

type ColumnProps = {
  column: {
    id: string;
    name: string;
    color: string;
    tasks: TaskType[];
  };
  allColumns: {
    id: string;
    name: string;
    color: string;
    tasks: TaskType[];
  }[];
};

/* Removed colorClasses, will use color directly */

const Column: React.FC<ColumnProps> = ({ column, allColumns }) => {
  return (
    <div className="min-w-[280px] w-72 flex-shrink-0">
      <div className="flex items-center gap-2 mb-6">
        <span
          className={cn("h-3 w-3 rounded-full")}
          style={{ backgroundColor: column.color }}
        ></span>
        <span className="uppercase text-xs tracking-widest text-gray-500 dark:text-light-gray font-semibold">
          {column.name} ({column.tasks.length})
        </span>
      </div>
      <div className="flex flex-col gap-5">
        {column.tasks.map((task: Task) => (
          <Task key={task.id} task={{ ...task, columnOptions: allColumns }} />
        ))}
      </div>
    </div>
  );
};

export default Column;
