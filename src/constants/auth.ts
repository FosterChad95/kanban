/**
 * Constants related to authentication and authorization
 */

export const USER_ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const SESSION_CONFIG = {
  STRATEGY: "jwt",
  MAX_AGE: 30 * 24 * 60 * 60, // 30 days in seconds
} as const;

export const AUTH_PAGES = {
  SIGN_IN: "/signin",
  SIGN_UP: "/create-account", 
  ERROR: "/signin",
  DASHBOARD: "/dashboard",
  ADMIN: "/admin",
} as const;