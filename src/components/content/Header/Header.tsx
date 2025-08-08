import React, { useState } from "react";
import Logo from "../../../images/Logo";
import LogoMobile from "../../../images/LogoMobile";
import IconBoardIcon from "../../ui/Icon/IconBoardIcon";
import ThemeToggle from "../../ui/ThemeToggle/ThemeToggle";

const boards = [
  { name: "Platform Launch", active: true },
  { name: "Marketing Plan", active: false },
  { name: "Roadmap", active: false },
];

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full border-b border-gray-200 md:border-none bg-white px-4 py-2 flex items-center justify-between md:px-8 md:py-0 md:h-24">
      {/* Desktop: Only Logo */}
      <div className="hidden md:flex items-center border-r-lines-light h-full border-r w-[270px]">
        <Logo />
      </div>

      <div className="md:border-b md:border-gray-200 md:h-full md:flex-grow flex md:align-middle md:justify-end w-full justify-between">
        {/* Mobile: LogoMobile + Board Name Dropdown */}
        <div className="flex items-center gap-2 md:hidden">
          <LogoMobile />
          <button
            className="flex items-center ml-2"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Open board menu"
          >
            <span className="font-bold text-lg text-black select-none">
              Platform Launch
            </span>
            <svg
              className={`w-4 h-4 ml-1 transition-transform ${
                mobileMenuOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              viewBox="0 0 24 24"
            >
              <path
                d="M6 9l6 6 6-6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button className="bg-[#635FC7]/10 text-[#635FC7] font-medium px-6 py-2 rounded-full text-sm hover:bg-[#635FC7]/20 transition">
            + Add New Task
          </button>
          {/* Vertical Ellipsis */}
          <button className="p-2" aria-label="More options">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Add Task Button */}
          <button
            className="bg-[#635FC7]/10 text-[#635FC7] p-2 rounded-full"
            aria-label="Add New Task"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <rect x="11" y="4" width="2" height="16" rx="1" />
              <rect x="4" y="11" width="16" height="2" rx="1" />
            </svg>
          </button>
          {/* Vertical Ellipsis */}
          <button className="p-2" aria-label="More options">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="absolute left-0 top-16 w-full z-50 flex justify-center md:hidden">
          <div className="bg-white rounded-xl shadow-lg w-80 p-6 flex flex-col gap-4">
            <div>
              <div className="text-xs text-gray-400 tracking-widest mb-4">
                ALL BOARDS (3)
              </div>
              <ul className="flex flex-col gap-2">
                {boards.map((board) => (
                  <li key={board.name}>
                    <button
                      className={`flex items-center gap-3 w-full px-4 py-2 rounded-full text-left ${
                        board.active
                          ? "bg-[#635FC7] text-white"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      <IconBoardIcon
                        className={`w-5 h-5 ${
                          board.active ? "text-white" : "text-[#635FC7]"
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          board.active ? "text-white" : "text-[#635FC7]"
                        }`}
                      >
                        {board.name}
                      </span>
                    </button>
                  </li>
                ))}
                <li>
                  <button className="flex items-center gap-3 w-full px-4 py-2 rounded-full text-[#635FC7] hover:bg-[#635FC7]/10 font-medium">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="#635FC7"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <rect x="11" y="4" width="2" height="16" rx="1" />
                      <rect x="4" y="11" width="16" height="2" rx="1" />
                    </svg>
                    + Create New Board
                  </button>
                </li>
              </ul>
            </div>
            <div className="bg-gray-100 rounded-lg px-4 py-3 flex justify-center">
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
