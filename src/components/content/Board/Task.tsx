import React from "react";
import { useModal } from "../../../providers/ModalProvider";
import ViewTaskModal from "../../ui/Modal/ViewTaskModal";
import type { Task } from "@/util/types";

type TaskProps = {
  task: Task & { columnOptions: any[] };
};

const Task: React.FC<TaskProps> = ({ task }) => {
  const { openModal } = useModal();
  const completedCount = task.subtasks.filter((s) => s.isCompleted).length;

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
      className="bg-white dark:bg-dark-gray rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition"
      onClick={handleClick}
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
