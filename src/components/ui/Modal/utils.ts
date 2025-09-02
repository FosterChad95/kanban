import { type DeleteType, type DeleteModalConfig } from "./types";

// Delete modal configurations
export const DELETE_MODAL_CONFIGS: Record<DeleteType, (name: string) => DeleteModalConfig> = {
  board: (name: string) => ({
    title: "Delete this board?",
    message: `Are you sure you want to delete the '${name}' board? This action will remove all columns and tasks and cannot be reversed.`,
  }),
  task: (name: string) => ({
    title: "Delete this task?",
    message: `Are you sure you want to delete the '${name}' task and its subtasks? This action cannot be reversed.`,
  }),
  team: (name: string) => ({
    title: "Delete this team?",
    message: `Are you sure you want to delete the '${name}' team? This action will remove all associated boards and cannot be reversed.`,
  }),
  user: (name: string) => ({
    title: "Delete this user?",
    message: `Are you sure you want to delete the user '${name}'? This action cannot be reversed.`,
  }),
};

// Common modal styles
export const MODAL_STYLES = {
  form: "bg-white dark:bg-[#2b2c37] text-black dark:text-light-gray rounded-lg p-8 w-full max-w-md",
  formMinWidth: { minWidth: 400 },
  label: "block text-xs font-bold mb-2",
  labelDark: "block text-xs font-bold mb-2 text-black dark:text-light-gray",
  error: "text-xs text-red-500",
  errorCenter: "mb-4 text-center text-red-500",
  heading: "text-xl font-bold",
  button: {
    full: "w-full",
    gap: "flex gap-4",
  },
} as const;

// Role options
export const ROLE_OPTIONS = ["user", "admin"] as const;

// Type guards
export const isUserOption = (obj: unknown): obj is { id: string; name: string } =>
  typeof obj === "object" && 
  obj !== null && 
  "id" in obj && 
  "name" in obj &&
  typeof (obj as any).id === "string" &&
  typeof (obj as any).name === "string";

export const isArrayOfUserOptions = (arr: unknown): arr is Array<{ id: string; name: string }> =>
  Array.isArray(arr) && arr.every(isUserOption);

// Filter utilities
export const filterUserOptions = (arr: unknown) =>
  Array.isArray(arr) ? arr.filter(isUserOption) : [];

export const filterBoardOptions = (arr: unknown) =>
  Array.isArray(arr) ? arr.filter(
    (b): b is { id: string; name: string } =>
      typeof b === "object" && 
      b !== null && 
      "id" in b && 
      "name" in b &&
      typeof (b as any).id === "string" &&
      typeof (b as any).name === "string"
  ) : [];

// ID generation utility
export const generateId = (): string => {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  // Fallback for older browsers or server-side
  return `temp-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
};

// Common validation helpers
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

// Loading states
export const getLoadingText = (action: string, loading: boolean): string => {
  if (!loading) return action;
  
  const loadingMap: Record<string, string> = {
    "Save Changes": "Saving...",
    "Create User": "Creating...",
    "Create Team": "Creating...",
    "Create New Board": "Creating...",
    "Create Task": "Creating...",
  };
  
  return loadingMap[action] || "Loading...";
};