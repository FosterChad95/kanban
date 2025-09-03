import { cn } from "@/lib/utils";
import React, { InputHTMLAttributes, forwardRef } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    { className, label, error, helperText, disabled, required, id, ...props },
    ref
  ) => {
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, "-")}`;

    return (
      <div className={cn("flex flex-col gap-2", className)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn("text-sm text-gray-700 dark:text-gray-300 font-bold", {
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
          ref={ref}
          className={cn(
            "px-4 py-2 rounded-[4px] border border-[rgba(130,143,163,0.25)] bg-white dark:bg-gray-800 dark:border-gray-600",
            "heading-medium placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-main-purple focus:ring-opacity-25 focus:border-main-purple",
            "hover:border-main-purple",
            {
              "border-red focus:ring-red focus:ring-opacity-25 focus:border-red":
                error,
              "opacity-50 cursor-not-allowed": disabled,
            }
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
          <span id={`${inputId}-helper`} className="text-sm text-gray-400 dark:text-gray-500">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

TextField.displayName = "TextField";

export default TextField;
