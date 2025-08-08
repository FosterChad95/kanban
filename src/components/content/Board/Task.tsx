import React from "react";

export type Subtask = {
  title: string;
  completed: boolean;
};

export type TaskType = {
  title: string;
  subtasks: Subtask[];
};

type TaskProps = {
  task: TaskType;
};

const Task: React.FC<TaskProps> = ({ task }) => {
  const completedCount = task.subtasks.filter((s) => s.completed).length;
  return (
    <div className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition">
      <div className="font-semibold text-gray-900 mb-2">{task.title}</div>
      <div className="text-xs text-gray-500">
        {completedCount} of {task.subtasks.length} subtasks
      </div>
    </div>
  );
};

export default Task;
