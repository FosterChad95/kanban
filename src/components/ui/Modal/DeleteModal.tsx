import React from "react";
import Modal from "./Modal";

interface DeleteModalProps {
  type: "task" | "board";
  name: string;
  onDelete: () => void;
  onCancel: () => void;
  open: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  type,
  name,
  onDelete,
  onCancel,
  open,
}) => {
  const isBoard = type === "board";
  return (
    <Modal isOpen={open} onClose={onCancel}>
      <div className="p-6 w-[350px] sm:w-[400px]">
        <h2 className="text-red text-lg font-bold mb-4">
          Delete this {isBoard ? "board" : "task"}?
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {isBoard
            ? `Are you sure you want to delete the ‘${name}’ board? This action will remove all columns and tasks and cannot be reversed.`
            : `Are you sure you want to delete the ‘${name}’ task and its subtasks? This action cannot be reversed.`}
        </p>
        <div className="flex gap-4">
          <button
            className="flex-1 bg-red text-white py-2 rounded transition"
            onClick={onDelete}
          >
            Delete
          </button>
          <button
            className="flex-1 bg-light-gray text-purple-600 py-2 rounded transition"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteModal;
