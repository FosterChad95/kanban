/**
 * General application constants
 */

export const APP_CONFIG = {
  NAME: "Kanban Task Manager",
  DESCRIPTION: "A modern, collaborative Kanban board application",
  VERSION: "1.0.0",
} as const;

export const URLS = {
  LOCALHOST: "http://localhost:3000",
  BASE_URL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
} as const;

export const TIMEOUTS = {
  REQUEST: 10000, // 10 seconds
  DEBOUNCE: 300,
  ANIMATION: 300,
  TOAST: 5000,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MAX_EMAIL_LENGTH: 100,
} as const;