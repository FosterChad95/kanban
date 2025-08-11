import React from "react";
import Modal from "./Modal";
import Button from "../Button/Button";

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
          <Button
            className="flex-1"
            variant="destructive"
            onClick={onDelete}
            type="button"
          >
            Delete
          </Button>
          <Button
            className="flex-1"
            variant="secondary"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteModal;
