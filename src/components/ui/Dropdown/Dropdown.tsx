"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  getOptionId,
  getOptionLabel,
  getOptionAvatar,
  UserOption,
  DropdownOption,
} from "../../../util/dropdownHelpers";

interface DropdownProps {
  /** Array of options: string or user objects */
  options: DropdownOption[];
  /** Currently selected value(s): string, user id, or array */
  value: string | string[] | UserOption | UserOption[];
  /** Called when user picks an option (single or multi) */
  onChange: (newValue: string | string[] | UserOption | UserOption[]) => void;
  /** Optional placeholder when nothing is selected */
  placeholder?: string;
  /** Disable the dropdown */
  disabled?: boolean;
  /** Enable multi-select mode */
  multiSelect?: boolean;
  /** Optional custom render function for options */
  renderOption?: (option: DropdownOption, selected: boolean) => React.ReactNode;
}

export const Dropdown = ({
  options = [],
  value,
  onChange,
  placeholder,
  disabled = false,
  multiSelect = false,
  renderOption,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || !isOpen) return;

    if (!multiSelect) {
      switch (e.key) {
        case "ArrowDown":
        case "ArrowUp": {
          e.preventDefault();
          // Find the current index based on getOptionId
          const currentId = value
            ? getOptionId(value as DropdownOption)
            : undefined;
          const currentIndex = options.findIndex(
            (option) => getOptionId(option) === currentId
          );
          const nextIndex =
            e.key === "ArrowDown"
              ? (currentIndex + 1 + options.length) % options.length
              : (currentIndex - 1 + options.length) % options.length;
          onChange(options[nextIndex]);
          break;
        }
        case "Enter":
          setIsOpen(false);
          break;
        case "Escape":
          setIsOpen(false);
          break;
        default:
          break;
      }
    } else {
      // For multi-select, only close on Escape
      if (e.key === "Escape") setIsOpen(false);
    }
  };

  // Helper functions imported from util/dropdownHelpers

  // Memoized multiValue for multi-select mode
  const multiValue: DropdownOption[] = multiSelect
    ? Array.isArray(value)
      ? value
      : value
      ? [value]
      : []
    : [];

  // Memoized isSelected function for performance and DRYness
  const isSelected = (option: DropdownOption) => {
    if (multiSelect) {
      return multiValue.some((v) => getOptionId(v) === getOptionId(option));
    }
    if (!value) return false;
    return getOptionId(value as DropdownOption) === getOptionId(option);
  };

  // Render selected value(s) (memoized for performance)
  const renderSelected = () => {
    if (multiSelect) {
      if (multiValue.length === 0) {
        return (
          <span className="text-gray-500">
            {placeholder || "Select option"}
          </span>
        );
      }
      return (
        <span>
          {multiValue.map((v, i) => {
            const label = getOptionLabel(v);
            const avatar = getOptionAvatar(v);
            return (
              <span
                key={getOptionId(v)}
                className="inline-flex items-center mr-2"
              >
                {avatar && (
                  <Image
                    src={avatar}
                    alt={label}
                    width={20}
                    height={20}
                    className="w-5 h-5 rounded-full mr-1"
                  />
                )}
                {label}
                {i < multiValue.length - 1 && ","}
              </span>
            );
          })}
        </span>
      );
    } else {
      if (!value) {
        return (
          <span className="text-gray-500">
            {placeholder || "Select option"}
          </span>
        );
      }

      // If value is a string, try to find the matching option object
      let displayOption: DropdownOption | undefined = value as DropdownOption;
      if (typeof value === "string") {
        displayOption = options.find(
          (opt) =>
            (typeof opt === "string" && opt === value) ||
            (typeof opt === "object" && opt.id === value)
        );
      }

      if (!displayOption) {
        // If no matching option, show placeholder/empty state
        return (
          <span className="text-gray-500">
            {placeholder || "Select option"}
          </span>
        );
      }

      const label = getOptionLabel(displayOption);
      const avatar = getOptionAvatar(displayOption);
      return (
        <span className="inline-flex items-center">
          {avatar && (
            <Image
              src={avatar}
              alt={label}
              width={20}
              height={20}
              className="w-5 h-5 rounded-full mr-1"
            />
          )}
          {label}
        </span>
      );
    }
  };

  const safeOptions = Array.isArray(options) ? options : [];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className={`w-full flex items-center justify-between px-3 py-2 border rounded-lg bg-white ${
          disabled
            ? "border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed opacity-60"
            : isOpen
            ? "border-purple-600 ring-2 ring-purple-100 text-gray-700"
            : "border-gray-200 hover:border-gray-300 text-gray-700"
        }`}
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        tabIndex={disabled ? -1 : 0}
      >
        {renderSelected()}
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && !disabled && (
        <ul
          role="listbox"
          className="absolute z-10 w-full mt-1 py-1 bg-white border border-gray-200 rounded-lg shadow-lg"
        >
          {safeOptions.map((option) => {
            const selected = isSelected(option);
            return (
              <li
                key={getOptionId(option)}
                role="option"
                aria-selected={selected}
                className={`px-3 py-2 text-gray-600 cursor-pointer hover:bg-gray-50 flex items-center ${
                  selected ? "bg-purple-50 font-semibold" : ""
                }`}
                onClick={() => {
                  if (multiSelect) {
                    const alreadySelected = isSelected(option);
                    let newValue: DropdownOption[];
                    if (alreadySelected) {
                      newValue = multiValue.filter(
                        (v) => getOptionId(v) !== getOptionId(option)
                      );
                    } else {
                      newValue = [...multiValue, option];
                    }
                    // Ensure newValue is either string[] or UserOption[]
                    if (newValue.every((v) => typeof v === "string")) {
                      onChange(newValue as string[]);
                    } else if (newValue.every((v) => typeof v === "object")) {
                      onChange(newValue as UserOption[]);
                    } else if (newValue.length === 0) {
                      // If nothing is selected, pass an empty array of the same type as value
                      if (Array.isArray(value) && value.length > 0) {
                        if (typeof value[0] === "string") {
                          onChange([] as string[]);
                        } else {
                          onChange([] as UserOption[]);
                        }
                      } else {
                        onChange([] as string[]);
                      }
                    } else {
                      // Mixed types: fallback to string[] (filter out only strings)
                      const stringValues = newValue.filter(
                        (v) => typeof v === "string"
                      ) as string[];
                      const userOptionValues = newValue.filter(
                        (v) => typeof v === "object"
                      ) as UserOption[];
                      if (stringValues.length === newValue.length) {
                        onChange(stringValues);
                      } else if (userOptionValues.length === newValue.length) {
                        onChange(userOptionValues);
                      } else {
                        // If truly mixed, prefer string[] if any, else UserOption[]
                        if (stringValues.length > 0) {
                          onChange(stringValues);
                        } else if (userOptionValues.length > 0) {
                          onChange(userOptionValues);
                        } else {
                          // Should never happen, but fallback to empty string[]
                          onChange([] as string[]);
                        }
                      }
                    }
                  } else {
                    onChange(option);
                    setIsOpen(false);
                  }
                }}
              >
                {multiSelect && (
                  <input
                    type="checkbox"
                    checked={selected}
                    readOnly
                    className="mr-2"
                  />
                )}
                {renderOption ? (
                  renderOption(option, selected)
                ) : (
                  <>
                    {getOptionAvatar(option) && (
                      <Image
                        src={getOptionAvatar(option) as string}
                        alt={getOptionLabel(option)}
                        width={20}
                        height={20}
                        className="w-5 h-5 rounded-full mr-2"
                      />
                    )}
                    {getOptionLabel(option)}
                  </>
                )}
              </li>
            );
          })}
          {multiSelect && (
            <li className="px-3 py-2 flex justify-end">
              <button
                type="button"
                className="text-purple-600 hover:underline text-sm"
                onClick={() => setIsOpen(false)}
              >
                Done
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
};
