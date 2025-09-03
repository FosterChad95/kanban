import React from "react";
import { Modal } from "./Modal";
import Button from "../Button/Button";
import { DELETE_MODAL_CONFIGS, MODAL_STYLES } from "./utils";
import type { DeleteModalProps } from "./types";

const DeleteModal: React.FC<DeleteModalProps> = ({
  type,
  name,
  onDelete,
  onCancel,
  open,
}) => {
  const config = DELETE_MODAL_CONFIGS[type](name);

  return (
    <Modal isOpen={open} onClose={onCancel} size="lg">
      <div className="p-6 w-[350px] sm:w-[400px] text-black dark:text-light-gray">
        <h2 className="text-red text-lg font-bold mb-4">{config.title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-300 mb-6">
          {config.message}
        </p>
        <div className={MODAL_STYLES.button.gap}>
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
