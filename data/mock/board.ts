import type { Task } from "../../src/util/types";

// Mock ColumnType based on the actual usage
type ColumnType = {
  id: string;
  name: string;
  color: string;
  tasks: Task[];
};

export const demoColumns: ColumnType[] = [
  {
    id: "1",
    name: "TODO",
    color: "teal",
    tasks: [
      {
        id: "task-1",
        title: "Build UI for onboarding flow",
        description: "Create the user interface for onboarding new users",
        columnId: "1",
        subtasks: [
          { id: "sub-1", title: "Subtask 1", isCompleted: false },
          { id: "sub-2", title: "Subtask 2", isCompleted: false },
        ],
      },
      {
        id: "task-2",
        title: "Build UI for search",
        description: "Implement search functionality interface",
        columnId: "1",
        subtasks: [
          { id: "sub-3", title: "Subtask 1", isCompleted: false },
          { id: "sub-4", title: "Subtask 2", isCompleted: false },
        ],
      },
      {
        id: "task-3",
        title: "Build settings UI",
        description: "Create settings interface",
        columnId: "1",
        subtasks: [
          { id: "sub-5", title: "Subtask 1", isCompleted: false },
          { id: "sub-6", title: "Subtask 2", isCompleted: false },
        ],
      },
      {
        id: "task-4",
        title: "QA and test all major user journeys",
        description: "Comprehensive testing of user workflows",
        columnId: "1",
        subtasks: [
          { id: "sub-7", title: "Subtask 1", isCompleted: false },
          { id: "sub-8", title: "Subtask 2", isCompleted: false },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "DOING",
    color: "purple",
    tasks: [
      {
        id: "task-5",
        title: "Design settings and search pages",
        description: "UI design for settings and search",
        columnId: "2",
        subtasks: [
          { id: "sub-9", title: "Subtask 1", isCompleted: false },
          { id: "sub-10", title: "Subtask 2", isCompleted: false },
        ],
      },
      {
        id: "task-6",
        title: "Add account management endpoints",
        description: "Backend API for account management",
        columnId: "2",
        subtasks: [
          { id: "sub-11", title: "Subtask 1", isCompleted: false },
          { id: "sub-12", title: "Subtask 2", isCompleted: false },
        ],
      },
      {
        id: "task-7",
        title: "Design onboarding flow",
        description: "User onboarding experience design",
        columnId: "2",
        subtasks: [
          { id: "sub-13", title: "Subtask 1", isCompleted: false },
          { id: "sub-14", title: "Subtask 2", isCompleted: false },
        ],
      },
      {
        id: "task-8",
        title: "Add search endpoints",
        description: "Backend API for search functionality",
        columnId: "2",
        subtasks: [
          { id: "sub-15", title: "Subtask 1", isCompleted: false },
          { id: "sub-16", title: "Subtask 2", isCompleted: false },
        ],
      },
    ],
  },
  {
    id: "3",
    name: "DONE",
    color: "green",
    tasks: [
      {
        id: "task-9",
        title: "Conduct 5 wireframe tests",
        description: "Wireframe usability testing",
        columnId: "3",
        subtasks: [{ id: "sub-17", title: "Subtask 1", isCompleted: true }],
      },
      {
        id: "task-10",
        title: "Create wireframe prototype",
        description: "Initial wireframe prototype",
        columnId: "3",
        subtasks: [{ id: "sub-18", title: "Subtask 1", isCompleted: true }],
      },
      {
        id: "task-11",
        title: "Review results of usability tests and iterate",
        description: "Analysis and iteration of test results",
        columnId: "3",
        subtasks: [{ id: "sub-19", title: "Subtask 1", isCompleted: true }],
      },
      {
        id: "task-12",
        title: "Create paper prototypes and conduct 10 usability tests with potential customers",
        description: "Paper prototypes and user testing",
        columnId: "3",
        subtasks: [{ id: "sub-20", title: "Subtask 1", isCompleted: true }],
      },
      {
        id: "task-13",
        title: "Market discovery",
        description: "Research market opportunities",
        columnId: "3",
        subtasks: [{ id: "sub-21", title: "Subtask 1", isCompleted: true }],
      },
      {
        id: "task-14",
        title: "Competitor analysis",
        description: "Analyze competitor landscape",
        columnId: "3",
        subtasks: [{ id: "sub-22", title: "Subtask 1", isCompleted: true }],
      },
      {
        id: "task-15",
        title: "Research the market",
        description: "Comprehensive market research",
        columnId: "3",
        subtasks: [
          { id: "sub-23", title: "Subtask 1", isCompleted: true },
          { id: "sub-24", title: "Subtask 2", isCompleted: true },
        ],
      },
    ],
  },
];