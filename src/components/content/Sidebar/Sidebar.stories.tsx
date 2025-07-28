import type { Meta, StoryObj } from "@storybook/react";
import Sidebar from "./Sidebar";

const meta: Meta<typeof Sidebar> = {
  title: "Content/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

const sampleBoards = [
  { id: "1", name: "Product Roadmap" },
  { id: "2", name: "Sprint Board" },
  { id: "3", name: "Marketing" },
];

export const Default: Story = {
  args: {
    boards: sampleBoards,
    onBoardClick: (id: string) => {
      // eslint-disable-next-line no-console
      console.log("Board clicked:", id);
    },
    onCreateBoard: () => {
      // eslint-disable-next-line no-console
      console.log("Create new board clicked");
    },
  },
};
