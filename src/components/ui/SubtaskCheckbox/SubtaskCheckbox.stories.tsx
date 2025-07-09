import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { SubtaskCheckbox } from "./SubtaskCheckbox";

const meta: Meta<typeof SubtaskCheckbox> = {
  title: "UI/SubtaskCheckbox",
  component: SubtaskCheckbox,
  argTypes: {
    checked: { control: "boolean" },
    onChange: { action: "toggled" },
  },
  tags: ["autodocs"],
  render: function Render(args) {
    const [isChecked, setIsChecked] = React.useState(args.checked);
    return (
      <SubtaskCheckbox
        {...args}
        checked={isChecked}
        onChange={(checked) => {
          setIsChecked(checked);
          args.onChange?.(checked);
        }}
      />
    );
  },
};

export default meta;
type Story = StoryObj<typeof SubtaskCheckbox>;

export const Idle: Story = {
  args: {
    label: "Create project wireframes",
    checked: false,
  },
};

export const Hovered: Story = {
  args: {
    label: "Design user interface",
    checked: false,
  },
  parameters: {
    pseudo: { hover: true },
  },
};

export const Completed: Story = {
  args: {
    label: "Set up development environment",
    checked: true,
  },
};

export const LongLabel: Story = {
  args: {
    label:
      "This is a very long subtask label that might wrap to multiple lines and needs to maintain proper alignment with the checkbox",
    checked: false,
  },
};
