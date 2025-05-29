import type { Meta, StoryObj } from "@storybook/react";
import Button from "./Button";

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof Button>;

export const PrimaryLarge: Story = {
  args: {
    children: "Primary Large",
    variant: "primary-l",
  },
};

export const PrimarySmall: Story = {
  args: {
    children: "Primary Small",
    variant: "primary-s",
  },
};

export const Secondary: Story = {
  args: {
    children: "Secondary",
    variant: "secondary",
  },
};

export const Destructive: Story = {
  args: {
    children: "Delete",
    variant: "destructive",
  },
};

// Example with disabled state
export const Disabled: Story = {
  args: {
    children: "Disabled Button",
    variant: "primary-l",
    disabled: true,
  },
};

// Example showing all variants together
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Button variant="primary-l">Primary Large</Button>
      <Button variant="primary-s">Primary Small</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
};
