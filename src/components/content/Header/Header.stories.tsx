import type { Meta, StoryObj } from "@storybook/react";
import Header from "./Header";
import type { Board as BaseBoard } from "@/util/types";

type Board = BaseBoard & {
  active: boolean;
};
import { ModalProvider } from "../../../providers/ModalProvider";
import Modal from "../../ui/Modal/Modal";

// Helper to generate random board names
function randomBoardName() {
  const adjectives = [
    "Agile",
    "Dynamic",
    "Creative",
    "Productive",
    "Efficient",
  ];
  const nouns = ["Launch", "Sprint", "Roadmap", "Workflow", "Backlog"];
  return (
    adjectives[Math.floor(Math.random() * adjectives.length)] +
    " " +
    nouns[Math.floor(Math.random() * nouns.length)]
  );
}

// Generate a random number of boards (2-5), with one randomly active and columns for statusOptions
function generateMockBoards(): Board[] {
  const count = Math.floor(Math.random() * 4) + 2; // 2-5 boards
  const boards: Board[] = [];
  const activeIndex = Math.floor(Math.random() * count);
  for (let i = 0; i < count; i++) {
    boards.push({
      id: `board-${i}`,
      name: randomBoardName(),
      active: i === activeIndex,
      columns: [
        { id: "1", name: "Todo" },
        { id: "2", name: "Doing" },
        { id: "3", name: "Done" },
      ],
    });
  }
  return boards;
}

const meta: Meta<typeof Header> = {
  title: "Content/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof Header>;

export const Default: Story = {
  render: () => (
    <ModalProvider ModalComponent={Modal}>
      <Header boards={generateMockBoards()} />
    </ModalProvider>
  ),
};
