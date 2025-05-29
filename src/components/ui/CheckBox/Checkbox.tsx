import { cn } from "@/lib/utils";
import { Option } from "@/util/types";
import React from "react";

export interface CheckboxProps {
  /**
   * Array of checkbox options with their checked states
   */
  checkboxes: Array<Option & { checked?: boolean; disabled?: boolean }>;
  /**
   * Callback fired when a checkbox changes its state
   */
  onChange: (value: string | number, checked: boolean) => void;
  /**
   * Whether the entire checkbox group is disabled
   */
  disabled?: boolean;
  /**
   * Optional name for the checkbox group
   */
  name?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checkboxes,
  onChange,
  disabled = false,
  name,
}) => {
  return (
    <div className="flex flex-col gap-3" role="group" aria-label={name}>
      {checkboxes.map(
        ({ label, value, checked = false, disabled: itemDisabled = false }) => {
          const isDisabled = disabled || itemDisabled;
          const id = `checkbox-${value}`;

          return (
            <label
              key={value}
              htmlFor={id}
              className={`flex gap-4 transition-all duration-200 rounded-[4px] bg-light-gray hover:bg-main-purple hover:bg-opacity-25 items-center p-[12px] cursor-pointer ${
                isDisabled && "cursor-not-allowed"
              }`}
            >
              <input
                id={id}
                type="checkbox"
                name={name}
                className={`appearance-none h-4 w-4 border border-[rgba(130,143,163,0.25)] rounded focus:ring-2 focus:ring-main-purple focus:ring-offset-0 transition-colors ${
                  checked
                    ? "bg-main-purple bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBzdHJva2U9IiNGRkYiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIgZD0ibTEuMjc2IDMuMDY2IDIuNzU2IDIuNzU2IDUtNSIvPjwvc3ZnPg==')] bg-center bg-no-repeat bg-[length:10px] border-main-purple"
                    : "bg-white hover:border-main-purple"
                }`}
                checked={checked}
                value={value}
                disabled={isDisabled}
                onChange={(e) => onChange(value, e.target.checked)}
                aria-checked={checked}
              />
              <span
                className={cn("font-bold text-gray-700", {
                  "line-through text-gray-400": checked,
                })}
              >
                {label}
              </span>
            </label>
          );
        }
      )}
    </div>
  );
};

export default Checkbox;
