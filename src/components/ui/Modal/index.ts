// Base Modal components
export { Modal, LegacyModal } from "./Modal";
export { FormModal, FormField, ErrorDisplay, LoadingButton } from "./FormModal";

// Specific Modal components
export { default as DeleteModal } from "./DeleteModal";
export { default as AddUserModal } from "./AddUserModal";
export { default as EditUserModal } from "./EditUserModal";
export { default as AddTeamModal } from "./AddTeamModal";
export { default as EditTeamModal } from "./EditTeamModal";
export { default as AddBoardModal } from "./AddBoardModal";
export { default as EditBoardModal } from "./EditBoardModal";
export { default as AddTaskModal } from "./AddTaskModal";
export { default as ViewTaskModal } from "./ViewTaskModal";
export { default as SettingsModal } from "./SettingsModal";

// Types
export type * from "./types";

// Utils
export * from "./utils";

// For backward compatibility, export the legacy Modal as default
export { LegacyModal as default } from "./Modal";