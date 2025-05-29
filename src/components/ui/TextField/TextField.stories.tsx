import type { Meta, StoryObj } from "@storybook/react";
import TextField from "./TextField";

const meta = {
  title: "UI/TextField",
  component: TextField,
  tags: ["autodocs"],
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof TextField>;

export const Default: Story = {
  args: {
    placeholder: "Enter text",
  },
};

export const WithLabel: Story = {
  args: {
    label: "Input Label",
    placeholder: "Enter text",
  },
};

export const Required: Story = {
  args: {
    label: "Required Field",
    placeholder: "Enter required text",
    required: true,
  },
};

export const WithHelperText: Story = {
  args: {
    label: "Username",
    placeholder: "Enter username",
    helperText: "Must be at least 4 characters",
  },
};

export const WithError: Story = {
  args: {
    label: "Password",
    placeholder: "Enter password",
    type: "password",
    value: "123",
    error: "Password must be at least 8 characters",
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled Input",
    placeholder: "Cannot edit this field",
    disabled: true,
    value: "Disabled content",
  },
};

// Example showing all states together
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4 min-w-[320px]">
      <TextField label="Default Input" placeholder="Enter text" />
      <TextField label="Required Input" placeholder="Must fill this" required />
      <TextField
        label="With Helper"
        placeholder="Enter text"
        helperText="This is a helper text"
      />
      <TextField
        label="With Error"
        placeholder="Enter text"
        error="This field has an error"
        value="Invalid input"
      />
      <TextField
        label="Disabled Input"
        placeholder="Cannot edit"
        disabled
        value="Disabled content"
      />
    </div>
  ),
};
