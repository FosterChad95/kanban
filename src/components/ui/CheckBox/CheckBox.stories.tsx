import type { Meta, StoryObj } from "@storybook/react";
import Checkbox from "./Checkbox";

const meta = {
  title: "UI/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {
    checkboxes: [
      { label: "Option 1", value: "option1", checked: false },
      { label: "Option 2", value: "option2", checked: true },
    ],
    onChange: (value, checked) =>
      console.log(`Checkbox ${value} changed:`, checked),
  },
};
