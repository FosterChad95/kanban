import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { ModalProvider, useModal } from "../../../providers/ModalProvider";
import Modal from "./Modal";

const meta: Meta = {
  title: "UI/Modal",
  component: Modal,
  decorators: [
    (Story) => (
      <ModalProvider ModalComponent={Modal}>
        <Story />
      </ModalProvider>
    ),
  ],
};
export default meta;

const DemoContent: React.FC = () => {
  const { openModal } = useModal();
  return (
    <div className="flex flex-col gap-4">
      <button
        className="bg-indigo-600 text-white px-4 py-2 rounded"
        onClick={() =>
          openModal(
            <div>
              <h2 className="text-xl font-bold mb-2">Add New Task</h2>
              <p>
                This is a demo of a reusable modal. You can put any content
                here.
              </p>
              <DemoCloseButton />
            </div>
          )
        }
      >
        Open Add Task Modal
      </button>
      <button
        className="bg-red-600 text-white px-4 py-2 rounded"
        onClick={() =>
          openModal(
            <div>
              <h2 className="text-xl font-bold mb-2 text-red-600">
                Delete Board?
              </h2>
              <p>
                Are you sure you want to delete this board? This action cannot
                be undone.
              </p>
              <DemoCloseButton />
            </div>
          )
        }
      >
        Open Delete Modal
      </button>
    </div>
  );
};

function DemoCloseButton() {
  const { closeModal } = useModal();
  return (
    <button
      className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      onClick={closeModal}
    >
      Close
    </button>
  );
}

export const Default: StoryObj = {
  render: () => <DemoContent />,
};

import ViewTaskModal from "./ViewTaskModal";
import AddTaskModal from "./AddTaskModal";

const mockSubtasks = [
  { id: "1", title: "Subtask 1", completed: true },
  { id: "2", title: "Subtask 2", completed: false },
  { id: "3", title: "Subtask 3", completed: false },
];

const mockStatusOptions = ["Todo", "In Progress", "Done"];

const ViewTaskModalDemo: React.FC = () => {
  const { openModal } = useModal();
  return (
    <button
      className="bg-blue-600 text-white px-4 py-2 rounded"
      onClick={() =>
        openModal(
          <ViewTaskModal
            title="Demo Task"
            description="This is a demo task for the ViewTaskModal inside the reusable Modal."
            subtasks={mockSubtasks}
            status="Todo"
            statusOptions={mockStatusOptions}
            onStatusChange={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        )
      }
    >
      Open View Task Modal
    </button>
  );
};

export const ViewTaskModalInModal: StoryObj = {
  render: () => <ViewTaskModalDemo />,
};

const AddTaskModalDemo: React.FC = () => {
  const { openModal, closeModal } = useModal();

  return (
    <button
      className="bg-indigo-600 text-white px-4 py-2 rounded"
      onClick={() =>
        openModal(
          <AddTaskModal
            statusOptions={mockStatusOptions}
            onCreate={(data) => {
              alert("Task Created: " + JSON.stringify(data, null, 2));
              closeModal();
            }}
          />
        )
      }
    >
      Open Add Task Modal
    </button>
  );
};

export const AddTaskModalInModal: StoryObj = {
  render: () => <AddTaskModalDemo />,
};
