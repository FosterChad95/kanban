/**
 * API Constants - Centralized status codes, error messages, and API-related constants
 */

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Standard Error Messages
export const ERROR_MESSAGES = {
  // Authentication & Authorization
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden - Admin access required", 
  FORBIDDEN_BOARD_ACCESS: "Board not found or access denied",
  
  // Validation
  VALIDATION_FAILED: "Validation failed",
  INVALID_JSON: "Invalid JSON",
  INVALID_PARAMETERS: "Invalid parameters",
  
  // Resource Management
  NOT_FOUND: "Resource not found",
  USER_NOT_FOUND: "User not found",
  BOARD_NOT_FOUND: "Board not found",
  TASK_NOT_FOUND: "Task not found",
  TEAM_NOT_FOUND: "Team not found",
  
  // Business Logic
  EMAIL_ALREADY_EXISTS: "Email already in use by another user",
  CANNOT_DELETE_TEAM_BOARD: "Cannot delete a board that belongs to a team",
  
  // System Errors
  INTERNAL_SERVER_ERROR: "Internal server error",
  FAILED_TO_RESOLVE_PARAMS: "Failed to resolve parameters",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  USER_DELETED: "User deleted successfully",
  BOARD_CREATED: "Board created successfully",
  TASK_CREATED: "Task created successfully",
  TEAM_CREATED: "Team created successfully",
} as const;

// Export type helpers
export type HttpStatus = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];
export type ErrorMessage = typeof ERROR_MESSAGES[keyof typeof ERROR_MESSAGES];
export type SuccessMessage = typeof SUCCESS_MESSAGES[keyof typeof SUCCESS_MESSAGES];