"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import LogoMobile from "../../../images/LogoMobile";
import Logo from "../../../images/Logo";
import IconBoardIcon from "../../ui/Icon/IconBoardIcon";
import ThemeToggle from "../../ui/ThemeToggle/ThemeToggle";
import Button from "../../ui/Button/Button";
import { useModal } from "../../../providers/ModalProvider";
import AddTaskModal from "../../ui/Modal/AddTaskModal";
import EditBoardModal from "../../ui/Modal/EditBoardModal";
import DeleteModal from "../../ui/Modal/DeleteModal";

export interface Board {
  id?: string;
  name: string;
  active: boolean;
  columns?: { id: string; name: string }[]; // for EditBoardModal
}

interface HeaderProps {
  boards: Board[];
  adminOnlyLogo?: boolean;
}

const Header: React.FC<HeaderProps> = ({ boards, adminOnlyLogo = false }) => {
  const { openModal, closeModal } = useModal();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [ellipsisOpen, setEllipsisOpen] = useState(false);
  const ellipsisRef = React.useRef<HTMLDivElement>(null);

  // Find the active board
  const activeBoard = boards.find((b) => b.active) ||
    boards[0] || { name: "Board", columns: [] };

  // Handlers for modals
  const handleAddTask = () => {
    openModal(
      <AddTaskModal
        columns={activeBoard.columns || []}
        boardId={activeBoard.id ?? ""}
        onCreate={async (payload: {
          title: string;
          description: string;
          columnId: string;
          subtasks: { title: string }[];
          boardId: string;
        }) => {
          try {
            await fetch("/api/tasks", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: payload.title,
                description: payload.description,
                columnId: payload.columnId,
                subtasks: payload.subtasks,
                boardId: payload.boardId,
              }),
            });
            closeModal();
            // Refresh the page data to reflect the new task
            router.refresh();
          } catch (err) {
            console.error("Failed to create task:", err);
            // still close modal on error? keep open so user can retry — here we keep it open
          }
        }}
      />
    );
  };

  const handleEditBoard = () => {
    openModal(
      <EditBoardModal
        board={{
          name: activeBoard.name,
          columns: activeBoard.columns || [
            { id: "1", name: "Todo" },
            { id: "2", name: "Doing" },
            { id: "3", name: "Done" },
          ],
        }}
        onEdit={async (payload: {
          name: string;
          columns: { name: string }[];
        }) => {
          try {
            if (!activeBoard.id) throw new Error("Missing board id");
            await fetch(`/api/boards/${activeBoard.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            closeModal();
            router.refresh();
          } catch (err) {
            console.error("Failed to update board:", err);
          }
        }}
      />
    );
    setEllipsisOpen(false);
  };

  const handleDeleteBoard = () => {
    openModal(
      <DeleteModal
        type="board"
        name={activeBoard.name}
        onDelete={async () => {
          try {
            if (!activeBoard.id) throw new Error("Missing board id");
            await fetch(`/api/boards/${activeBoard.id}`, {
              method: "DELETE",
            });
            closeModal();
            router.refresh();
          } catch (err) {
            console.error("Failed to delete board:", err);
          }
        }}
        onCancel={closeModal}
        open={true}
      />
    );
    setEllipsisOpen(false);
  };

  if (adminOnlyLogo) {
    // Logout handler
    const handleLogout = () => {
      signOut({ callbackUrl: "/signin" });
    };

    return (
      <header className="w-full border-b border-gray-200  bg-white px-4 py-2 flex items-center justify-between md:px-8 md:py-0 md:h-24">
        {/* Desktop: Logo + Logout */}
        <div className="hidden md:flex items-center">
          <Logo />
        </div>
        <div className="hidden md:flex items-center ml-auto">
          <Button
            variant="secondary"
            className="ml-4 px-4 py-2 text-sm font-medium"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
        {/* Mobile: Logo + Logout */}
        <div className="flex md:hidden items-center w-full justify-between">
          <LogoMobile />
          <Button
            variant="secondary"
            className="ml-4 px-3 py-1 text-sm font-medium"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </header>
    );
  }

  return (
    <header className="w-full border-b border-gray-200 bg-white px-4 py-2 flex items-center justify-between md:px-8 md:py-0 md:h-24">
      <div className="md:h-full md:flex-grow flex md:align-middle md:justify-end w-full justify-between">
        {/* Mobile: LogoMobile + Board Name Dropdown */}
        <div className="flex items-center gap-2 md:hidden">
          <LogoMobile />
          <button
            className="flex items-center ml-2"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Open board menu"
          >
            <span className="font-bold text-lg text-black select-none">
              {boards.find((b) => b.active)?.name ||
                (boards[0]?.name ?? "Board")}
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
        {/* Desktop: Active Board Name */}
        <div className="hidden md:flex items-center ml-6 flex-grow">
          <span className="font-bold text-lg text-black select-none mr-4">
            {boards.find((b) => b.active)?.name || (boards[0]?.name ?? "Board")}
          </span>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            variant="secondary"
            className="font-medium px-6 py-2 text-sm"
            onClick={handleAddTask}
          >
            + Add New Task
          </Button>
          {/* Vertical Ellipsis */}
          <div className="relative" ref={ellipsisRef}>
            <Button
              className="p-2 w-10 h-10 flex items-center justify-center"
              aria-label="More options"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                setEllipsisOpen((v) => !v);
              }}
            >
              <svg
                className="w-6 h-6 text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </Button>
            {ellipsisOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 flex flex-col py-2">
                <button
                  className="text-gray-700 px-4 py-2 text-left hover:bg-gray-100"
                  onClick={handleEditBoard}
                >
                  Edit Board
                </button>
                <button
                  className="text-red-500 px-4 py-2 text-left hover:bg-red-50"
                  onClick={handleDeleteBoard}
                >
                  Delete Board
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Add Task Button */}
          <Button
            className="bg-main-purple/10 text-main-purple p-2 rounded-full w-10 h-10 flex items-center justify-center"
            aria-label="Add New Task"
            variant="secondary"
            style={{ backgroundColor: "rgba(99,95,199,0.10)" }}
            onClick={handleAddTask}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <rect x="11" y="4" width="2" height="16" rx="1" />
              <rect x="4" y="11" width="16" height="2" rx="1" />
            </svg>
          </Button>
          {/* Vertical Ellipsis */}
          <div className="relative" ref={ellipsisRef}>
            <Button
              className="p-2 w-10 h-10 flex items-center justify-center"
              aria-label="More options"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                setEllipsisOpen((v) => !v);
              }}
            >
              <svg
                className="w-6 h-6 text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </Button>
            {ellipsisOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 flex flex-col py-2">
                <button
                  className="text-gray-700 px-4 py-2 text-left hover:bg-gray-100"
                  onClick={handleEditBoard}
                >
                  Edit Board
                </button>
                <button
                  className="text-red-500 px-4 py-2 text-left hover:bg-red-50"
                  onClick={handleDeleteBoard}
                >
                  Delete Board
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="absolute left-0 top-16 w-full z-50 flex justify-center md:hidden">
          <div className="bg-white rounded-xl shadow-lg w-80 p-6 flex flex-col gap-4">
            <div>
              <div className="text-xs text-gray-400 tracking-widest mb-4">
                ALL BOARDS ({boards.length})
              </div>
              <ul className="flex flex-col gap-2">
                {boards.map((board) => (
                  <li key={board.name}>
                    <Button
                      className={`flex items-center gap-3 w-full px-4 py-2 rounded-full text-left ${
                        board.active
                          ? "bg-main-purple text-white"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                      variant="secondary"
                    >
                      <IconBoardIcon
                        className={`w-5 h-5 ${
                          board.active ? "text-white" : "text-main-purple"
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          board.active ? "text-white" : "text-main-purple"
                        }`}
                      >
                        {board.name}
                      </span>
                    </Button>
                  </li>
                ))}
                <li>
                  <Button
                    className="flex items-center gap-3 w-full px-4 py-2 rounded-full text-main-purple hover:bg-main-purple/10 font-medium"
                    variant="secondary"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <rect x="11" y="4" width="2" height="16" rx="1" />
                      <rect x="4" y="11" width="16" height="2" rx="1" />
                    </svg>
                    + Create New Board
                  </Button>
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
