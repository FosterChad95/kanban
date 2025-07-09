import type { Meta, StoryObj } from "@storybook/react";
import { Dropdown } from "./Dropdown";

const meta: Meta<typeof Dropdown> = {
  component: Dropdown,
  title: "UI/Dropdown",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Dropdown>;

export const Default: Story = {
  args: {
    options: ["Option 1", "Option 2", "Option 3"],
    value: "",
    placeholder: "Select an option",
  },
};

export const WithValue: Story = {
  args: {
    options: ["Option 1", "Option 2", "Option 3"],
    value: "Option 2",
  },
};

export const LongOptions: Story = {
  args: {
    options: [
      "Really Long Option Text 1",
      "Another Long Option Text 2",
      "Yet Another Long Option Text 3",
    ],
    value: "",
    placeholder: "Select a long option",
  },
};

export const ManyOptions: Story = {
  args: {
    options: Array.from({ length: 10 }, (_, i) => `Option ${i + 1}`),
    value: "",
    placeholder: "Select from many options",
  },
};
