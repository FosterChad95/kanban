"use client";

import React, { type FormEventHandler } from "react";
import { Modal } from "./Modal";
import Button from "../Button/Button";
import { cn } from "@/lib/utils";
import { MODAL_STYLES, getLoadingText } from "./utils";
import type { FormModalProps } from "./types";

interface FormModalBaseProps extends FormModalProps {
  title: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
  submitButtonText: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
}

export const FormModal: React.FC<FormModalBaseProps> = ({
  isOpen,
  onClose,
  loading = false,
  error = null,
  title,
  onSubmit,
  submitButtonText,
  children,
  className,
  size = "md",
  showCloseButton = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      showCloseButton={showCloseButton}
    >
      <form
        onSubmit={onSubmit}
        className={cn(MODAL_STYLES.form, className)}
        style={MODAL_STYLES.formMinWidth}
      >
        {children}
        
        {error && (
          <div className={MODAL_STYLES.errorCenter}>
            {error}
          </div>
        )}
        
        <Button
          type="submit"
          className={MODAL_STYLES.button.full}
          variant="primary-l"
          disabled={loading}
        >
          {getLoadingText(submitButtonText, loading)}
        </Button>
      </form>
    </Modal>
  );
};

// Form field wrapper component
interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required = false,
  children,
  className = "mb-4",
}) => {
  return (
    <div className={className}>
      <label className={MODAL_STYLES.labelDark}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <span className={MODAL_STYLES.error}>{error}</span>
      )}
    </div>
  );
};

// Error display component
interface ErrorDisplayProps {
  error?: string | null;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  className = MODAL_STYLES.errorCenter,
}) => {
  if (!error) return null;
  
  return (
    <div className={className}>
      <span className="bg-red-100 text-red-700 px-4 py-2 rounded shadow">
        {error}
      </span>
    </div>
  );
};

// Loading button component
interface LoadingButtonProps {
  loading: boolean;
  loadingText: string;
  children: React.ReactNode;
  className?: string;
  variant?: "primary-l" | "secondary" | "destructive";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading,
  loadingText,
  children,
  className,
  variant = "primary-l",
  disabled = false,
  type = "button",
  onClick,
}) => {
  return (
    <Button
      type={type}
      className={className}
      variant={variant}
      disabled={loading || disabled}
      onClick={onClick}
    >
      {loading ? loadingText : children}
    </Button>
  );
};