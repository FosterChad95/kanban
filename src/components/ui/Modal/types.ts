import type { ReactNode } from "react";

// Base modal props
export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading?: boolean;
  error?: string | null;
}

// Form modal props
export interface FormModalProps extends BaseModalProps {
  className?: string;
}

// Common option types
export interface UserOption {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface TeamOption {
  id: string;
  name: string;
}

export interface BoardOption {
  id: string;
  name: string;
}

export interface ColumnOption {
  id: string;
  name: string;
}

// Delete modal types
export type DeleteType = "task" | "board" | "team" | "user";

export interface DeleteModalProps extends BaseModalProps {
  type: DeleteType;
  name: string;
  onDelete: () => void | Promise<void>;
  onCancel: () => void;
  open: boolean;
}

// Common form data types
export interface BaseFormData {
  name: string;
}

export interface UserFormData extends BaseFormData {
  email: string;
  avatar?: string;
}

export interface TeamFormData extends BaseFormData {
  users: UserOption[];
}

export interface BoardFormData extends BaseFormData {
  columns: { id?: string; name: string }[];
}

// Modal content configuration
export interface DeleteModalConfig {
  title: string;
  message: string;
}

// Animation variants (from framer-motion)
export interface ModalVariants {
  [key: string]: any;
  hidden: any;
  visible: any;
  exit: any;
}

// Enhanced Modal props
export interface EnhancedModalProps extends BaseModalProps {
  children: ReactNode;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
  disableClickOutside?: boolean;
  disableEscapeKey?: boolean;
  className?: string;
}