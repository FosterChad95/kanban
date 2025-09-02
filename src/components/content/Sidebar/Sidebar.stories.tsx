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
    visible: true,
    onHideSidebar: () => {
      // eslint-disable-next-line no-console
      console.log("Hide sidebar clicked");
    },
  },
};
