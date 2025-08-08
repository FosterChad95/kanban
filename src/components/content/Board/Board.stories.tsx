import type { Meta, StoryObj } from "@storybook/react";
import Board from "./Board";
import { demoColumns } from "../../../../data/mock/board";

const meta: Meta<typeof Board> = {
  title: "Content/Board",
  component: Board,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Board>;

export const Default: Story = {
  args: {
    columns: demoColumns,
  },
};

export const Empty: Story = {
  args: {
    columns: [],
  },
};
