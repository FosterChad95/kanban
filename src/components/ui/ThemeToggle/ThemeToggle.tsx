"use client";

import React from "react";
import { useTheme } from "../../../providers/ThemeProvider";

/**
 * ThemeToggle component toggles between light and dark mode using ThemeContext.
 * It displays a sun/moon icon and a switch styled to match the provided design.
 */
const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex items-center justify-center gap-4 bg-light-gray px-6 py-3 rounded border border-[#A3BFFA]">
      {/* Sun icon */}
      <span role="img" aria-label="Light mode" className="text-xl">
        🌞
      </span>
      {/* Toggle switch */}
      <button
        aria-label="Toggle dark mode"
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
          isDark ? "bg-main-purple" : "bg-gray-300"
        }`}
        onClick={toggleTheme}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
            isDark ? "translate-x-6" : ""
          }`}
        />
      </button>
      {/* Moon icon */}
      <span role="img" aria-label="Dark mode" className="text-xl">
        🌙
      </span>
    </div>
  );
};

export default ThemeToggle;
