"use client";

import { useState, useRef, useEffect } from "react";

interface DropdownProps {
  /** Array of option labels */
  options: string[];
  /** Currently selected value */
  value: string;
  /** Called when user picks an option */
  onChange: (newValue: string) => void;
  /** Optional placeholder when nothing is selected */
  placeholder?: string;
  /** Disable the dropdown */
  disabled?: boolean;
}

export const Dropdown = ({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
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

    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp": {
        e.preventDefault();
        const currentIndex = options.indexOf(value);
        const nextIndex =
          e.key === "ArrowDown"
            ? (currentIndex + 1) % options.length
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
  };

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
        <span className={!value ? "text-gray-500" : ""}>
          {value || placeholder || "Select option"}
        </span>
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
          {options.map((option) => (
            <li
              key={option}
              role="option"
              aria-selected={value === option}
              className="px-3 py-2 text-gray-600 cursor-pointer hover:bg-gray-50"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
