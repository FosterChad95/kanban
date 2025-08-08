import type { Meta, StoryObj } from "@storybook/react";
import Board from "./Board";
import type { ColumnType } from "./Column";

const meta: Meta<typeof Board> = {
  title: "Content/Board",
  component: Board,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Board>;

const mockedColumns: ColumnType[] = [
  {
    name: "TODO",
    color: "border-blue-500",
    tasks: [
      {
        title: "Mocked Task 1",
        subtasks: [
          { title: "Subtask 1", completed: false },
          { title: "Subtask 2", completed: false },
        ],
      },
      {
        title: "Mocked Task 2",
        subtasks: [
          { title: "Subtask 1", completed: true },
          { title: "Subtask 2", completed: false },
        ],
      },
    ],
  },
  {
    name: "DOING",
    color: "border-purple-500",
    tasks: [
      {
        title: "Mocked Task 3",
        subtasks: [
          { title: "Subtask 1", completed: true },
          { title: "Subtask 2", completed: true },
        ],
      },
    ],
  },
  {
    name: "DONE",
    color: "border-green-500",
    tasks: [
      {
        title: "Mocked Task 4",
        subtasks: [
          { title: "Subtask 1", completed: true },
          { title: "Subtask 2", completed: true },
        ],
      },
    ],
  },
];

export const Default: Story = {
  args: {
    columns: mockedColumns,
  },
};

export const Empty: Story = {
  args: {
    columns: [],
  },
};
