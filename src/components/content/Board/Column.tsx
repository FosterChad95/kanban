import React from "react";
import Task, { TaskType } from "./Task";
import { cn } from "@/lib/utils";

type ColumnType = {
  name: string;
  color: "teal" | "purple" | "green";
  tasks: TaskType[];
};

type ColumnProps = {
  column: ColumnType;
};

const colorClasses: Record<ColumnType["color"], string> = {
  teal: "bg-[#49c4e5]",
  purple: "bg-[#8471F2]",
  green: "bg-[#67e2ae]",
};

const Column: React.FC<ColumnProps> = ({ column }) => {
  return (
    <div className="min-w-[280px] w-72 flex-shrink-0">
      <div className="flex items-center gap-2 mb-6">
        <span
          className={cn(`h-3 w-3 rounded-full`, colorClasses[column.color])}
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
