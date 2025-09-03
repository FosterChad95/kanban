import React from "react";
import { useDrop } from "react-dnd";
import Task from "./Task";
import type { Task as TaskType } from "@/util/types";
import { cn } from "@/lib/utils";
import { DND_ITEM_TYPES } from "../../../types/dragDrop";
import type { DragItem } from "../../../types/dragDrop";

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
  onTaskMove: (taskId: string, targetColumnId: string) => void;
};

/* Removed colorClasses, will use color directly */

const Column: React.FC<ColumnProps> = ({ column, allColumns, onTaskMove }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: DND_ITEM_TYPES.TASK,
    drop: (item: DragItem) => {
      if (item.columnId !== column.id) {
        onTaskMove(item.id, column.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [column.id, onTaskMove]);

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
      <div 
        ref={drop as any}
        className={cn(
          "flex flex-col gap-5 min-h-[200px] p-2 rounded-lg transition-colors",
          isOver ? "bg-blue-50 dark:bg-blue-900/20" : "bg-transparent"
        )}
      >
        {column.tasks.map((task: TaskType, index: number) => (
          <Task 
            key={task.id} 
            task={{ ...task, columnOptions: allColumns }} 
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default Column;
