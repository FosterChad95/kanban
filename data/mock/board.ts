import { ColumnType } from "../../src/components/content/Board/Column";

export const demoColumns: ColumnType[] = [
  {
    name: "TODO",
    color: "teal",
    tasks: [
      {
        title: "Build UI for onboarding flow",
        subtasks: [
          { title: "Subtask 1", completed: false },
          { title: "Subtask 2", completed: false },
        ],
      },
      {
        title: "Build UI for search",
        subtasks: [
          { title: "Subtask 1", completed: false },
          { title: "Subtask 2", completed: false },
        ],
      },
      {
        title: "Build settings UI",
        subtasks: [
          { title: "Subtask 1", completed: false },
          { title: "Subtask 2", completed: false },
        ],
      },
      {
        title: "QA and test all major user journeys",
        subtasks: [
          { title: "Subtask 1", completed: false },
          { title: "Subtask 2", completed: false },
        ],
      },
    ],
  },
  {
    name: "DOING",
    color: "purple",
    tasks: [
      {
        title: "Design settings and search pages",
        subtasks: [
          { title: "Subtask 1", completed: false },
          { title: "Subtask 2", completed: false },
        ],
      },
      {
        title: "Add account management endpoints",
        subtasks: [
          { title: "Subtask 1", completed: false },
          { title: "Subtask 2", completed: false },
        ],
      },
      {
        title: "Design onboarding flow",
        subtasks: [
          { title: "Subtask 1", completed: false },
          { title: "Subtask 2", completed: false },
        ],
      },
      {
        title: "Add search endpoints",
        subtasks: [
          { title: "Subtask 1", completed: false },
          { title: "Subtask 2", completed: false },
        ],
      },
    ],
  },
  {
    name: "DONE",
    color: "green",
    tasks: [
      {
        title: "Conduct 5 wireframe tests",
        subtasks: [{ title: "Subtask 1", completed: true }],
      },
      {
        title: "Create wireframe prototype",
        subtasks: [{ title: "Subtask 1", completed: true }],
      },
      {
        title: "Review results of usability tests and iterate",
        subtasks: [{ title: "Subtask 1", completed: true }],
      },
      {
        title:
          "Create paper prototypes and conduct 10 usability tests with potential customers",
        subtasks: [{ title: "Subtask 1", completed: true }],
      },
      {
        title: "Market discovery",
        subtasks: [{ title: "Subtask 1", completed: true }],
      },
      {
        title: "Competitor analysis",
        subtasks: [{ title: "Subtask 1", completed: true }],
      },
      {
        title: "Research the market",
        subtasks: [
          { title: "Subtask 1", completed: true },
          { title: "Subtask 2", completed: true },
        ],
      },
    ],
  },
];
