import React from "react";
import { useModal } from "../../../providers/ModalProvider";
import ViewTaskModal from "../../ui/Modal/ViewTaskModal";

export type Subtask = {
  id: string;
  title: string;
  completed: boolean;
};

export type TaskType = {
  id: string;
  title: string;
  description: string;
  subtasks: Subtask[];
  columnId: string;
  columnOptions: any[];
};

type TaskProps = {
  task: TaskType;
};

const Task: React.FC<TaskProps> = ({ task }) => {
  const { openModal } = useModal();
  const completedCount = task.subtasks.filter((s) => s.completed).length;

  const handleClick = () => {
    openModal(
      <ViewTaskModal
        title={task.title}
        description={task.description}
        subtasks={task.subtasks}
        columnId={task.columnId ?? ""}
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
          window.location.reload();
        }}
        onDelete={async () => {
          if (!task.id) {
            alert("Task ID missing. Cannot delete task.");
            return;
          }
          await fetch(`/api/tasks/${task.id}`, {
            method: "DELETE",
          });
          window.location.reload();
        }}
      />
    );
  };

  return (
    <div
      className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition"
      onClick={handleClick}
    >
      <div className="font-semibold text-gray-900 mb-2">{task.title}</div>
      <div className="text-xs text-gray-500">
        {completedCount} of {task.subtasks.length} subtasks
      </div>
    </div>
  );
};

export default Task;
