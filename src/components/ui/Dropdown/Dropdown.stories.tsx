import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Dropdown } from "./Dropdown";

// Wrapper component to handle state
const DropdownWrapper = (props: React.ComponentProps<typeof Dropdown>) => {
  const [value, setValue] = useState(props.value);
  return (
    <Dropdown
      {...props}
      value={value}
      onChange={(newValue) => {
        setValue(newValue);
        props.onChange?.(newValue);
      }}
    />
  );
};

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
  render: (args) => <DropdownWrapper {...args} />,
};

export const WithValue: Story = {
  args: {
    options: ["Option 1", "Option 2", "Option 3"],
    value: "Option 2",
  },
  render: (args) => <DropdownWrapper {...args} />,
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
  render: (args) => <DropdownWrapper {...args} />,
};

export const ManyOptions: Story = {
  args: {
    options: Array.from({ length: 10 }, (_, i) => `Option ${i + 1}`),
    value: "",
    placeholder: "Select from many options",
  },
  render: (args) => <DropdownWrapper {...args} />,
};
