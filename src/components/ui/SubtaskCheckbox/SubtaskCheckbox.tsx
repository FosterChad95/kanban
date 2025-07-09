"use client";

interface SubtaskCheckboxProps {
  /** Text label for the subtask */
  label: string;
  /** Whether the checkbox is checked (completed) */
  checked: boolean;
  /** Callback when user toggles the checkbox */
  onChange: (checked: boolean) => void;
}

export const SubtaskCheckbox = ({
  label,
  checked,
  onChange,
}: SubtaskCheckboxProps) => {
  return (
    <label className="flex items-center gap-4 px-3 py-2 bg-gray-50 hover:bg-indigo-50 rounded cursor-pointer">
      <div className="relative w-4 h-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`absolute inset-0 rounded border ${
            checked
              ? "bg-purple-600 border-purple-600"
              : "bg-transparent border-gray-300"
          }`}
        >
          {checked && (
            <svg
              className="w-4 h-4 text-white"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z"
                fill="currentColor"
              />
            </svg>
          )}
        </div>
      </div>
      <span
        className={`font-medium ${
          checked ? "text-gray-400 line-through" : "text-gray-700"
        }`}
      >
        {label}
      </span>
    </label>
  );
};
