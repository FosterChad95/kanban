import React from "react";
import { useDrag } from "react-dnd";
import { useModal } from "../../../providers/ModalProvider";
import ViewTaskModal from "../../ui/Modal/ViewTaskModal";
import type { Task } from "@/util/types";
import { DND_ITEM_TYPES } from "../../../types/dragDrop";
import type { DragItem } from "../../../types/dragDrop";

type TaskProps = {
  task: Task & { columnOptions: any[] };
  index: number;
};

const Task: React.FC<TaskProps> = ({ task, index }) => {
  const { openModal } = useModal();
  const completedCount = task.subtasks.filter((s) => s.isCompleted).length;

  const [{ isDragging }, drag] = useDrag(() => ({
    type: DND_ITEM_TYPES.TASK,
    item: (): DragItem => ({
      type: DND_ITEM_TYPES.TASK,
      id: task.id,
      columnId: task.columnId,
      index,
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [task.id, task.columnId, index]);

  const handleClick = () => {
    openModal(
      <ViewTaskModal
        task={task}
        columnOptions={task.columnOptions ?? []}
        onEdit={async (form) => {
          if (!task.id) {
            alert("Task ID missing. Cannot edit task.");
            return;
          }
          await fetch(`/api/tasks/${task.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          });
        }}
        onDelete={async () => {
          if (!task.id) {
            alert("Task ID missing. Cannot delete task.");
            return;
          }
          await fetch(`/api/tasks/${task.id}`, {
            method: "DELETE",
          });
        }}
      />
    );
  };

  return (
    <div
      ref={drag as any}
      className={`bg-white dark:bg-dark-gray rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition ${
        isDragging ? "opacity-50" : ""
      }`}
      onClick={handleClick}
      style={{
        transform: isDragging ? "rotate(5deg)" : "none",
      }}
    >
      <div className="font-semibold text-gray-900 dark:text-light-gray mb-2">
        {task.title}
      </div>
      <div className="text-xs text-gray-500 dark:text-light-gray">
        {completedCount} of {task.subtasks.length} subtasks
      </div>
    </div>
  );
};

export default Task;
