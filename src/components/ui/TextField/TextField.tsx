import { cn } from "@/lib/utils";
import React, { InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * Label text for the input
   */
  label?: string;
  /**
   * Error message to display
   */
  error?: string;
  /**
   * Optional helper text
   */
  helperText?: string;
}

const TextField: React.FC<TextFieldProps> = ({
  className,
  label,
  error,
  helperText,
  disabled,
  required,
  id,
  ...props
}) => {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={inputId}
          className={cn("text-sm text-gray-700 font-bold", {
            "text-red": error,
            "opacity-50": disabled,
          })}
        >
          {label}
          {required && <span className="text-red ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "px-4 py-2 rounded-[4px] border border-[rgba(130,143,163,0.25)] bg-white",
          "heading-medium placeholder:text-gray-400",
          "transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-main-purple focus:ring-opacity-25 focus:border-main-purple",
          "hover:border-main-purple",
          {
            "border-red focus:ring-red focus:ring-opacity-25 focus:border-red":
              error,
            "opacity-50 cursor-not-allowed": disabled,
          },
          className
        )}
        disabled={disabled}
        required={required}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={
          error
            ? `${inputId}-error`
            : helperText
            ? `${inputId}-helper`
            : undefined
        }
        {...props}
      />
      {error && (
        <span id={`${inputId}-error`} className="text-sm text-red">
          {error}
        </span>
      )}
      {helperText && !error && (
        <span id={`${inputId}-helper`} className="text-sm text-gray-400">
          {helperText}
        </span>
      )}
    </div>
  );
};

export default TextField;
