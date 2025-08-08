import React, { useState } from "react";
import Checkbox from "../CheckBox/Checkbox";
import { Dropdown } from "../Dropdown/Dropdown";

type Subtask = {
  id: string;
  title: string;
  completed: boolean;
};

type ViewTaskModalProps = {
  title: string;
  description: string;
  subtasks: Subtask[];
  status: string;
  statusOptions: string[];
  onStatusChange: (status: string) => void;
  onEdit: (form: {
    title: string;
    description: string;
    status: string;
    subtasks: Subtask[];
  }) => void;
  onDelete: () => void;
};

const ViewTaskModal: React.FC<ViewTaskModalProps> = ({
  title,
  description,
  subtasks = [],
  status,
  statusOptions,
  onStatusChange,
  onEdit,
  onDelete,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState({
    title,
    description,
    status,
    subtasks: subtasks.map((s) => ({ ...s })),
  });

  // Keep form state in sync with props if modal is reopened with new data
  React.useEffect(() => {
    setForm({
      title,
      description,
      status,
      subtasks: subtasks.map((s) => ({ ...s })),
    });
  }, [title, description, status, subtasks]);

  const completedCount = form.subtasks.filter((s) => s.completed).length;

  const handleSubtaskChange = (id: string | number, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      subtasks: prev.subtasks.map((s) =>
        s.id === id ? { ...s, completed: checked } : s
      ),
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (newStatus: string) => {
    setForm((prev) => ({
      ...prev,
      status: newStatus,
    }));
    onStatusChange(newStatus);
  };

  const handleEdit = () => {
    setIsEdit(true);
    setIsMenuOpen(false);
  };

  const handleDelete = () => {
    setIsMenuOpen(false);
    onDelete();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEdit(false);
    onEdit(form);
  };

  return (
    <form onSubmit={handleSave}>
      <div className="flex justify-between items-start mb-6">
        {isEdit ? (
          <input
            className="text-lg font-bold leading-tight w-full bg-gray-100 dark:bg-[#22232e] rounded px-2 py-1"
            name="title"
            value={form.title}
            onChange={handleInputChange}
            disabled={!isEdit}
          />
        ) : (
          <h2 className="text-lg font-bold leading-tight">{form.title}</h2>
        )}
        <div className="relative">
          <button
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#22232e] transition"
            aria-label="Task menu"
            tabIndex={0}
            type="button"
            onClick={() => setIsMenuOpen((v) => !v)}
          >
            <span className="text-2xl">⋮</span>
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-[#2b2c37] rounded shadow-lg z-10">
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#22232e] text-sm"
                type="button"
                onClick={handleEdit}
              >
                Edit Task
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-[#22232e] text-sm"
                type="button"
                onClick={handleDelete}
              >
                Delete Task
              </button>
            </div>
          )}
        </div>
      </div>
      {isEdit ? (
        <textarea
          className="text-gray-900 dark:text-white bg-gray-100 dark:bg-[#22232e] rounded px-2 py-1 mb-6 w-full"
          name="description"
          value={form.description}
          onChange={handleInputChange}
          disabled={!isEdit}
        />
      ) : (
        <p className="text-gray-500 dark:text-gray-300 mb-6">
          {form.description}
        </p>
      )}
      <div className="mb-6">
        <div className="text-xs font-bold text-gray-500 dark:text-gray-300 mb-2">
          Subtasks ({completedCount} of {form.subtasks.length})
        </div>
        <div className="flex flex-col gap-2">
          <Checkbox
            checkboxes={form.subtasks.map((subtask) => ({
              label: subtask.title,
              value: subtask.id,
              checked: subtask.completed,
              disabled: !isEdit,
            }))}
            onChange={handleSubtaskChange}
          />
        </div>
      </div>
      <div>
        <div className="text-xs font-bold text-gray-500 dark:text-gray-300 mb-2">
          Current Status
        </div>
        <Dropdown
          options={statusOptions}
          value={form.status}
          onChange={handleStatusChange}
        />
      </div>
      {isEdit && (
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      )}
    </form>
  );
};

export default ViewTaskModal;
