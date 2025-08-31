"use client";
import React, { useEffect, useReducer, useState } from "react";
import AddBoardModal from "@/components/ui/Modal/AddBoardModal";
import EditBoardModal from "@/components/ui/Modal/EditBoardModal";
import DeleteModal from "@/components/ui/Modal/DeleteModal";

type TeamOption = { id: string; name: string };
type Board = {
  id: string;
  name: string;
  teams?: TeamOption[];
  columns?: { id?: string; name: string }[];
};

type BoardsState = {
  boards: Board[];
  loading: boolean;
  error: string | null;
  showAdd: boolean;
  adding: boolean;
  addError: string | null;
  showEdit: boolean;
  editingBoard: Board | null;
  editing: boolean;
  editError: string | null;
  showDelete: boolean;
  deletingBoard: Board | null;
  deleting: boolean;
  deleteError: string | null;
};

const initialBoardsState: BoardsState = {
  boards: [],
  loading: true,
  error: null,
  showAdd: false,
  adding: false,
  addError: null,
  showEdit: false,
  editingBoard: null,
  editing: false,
  editError: null,
  showDelete: false,
  deletingBoard: null,
  deleting: false,
  deleteError: null,
};

function boardsReducer(
  state: BoardsState,
  action: { type: string; [key: string]: any }
): BoardsState {
  switch (action.type) {
    case "SET_BOARDS":
      return {
        ...state,
        boards: Array.isArray(action.boards)
          ? action.boards.map((b: Board) => ({
              ...b,
              columns: Array.isArray(b.columns) ? b.columns : [],
            }))
          : [],
      };
    case "SET_LOADING":
      return { ...state, loading: action.loading };
    case "SET_ERROR":
      return { ...state, error: action.error };
    case "SHOW_ADD":
      return { ...state, showAdd: true };
    case "HIDE_ADD":
      return { ...state, showAdd: false, addError: null };
    case "SET_ADDING":
      return { ...state, adding: action.adding };
    case "SET_ADD_ERROR":
      return { ...state, addError: action.error };
    case "ADD_BOARD":
      return {
        ...state,
        boards: [
          ...state.boards,
          {
            ...action.board,
            columns: Array.isArray(action.board.columns)
              ? action.board.columns
              : [],
          },
        ],
      };
    case "SHOW_EDIT":
      return { ...state, showEdit: true, editingBoard: action.board };
    case "HIDE_EDIT":
      return {
        ...state,
        showEdit: false,
        editingBoard: null,
        editError: null,
      };
    case "SET_EDITING":
      return { ...state, editing: action.editing };
    case "SET_EDIT_ERROR":
      return { ...state, editError: action.error };
    case "UPDATE_BOARD":
      return {
        ...state,
        boards: state.boards.map((b) =>
          b.id === action.board.id ? action.board : b
        ),
      };
    case "SHOW_DELETE":
      return { ...state, showDelete: true, deletingBoard: action.board };
    case "HIDE_DELETE":
      return {
        ...state,
        showDelete: false,
        deletingBoard: null,
        deleteError: null,
      };
    case "SET_DELETING":
      return { ...state, deleting: action.deleting };
    case "SET_DELETE_ERROR":
      return { ...state, deleteError: action.error };
    case "REMOVE_BOARD":
      return {
        ...state,
        boards: state.boards.filter((b) => b.id !== action.id),
      };
    default:
      return state;
  }
}

export default function BoardsSection() {
  const [boardsState, dispatchBoards] = useReducer(
    boardsReducer,
    initialBoardsState
  );
  const [teams, setTeams] = useState<TeamOption[]>([]);

  // Fetch boards
  useEffect(() => {
    async function fetchBoards() {
      dispatchBoards({ type: "SET_LOADING", loading: true });
      try {
        dispatchBoards({ type: "SET_ERROR", error: null });
        const res = await fetch("/api/boards");
        if (res.ok) {
          const data = await res.json();
          dispatchBoards({ type: "SET_BOARDS", boards: data });
        } else {
          dispatchBoards({
            type: "SET_ERROR",
            error: "Failed to fetch boards.",
          });
        }
      } catch (err) {
        dispatchBoards({
          type: "SET_ERROR",
          error: "An error occurred while fetching boards.",
        });
        // eslint-disable-next-line no-console
        console.error("Fetch boards error:", err);
      } finally {
        dispatchBoards({ type: "SET_LOADING", loading: false });
      }
    }
    fetchBoards();
  }, []);

  // Fetch teams for team selection in modals
  useEffect(() => {
    async function fetchTeams() {
      try {
        const res = await fetch("/api/teams");
        if (res.ok) {
          const data = await res.json();
          setTeams(Array.isArray(data) ? data : []);
        } else {
          // eslint-disable-next-line no-console
          console.error("Failed to fetch teams for boards");
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Fetch teams error:", err);
      }
    }
    fetchTeams();
  }, []);

  // Handlers for add/edit/delete
  async function handleCreateBoard(form: {
    name: string;
    columns: { name: string }[];
    teamIds: string[];
  }) {
    dispatchBoards({ type: "SET_ADDING", adding: true });
    dispatchBoards({ type: "SET_ADD_ERROR", error: null });
    try {
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const newBoard = await res.json();
        dispatchBoards({ type: "ADD_BOARD", board: newBoard });
        dispatchBoards({ type: "HIDE_ADD" });
      } else {
        const errorData = await res.json().catch(() => ({}));
        dispatchBoards({
          type: "SET_ADD_ERROR",
          error: errorData?.error || "Failed to create board.",
        });
      }
    } catch (err) {
      dispatchBoards({
        type: "SET_ADD_ERROR",
        error: "An error occurred while creating the board.",
      });
      // eslint-disable-next-line no-console
      console.error("Create board error:", err);
    } finally {
      dispatchBoards({ type: "SET_ADDING", adding: false });
    }
  }

  async function handleEditBoard(form: {
    name: string;
    columns?: { id?: string; name: string }[];
    teamIds?: string[];
  }) {
    if (!boardsState.editingBoard) return;
    dispatchBoards({ type: "SET_EDITING", editing: true });
    dispatchBoards({ type: "SET_EDIT_ERROR", error: null });
    try {
      const res = await fetch(`/api/boards/${boardsState.editingBoard.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const updatedBoard = await res.json();
        dispatchBoards({ type: "UPDATE_BOARD", board: updatedBoard });
        dispatchBoards({ type: "HIDE_EDIT" });
      } else {
        const errorData = await res.json().catch(() => ({}));
        dispatchBoards({
          type: "SET_EDIT_ERROR",
          error: errorData?.error || "Failed to update board.",
        });
      }
    } catch (err) {
      dispatchBoards({
        type: "SET_EDIT_ERROR",
        error: "An error occurred while updating the board.",
      });
      console.error("Edit board error:", err);
    } finally {
      dispatchBoards({ type: "SET_EDITING", editing: false });
    }
  }

  async function handleDeleteBoard() {
    if (!boardsState.deletingBoard) return;
    dispatchBoards({ type: "SET_DELETING", deleting: true });
    dispatchBoards({ type: "SET_DELETE_ERROR", error: null });
    try {
      const res = await fetch(`/api/boards/${boardsState.deletingBoard.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        dispatchBoards({
          type: "REMOVE_BOARD",
          id: boardsState.deletingBoard.id,
        });
        dispatchBoards({ type: "HIDE_DELETE" });
      } else {
        const errorData = await res.json().catch(() => ({}));
        dispatchBoards({
          type: "SET_DELETE_ERROR",
          error: errorData?.error || "Failed to delete board.",
        });
      }
    } catch (err) {
      dispatchBoards({
        type: "SET_DELETE_ERROR",
        error: "An error occurred while deleting the board.",
      });
      // eslint-disable-next-line no-console
      console.error("Delete board error:", err);
    } finally {
      dispatchBoards({ type: "SET_DELETING", deleting: false });
    }
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Boards</h2>
        <button
          className="bg-main-purple text-white px-4 py-2 rounded hover:bg-main-purple-light transition-colors"
          onClick={() => dispatchBoards({ type: "SHOW_ADD" })}
        >
          + Add Board
        </button>
      </div>
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-900 shadow">
        {boardsState.error && (
          <p className="text-center text-red-500 mb-2">{boardsState.error}</p>
        )}
        {boardsState.loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            Loading boards...
          </p>
        ) : boardsState.boards.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No boards found.
          </p>
        ) : (
          <ul>
            {boardsState.boards
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((board) => (
                <li
                  key={board.id}
                  className="py-2 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center"
                >
                  <span>{board.name}</span>
                  <div className="flex gap-2">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => {
                        dispatchBoards({ type: "SHOW_EDIT", board });
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => {
                        dispatchBoards({ type: "SHOW_DELETE", board });
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
      {/* Add Board Modal */}
      {boardsState.showAdd && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => dispatchBoards({ type: "HIDE_ADD" })}
              aria-label="Close"
            >
              ×
            </button>
            <AddBoardModal teams={teams} onCreate={handleCreateBoard} />
            {boardsState.addError && (
              <div className="absolute left-0 right-0 top-0 mt-2 flex justify-center z-20">
                <span className="bg-red-100 text-red-700 px-4 py-2 rounded shadow">
                  {boardsState.addError}
                </span>
              </div>
            )}
            {boardsState.adding && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-gray-900/60 z-10">
                <span className="text-main-purple font-semibold">
                  Creating...
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Board Modal */}
      {boardsState.showEdit && boardsState.editingBoard && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => dispatchBoards({ type: "HIDE_EDIT" })}
              aria-label="Close"
            >
              ×
            </button>
            <EditBoardModal
              board={{
                name: boardsState.editingBoard.name,
                columns: Array.isArray(boardsState.editingBoard.columns)
                  ? boardsState.editingBoard.columns.map((c) => ({
                      id: c.id,
                      name: c.name,
                    }))
                  : [],
                teamIds: boardsState.editingBoard.teams?.map((t) => t.id) || [],
              }}
              teams={teams}
              onEdit={(form) => {
                handleEditBoard(form);
              }}
            />
            {boardsState.editError && (
              <div className="absolute left-0 right-0 top-0 mt-2 flex justify-center z-20">
                <span className="bg-red-100 text-red-700 px-4 py-2 rounded shadow">
                  {boardsState.editError}
                </span>
              </div>
            )}
            {boardsState.editing && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-gray-900/60 z-10">
                <span className="text-main-purple font-semibold">
                  Updating...
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Board Modal */}
      {boardsState.showDelete && boardsState.deletingBoard && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <DeleteModal
            type="board"
            name={boardsState.deletingBoard.name}
            open={boardsState.showDelete}
            onDelete={handleDeleteBoard}
            onCancel={() => {
              dispatchBoards({ type: "HIDE_DELETE" });
            }}
          />
          {boardsState.deleteError && (
            <div className="absolute left-0 right-0 top-0 mt-2 flex justify-center z-20">
              <span className="bg-red-100 text-red-700 px-4 py-2 rounded shadow">
                {boardsState.deleteError}
              </span>
            </div>
          )}
          {boardsState.deleting && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-gray-900/60 z-10">
              <span className="text-main-purple font-semibold">
                Deleting...
              </span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
