// ThemeToggle.stories.tsx
import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { ThemeProvider } from "@/providers/ThemeProvider";
import ThemeToggle from "./ThemeToggle";

const meta: Meta<typeof ThemeToggle> = {
  title: "UI/ThemeToggle",
  component: ThemeToggle,
  decorators: [
    (Story, context) => (
      <ThemeProvider>
        <Story {...context.args} />
      </ThemeProvider>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof ThemeToggle>;
export const Default: Story = {
  args: {},
};
