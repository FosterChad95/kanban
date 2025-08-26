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

import ViewTaskModal from "./ViewTaskModal";
import DeleteModal from "./DeleteModal";
import AddTaskModal from "./AddTaskModal";
import AddBoardModal from "./AddBoardModal";
import EditBoardModal from "./EditBoardModal";
import AddTeamModal, { UserOption } from "./AddTeamModal";

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

export const ViewTaskModalStory: StoryObj = {
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
            columns={[
              {
                id: "col1",
                name: "Todo",
              },
              {
                id: "col2",
                name: "Doing",
              },
              {
                id: "col3",
                name: "Done",
              },
            ]}
            boardId="demo-board-id"
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

export const AddTaskModalStory: StoryObj = {
  render: () => <AddTaskModalDemo />,
};

const AddBoardModalDemo: React.FC = () => {
  const { openModal, closeModal } = useModal();

  return (
    <button
      className="bg-purple-600 text-white px-4 py-2 rounded"
      onClick={() =>
        openModal(
          <AddBoardModal
            onCreate={(data) => {
              alert("Board Created: " + JSON.stringify(data, null, 2));
              closeModal();
            }}
          />
        )
      }
    >
      Open Add Board Modal
    </button>
  );
};

export const AddBoardModalStory: StoryObj = {
  render: () => <AddBoardModalDemo />,
};

const EditBoardModalDemo: React.FC = () => {
  const { openModal, closeModal } = useModal();
  const mockBoard = {
    name: "Platform Launch",
    columns: [
      { id: "col1", name: "Todo" },
      { id: "col2", name: "Doing" },
      { id: "col3", name: "Done" },
    ],
  };

  return (
    <button
      className="bg-pink-600 text-white px-4 py-2 rounded"
      onClick={() =>
        openModal(
          <EditBoardModal
            board={mockBoard}
            onEdit={(data) => {
              alert("Board Edited: " + JSON.stringify(data, null, 2));
              closeModal();
            }}
          />
        )
      }
    >
      Open Edit Board Modal
    </button>
  );
};

export const EditBoardModalStory: StoryObj = {
  render: () => <EditBoardModalDemo />,
};

const DeleteBoardModalDemo: React.FC = () => {
  const { openModal, closeModal } = useModal();
  return (
    <button
      className="bg-red text-white px-4 py-2 rounded"
      onClick={() =>
        openModal(
          <DeleteModal
            type="board"
            name="Platform Launch"
            open={true}
            onDelete={() => {
              alert("Board Deleted");
              closeModal();
            }}
            onCancel={closeModal}
          />
        )
      }
    >
      Open Delete Board Modal
    </button>
  );
};

export const DeleteBoardModalStory: StoryObj = {
  render: () => <DeleteBoardModalDemo />,
};

const DeleteTaskModalDemo: React.FC = () => {
  const { openModal, closeModal } = useModal();
  return (
    <button
      className="bg-red text-white px-4 py-2 rounded"
      onClick={() =>
        openModal(
          <DeleteModal
            type="task"
            name="Build settings UI"
            open={true}
            onDelete={() => {
              alert("Task Deleted");
              closeModal();
            }}
            onCancel={closeModal}
          />
        )
      }
    >
      Open Delete Task Modal
    </button>
  );
};

export const DeleteTaskModalStory: StoryObj = {
  render: () => <DeleteTaskModalDemo />,
};

const AddTeamModalDemo: React.FC = () => {
  const { openModal, closeModal } = useModal();
  const mockUsers: UserOption[] = [
    {
      id: "1",
      name: "Alice",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    {
      id: "2",
      name: "Bob",
      avatar: "https://i.pravatar.cc/150?img=2",
    },
    {
      id: "3",
      name: "Carol",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
  ];

  return (
    <button
      className="bg-green-600 text-white px-4 py-2 rounded"
      onClick={() =>
        openModal(
          <AddTeamModal
            users={mockUsers}
            onCreate={(data) => {
              alert("Team Created: " + JSON.stringify(data, null, 2));
              closeModal();
            }}
          />
        )
      }
    >
      Open Add Team Modal
    </button>
  );
};

export const AddTeamModalStory: StoryObj = {
  render: () => <AddTeamModalDemo />,
};
