/**
 * Constants related to UI components and styling
 */

export const SVG_NAMESPACE = "http://www.w3.org/2000/svg" as const;

export const COMPONENT_SIZES = {
  AVATAR: {
    SM: 32,
    MD: 40,
    LG: 56,
    XL: 80,
  },
  MODAL: {
    SM: 400,
    MD: 600,
    LG: 800,
  },
  SIDEBAR: {
    COLLAPSED: 64,
    EXPANDED: 280,
  },
} as const;

export const Z_INDEX = {
  DROPDOWN: 1000,
  MODAL_BACKDROP: 1001,
  MODAL: 1002,
  TOAST: 1003,
} as const;

export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;